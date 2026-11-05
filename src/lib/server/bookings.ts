import "server-only"
import { randomBytes } from "node:crypto"
import type { Booking, PaymentStatus } from "@/lib/domain/booking"
import { isCategoryEligible, type CategoryId } from "@/lib/domain/categories"
import { validateRenter, type Renter } from "@/lib/domain/contact"
import { buildQuote } from "@/lib/domain/pricing"
import { policyFor } from "@/lib/domain/policy"
import { checkAvailability, type FleetHold } from "@/lib/domain/availability"
import { tripInstants, tripSchema, validateItinerary, validateTrip, type Trip } from "@/lib/domain/trip"
import type { Store } from "./store"

/** Payment provider boundary. Swap the demo provider for the real gateway. */
export interface PaymentProvider {
  name: string
  createCheckout(input: { bookingRef: string; amount: number; idempotencyKey: string }): { paymentId: string; redirectUrl: string }
  /** Server-to-server status lookup. The browser redirect is never trusted. */
  getStatus(paymentId: string): PaymentStatus | undefined
}

export function demoPaymentProvider(store: Store): PaymentProvider {
  return {
    name: "demo",
    createCheckout({ bookingRef, amount, idempotencyKey }) {
      const existing = [...store.payments.values()].find((p) => p.idempotencyKey === idempotencyKey)
      if (existing) return { paymentId: existing.id, redirectUrl: `/pay/demo/${existing.id}` }
      const id = `pay_demo_${randomBytes(8).toString("hex")}`
      store.payments.set(id, { id, bookingRef, amount, status: "pending", idempotencyKey })
      return { paymentId: id, redirectUrl: `/pay/demo/${id}` }
    },
    getStatus: (id) => store.payments.get(id)?.status,
  }
}

function newReference(store: Store) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let ref: string
  do {
    ref = "RR-" + Array.from(randomBytes(6), (b) => alphabet[b % alphabet.length]).join("")
  } while (store.bookings.has(ref))
  return ref
}

export type CreateBookingInput = {
  trip: Partial<Trip>
  categoryId: string
  renter: Partial<Renter>
  acceptedPolicyVersion: string | null
  /** Quote total the customer saw; booking is refused if the server price differs. */
  expectedPayNow: number
  idempotencyKey: string
}

export type CreateBookingResult =
  | { ok: true; reference: string; redirectUrl: string }
  | { ok: false; error: string; code: "invalid" | "quote_changed" | "policy" | "unavailable" | "payments_unavailable" }

export function createBooking(
  store: Store,
  input: CreateBookingInput,
  provider: PaymentProvider | null,
  now = new Date(),
  holds: FleetHold[] | null = null,
): CreateBookingResult {
  // Idempotency: a retried submit returns the original booking, never a duplicate.
  const prior = store.idempotency.get(input.idempotencyKey)
  if (prior) {
    const b = store.bookings.get(prior)!
    return { ok: true, reference: b.reference, redirectUrl: `/pay/demo/${b.payment.id}` }
  }

  const tripParsed = tripSchema.safeParse(input.trip)
  if (
    !tripParsed.success ||
    Object.keys({ ...validateTrip(tripParsed.data, now), ...validateItinerary(tripParsed.data) }).length
  ) {
    return { ok: false, code: "invalid", error: "Your trip details are no longer valid. Please check your dates and times." }
  }
  const trip = tripParsed.data
  const categoryId = input.categoryId as CategoryId
  if (!isCategoryEligible(categoryId, trip.drive)) {
    return { ok: false, code: "invalid", error: "That category isn't available for the selected drive option." }
  }
  const { pickup, ret } = tripInstants(trip)
  if (checkAvailability(holds, categoryId, trip.location, pickup, ret).status === "unavailable") {
    return { ok: false, code: "unavailable", error: "That category is no longer available for your dates. Choose another or change your dates." }
  }
  const renter = validateRenter(input.renter)
  if (!renter.value) return { ok: false, code: "invalid", error: "Some of your details need attention." }

  const policy = policyFor(trip.drive)
  if (policy.status === "unresolved") {
    return {
      ok: false,
      code: "policy",
      error: "Online payment for this booking type is paused until its cancellation terms are confirmed. Contact us to book.",
    }
  }
  if (input.acceptedPolicyVersion !== policy.version) {
    return { ok: false, code: "policy", error: "Please read and accept the rental terms." }
  }

  const quote = buildQuote(trip, categoryId)
  if (quote.kind !== "priced") {
    return { ok: false, code: "unavailable", error: "Online pricing isn't available for this trip yet. Request a quote instead." }
  }
  if (quote.payNow !== input.expectedPayNow) {
    return { ok: false, code: "quote_changed", error: "The price for this trip has changed. Please review the new total." }
  }
  if (!provider) {
    return { ok: false, code: "payments_unavailable", error: "Online payment isn't connected yet. No booking was made and you have not been charged." }
  }

  const reference = newReference(store)
  const checkout = provider.createCheckout({ bookingRef: reference, amount: quote.payNow, idempotencyKey: input.idempotencyKey })
  const iso = now.toISOString()
  store.bookings.set(reference, {
    reference,
    createdAt: iso,
    trip,
    categoryId,
    drive: trip.drive,
    renter: renter.value,
    quote,
    policyVersion: policy.version,
    status: "pending_payment",
    payment: { id: checkout.paymentId, status: "pending", amount: quote.payNow, updatedAt: iso },
    refund: { status: "none" },
    amendmentsUsed: 0,
  })
  store.idempotency.set(input.idempotencyKey, reference)
  return { ok: true, reference, redirectUrl: checkout.redirectUrl }
}

/** Reconcile booking with the provider's authoritative payment status. */
export function syncPayment(store: Store, reference: string, provider: PaymentProvider, now = new Date()): Booking | undefined {
  const b = store.bookings.get(reference)
  if (!b) return undefined
  const status = provider.getStatus(b.payment.id)
  if (!status || status === b.payment.status) return b
  b.payment = { ...b.payment, status, updatedAt: now.toISOString() }
  if (status === "succeeded" && b.status === "pending_payment") b.status = "confirmed"
  if (status === "expired" && b.status === "pending_payment") b.status = "expired"
  return b
}

/** Start a new attempt after failure/cancellation, reusing the same booking. */
export function retryPayment(store: Store, reference: string, provider: PaymentProvider) {
  const b = store.bookings.get(reference)
  if (!b || b.status !== "pending_payment") return undefined
  if (!["failed", "cancelled"].includes(b.payment.status)) return `/pay/demo/${b.payment.id}`
  const checkout = provider.createCheckout({
    bookingRef: reference,
    amount: b.payment.amount,
    idempotencyKey: `${reference}:retry:${b.payment.id}`,
  })
  b.payment = { id: checkout.paymentId, status: "pending", amount: b.payment.amount, updatedAt: new Date().toISOString() }
  return checkout.redirectUrl
}
