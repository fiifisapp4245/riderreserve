"use server"

import { randomBytes } from "node:crypto"
import { cookies } from "next/headers"
import { z } from "zod"
import { toView, type BookingView } from "@/lib/domain/booking"
import { checkAvailability, currentHolds, type Availability } from "@/lib/domain/availability"
import { getLocation } from "@/lib/domain/business"
import { eligibleCategories, type CategoryId } from "@/lib/domain/categories"
import { normalizePhone } from "@/lib/domain/contact"
import { estimateRefund, type RefundEstimate } from "@/lib/domain/policy"
import { buildQuote, isDemoMode, type Quote } from "@/lib/domain/pricing"
import { tripInstants, tripSchema, validateTrip, type Trip } from "@/lib/domain/trip"
import {
  createBooking,
  demoPaymentProvider,
  retryPayment,
  syncPayment,
  type CreateBookingInput,
  type PaymentProvider,
} from "@/lib/server/bookings"
import { fleetHolds } from "@/lib/server/fleet"
import { seedDemo } from "@/lib/server/seed"
import { getStore, rateLimit } from "@/lib/server/store"
import {
  canAccess,
  createSession,
  resendCode,
  sessionReferences,
  SESSION_TTL_MS,
  startVerification,
  verifyCode,
} from "@/lib/server/verification"

const ACCESS_COOKIE = "rr_access"

function store() {
  const s = getStore()
  if (isDemoMode()) seedDemo(s)
  return s
}

/** Real gateway not connected yet: production fails safely with no provider. */
function paymentProvider(): PaymentProvider | null {
  return isDemoMode() ? demoPaymentProvider(store()) : null
}

/** Messaging (SMS/WhatsApp/email) adapter. Never logs codes. */
function messaging(): ((to: string, code: string) => void) | null {
  if (isDemoMode()) return () => {}
  return null
}

async function accessToken() {
  return (await cookies()).get(ACCESS_COOKIE)?.value
}

async function grantAccess(references: string[]) {
  const s = store()
  const jar = await cookies()
  const existing = sessionReferences(s, jar.get(ACCESS_COOKIE)?.value)
  const token = createSession(s, [...new Set([...existing, ...references])])
  jar.set(ACCESS_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  })
}

// ── Quotes ───────────────────────────────────────────────────────────────

export type CategoryQuote = { categoryId: CategoryId; quote: Quote; availability: Availability }

export async function quoteTrip(trip: Partial<Trip>): Promise<{ ok: true; quotes: CategoryQuote[] } | { ok: false }> {
  const parsed = tripSchema.safeParse(trip)
  if (!parsed.success || Object.keys(validateTrip(parsed.data)).length) return { ok: false }
  const { pickup, ret } = tripInstants(parsed.data)
  const holds = fleetHolds()
  return {
    ok: true,
    quotes: eligibleCategories(parsed.data.drive).map((c) => ({
      categoryId: c.id,
      quote: buildQuote(parsed.data, c.id),
      availability: checkAvailability(holds, c.id, parsed.data.location, pickup, ret),
    })),
  }
}

/** Which locations have this category out right now (vehicle pages). null = no fleet data. */
export async function categoryStatusNow(categoryId: CategoryId) {
  const holds = currentHolds(fleetHolds(), categoryId, new Date())
  if (!holds) return null
  return holds.map((h) => ({ location: getLocation(h.location)?.name ?? h.location, reason: h.reason, until: h.to }))
}

// ── Booking & payment ────────────────────────────────────────────────────

export async function submitBooking(input: CreateBookingInput) {
  const s = store()
  const result = createBooking(s, input, paymentProvider(), new Date(), fleetHolds())
  if (result.ok) await grantAccess([result.reference])
  return result
}

export async function getBooking(reference: string): Promise<BookingView | null> {
  const s = store()
  if (!canAccess(s, await accessToken(), reference)) return null
  const provider = paymentProvider()
  const b = provider ? syncPayment(s, reference, provider) : s.bookings.get(reference)
  return b ? toView(b) : null
}

export async function retryBookingPayment(reference: string) {
  const s = store()
  const provider = paymentProvider()
  if (!provider || !canAccess(s, await accessToken(), reference)) return null
  return retryPayment(s, reference, provider) ?? null
}

/** DEMO ONLY: stands in for the hosted payment page + provider callback. */
export async function demoSetPaymentOutcome(paymentId: string, outcome: "succeeded" | "failed" | "cancelled" | "pending") {
  if (!isDemoMode()) throw new Error("Demo payments are disabled")
  const s = store()
  const p = s.payments.get(paymentId)
  if (!p || !canAccess(s, await accessToken(), p.bookingRef)) return null
  if (p.status === "pending") p.status = outcome
  return p.bookingRef
}

export async function demoPaymentInfo(paymentId: string) {
  if (!isDemoMode()) return null
  const s = store()
  const p = s.payments.get(paymentId)
  if (!p || !canAccess(s, await accessToken(), p.bookingRef)) return null
  return { bookingRef: p.bookingRef, amount: p.amount, status: p.status }
}

// ── Guest access ─────────────────────────────────────────────────────────

const GENERIC_SENT =
  "If the details match a booking, we've sent a 6-digit code to that phone number or email. It expires in 10 minutes."

export async function startAccess(input: { reference?: string; contact: string }) {
  const send = messaging()
  if (!send) {
    return { ok: false as const, message: "Online booking access isn't available yet. Please call or WhatsApp us and we'll help." }
  }
  const contact = input.contact.trim()
  if (!contact) return { ok: false as const, message: "Enter the phone number or email you used to book." }
  if (!contact.includes("@") && !normalizePhone(contact).ok) {
    return { ok: false as const, message: "Enter a valid phone number or email address." }
  }
  const res = startVerification(store(), input, { demo: isDemoMode(), send })
  if (!res.ok) {
    return {
      ok: false as const,
      message: res.error === "rate_limited" ? "Too many attempts. Please wait 15 minutes, or contact us." : "Check your details and try again.",
    }
  }
  return { ok: true as const, challengeId: res.challengeId, message: GENERIC_SENT, demoCode: res.demoCode }
}

export async function resendAccess(challengeId: string, contact: string) {
  const send = messaging()
  if (!send) return { ok: false as const, message: "Codes can't be sent right now." }
  const res = resendCode(store(), challengeId, contact, { demo: isDemoMode(), send })
  if (res.ok) return { ok: true as const, message: "A new code has been sent if the details match.", demoCode: res.demoCode }
  const message =
    res.error === "cooldown"
      ? `Please wait ${Math.ceil((res.retryInMs ?? 0) / 1000)} seconds before requesting another code.`
      : res.error === "too_many_sends"
        ? "You've requested the maximum number of codes. Start again or contact us."
        : "This code has expired. Start again to get a new one."
  return { ok: false as const, message }
}

export async function verifyAccess(challengeId: string, code: string) {
  if (!/^\d{6}$/.test(code.trim())) return { ok: false as const, message: "Enter the 6-digit code." }
  const s = store()
  if (!rateLimit(s, `verify:${challengeId}`, 10, 15 * 60_000)) {
    return { ok: false as const, message: "Too many attempts. Start again later." }
  }
  const res = verifyCode(s, challengeId, code)
  if (!res.ok) {
    const message =
      res.error === "incorrect"
        ? `That code isn't right. ${res.attemptsLeft} attempt${res.attemptsLeft === 1 ? "" : "s"} left.`
        : res.error === "locked"
          ? "Too many incorrect codes. Start again to get a new code."
          : "This code has expired or was already used. Start again to get a new one."
    return { ok: false as const, message }
  }
  await grantAccess(res.references)
  return { ok: true as const, references: res.references }
}

export async function myBookings(): Promise<BookingView[]> {
  const s = store()
  const refs = sessionReferences(s, await accessToken())
  return refs.flatMap((r) => {
    const b = s.bookings.get(r)
    return b ? [toView(b)] : []
  })
}

export async function endAccess() {
  const s = store()
  const jar = await cookies()
  const token = jar.get(ACCESS_COOKIE)?.value
  if (token) s.sessions.delete(token)
  jar.delete(ACCESS_COOKIE)
}

// ── Cancellation ─────────────────────────────────────────────────────────

export async function cancellationPreview(reference: string): Promise<RefundEstimate | null> {
  const s = store()
  if (!canAccess(s, await accessToken(), reference)) return null
  const b = s.bookings.get(reference)
  if (!b || b.status !== "confirmed") return null
  return estimateRefund(b.drive, b.payment.amount, tripInstants(b.trip).pickup)
}

export async function cancelBooking(reference: string, expectedPercent: number) {
  const s = store()
  if (!canAccess(s, await accessToken(), reference)) return { ok: false as const, message: "You don't have access to this booking." }
  const b = s.bookings.get(reference)
  if (!b || b.status !== "confirmed") return { ok: false as const, message: "This booking can't be cancelled online." }
  const est = estimateRefund(b.drive, b.payment.amount, tripInstants(b.trip).pickup)
  if (est.kind === "unresolved") return { ok: false as const, message: est.reason }
  const percent = est.kind === "tier" ? est.percent : 0
  if (percent !== expectedPercent) {
    return { ok: false as const, message: "The refund amount changed while you were reviewing. Please check the new amount." }
  }
  b.status = "cancelled"
  b.refund = percent > 0 ? { status: "requested", amount: est.kind === "tier" ? est.refundable : 0 } : { status: "none" }
  return { ok: true as const }
}

// ── Business & long-term enquiries ───────────────────────────────────────

const enquirySchema = z
  .object({
    audience: z.enum(["company", "individual"]),
    companyName: z.string().trim().max(160).optional().default(""),
    contactName: z.string().trim().min(1, "Enter a contact name.").max(120),
    email: z.string().trim().min(1, "Enter an email address.").pipe(z.email("Enter an email address in the format name@example.com.")),
    phone: z.string(),
    vehicles: z
      .array(z.object({ categoryId: z.string(), quantity: z.number().int().min(1).max(200) }))
      .min(1, "Add at least one vehicle."),
    rentalType: z.enum(["self-drive", "chauffeur", "unsure"]),
    durationValue: z.number().int().min(1, "Enter a duration of at least 1."),
    durationUnit: z.enum(["days", "weeks", "months"]),
    startDate: z.string().min(1, "Enter a preferred start date."),
    location: z.string().trim().min(1, "Enter the project or pickup location.").max(200),
    requirements: z.string().max(1000).optional().default(""),
  })
  .superRefine((v, ctx) => {
    if (v.audience === "company" && !v.companyName) {
      ctx.addIssue({ code: "custom", path: ["companyName"], message: "Enter your company name." })
    }
  })

export type EnquiryInput = z.input<typeof enquirySchema>

export async function submitEnquiry(input: EnquiryInput) {
  const parsed = enquirySchema.safeParse(input)
  const errors: Record<string, string> = {}
  if (!parsed.success) for (const i of parsed.error.issues) errors[i.path[0] as string] ??= i.message
  const phone = normalizePhone(input.phone ?? "")
  if (!phone.ok) errors.phone = phone.error
  if (Object.keys(errors).length || !parsed.success || !phone.ok) return { ok: false as const, errors }

  if (!isDemoMode()) {
    return {
      ok: false as const,
      errors: {},
      message: "We couldn't send your enquiry online. Your details are still here — please try again, or call or WhatsApp us.",
    }
  }
  const reference = "ENQ-" + randomBytes(3).toString("hex").toUpperCase()
  store().enquiries.set(reference, { reference, createdAt: new Date().toISOString(), data: { ...parsed.data, phone: phone.e164 } })
  return { ok: true as const, reference }
}
