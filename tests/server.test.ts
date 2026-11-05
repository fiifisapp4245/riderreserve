import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createBooking, demoPaymentProvider, retryPayment, syncPayment } from "@/lib/server/bookings"
import { createStore } from "@/lib/server/store"
import { canAccess, createSession, OTP_MAX_ATTEMPTS, resendCode, startVerification, verifyCode } from "@/lib/server/verification"
import { SELF_DRIVE_POLICY } from "@/lib/domain/policy"

const NOW = new Date("2026-11-05T09:00:00Z")
const input = (key = "k1") => ({
  trip: {
    location: "accra-airport-shell" as const,
    drive: "self-drive" as const,
    pickupDate: "2026-11-07",
    pickupTime: "10:00",
    returnDate: "2026-11-09",
    returnTime: "10:00",
    destinations: "Accra",
    intercity: "no" as const,
  },
  categoryId: "saloon",
  renter: { fullName: "Test Renter", phone: "024 123 4567", email: "t@example.com", requests: "" },
  acceptedPolicyVersion: SELF_DRIVE_POLICY.version,
  expectedPayNow: 900,
  idempotencyKey: key,
})

beforeEach(() => {
  process.env.NEXT_PUBLIC_DEMO_MODE = "true"
})
afterEach(() => {
  delete process.env.NEXT_PUBLIC_DEMO_MODE
})

describe("booking creation", () => {
  it("is idempotent for retried submissions", () => {
    const store = createStore()
    const p = demoPaymentProvider(store)
    const a = createBooking(store, input(), p, NOW)
    const b = createBooking(store, input(), p, NOW)
    expect(a.ok && b.ok && a.reference === b.reference).toBe(true)
    expect(store.bookings.size).toBe(1)
    expect(store.payments.size).toBe(1)
  })

  it("rejects a stale client price", () => {
    const store = createStore()
    const r = createBooking(store, { ...input(), expectedPayNow: 1 }, demoPaymentProvider(store), NOW)
    expect(r.ok || r.code).toBe("quote_changed")
  })

  it("requires explicit policy acceptance", () => {
    const store = createStore()
    const r = createBooking(store, { ...input(), acceptedPolicyVersion: null }, demoPaymentProvider(store), NOW)
    expect(r.ok || r.code).toBe("policy")
  })

  it("fails safely when no payment provider is configured", () => {
    const store = createStore()
    const r = createBooking(store, input(), null, NOW)
    expect(r.ok || r.code).toBe("payments_unavailable")
    expect(store.bookings.size).toBe(0)
  })

  it("re-validates trip rules on the server", () => {
    const store = createStore()
    const bad = { ...input(), trip: { ...input().trip, pickupTime: "05:00" } }
    expect(createBooking(store, bad, demoPaymentProvider(store), NOW).ok).toBe(false)
  })
})

describe("payment state", () => {
  it("only confirms after the provider reports success, and supports retry", () => {
    const store = createStore()
    const p = demoPaymentProvider(store)
    const r = createBooking(store, input(), p, NOW)
    if (!r.ok) throw new Error(r.error)
    const booking = store.bookings.get(r.reference)!
    expect(booking.status).toBe("pending_payment")

    store.payments.get(booking.payment.id)!.status = "failed"
    syncPayment(store, r.reference, p)
    expect(booking.status).toBe("pending_payment")
    expect(booking.payment.status).toBe("failed")

    retryPayment(store, r.reference, p)
    expect(booking.payment.status).toBe("pending")
    store.payments.get(booking.payment.id)!.status = "succeeded"
    syncPayment(store, r.reference, p)
    expect(booking.status).toBe("confirmed")
    expect(booking.refund.status).toBe("none")
  })
})

describe("guest verification", () => {
  const setup = () => {
    const store = createStore()
    const r = createBooking(store, input(), demoPaymentProvider(store), NOW)
    if (!r.ok) throw new Error()
    return { store, ref: r.reference }
  }
  const opts = (send = vi.fn()) => ({ demo: true, send, now: NOW.getTime() })

  it("gives identical responses for unknown bookings and never sends to unknown contacts", () => {
    const { store } = setup()
    const send = vi.fn()
    const r = startVerification(store, { reference: "RR-NOPE", contact: "x@example.com" }, opts(send))
    expect(r.ok).toBe(true)
    expect(send).not.toHaveBeenCalled()
    if (r.ok) expect(verifyCode(store, r.challengeId, "000000", NOW.getTime()).ok).toBe(false)
  })

  it("grants access only after the correct code, once", () => {
    const { store, ref } = setup()
    const r = startVerification(store, { reference: ref, contact: "+233 24 123 4567" }, opts())
    if (!r.ok || !r.demoCode) throw new Error()
    expect(verifyCode(store, r.challengeId, r.demoCode, NOW.getTime())).toEqual({ ok: true, references: [ref] })
    expect(verifyCode(store, r.challengeId, r.demoCode, NOW.getTime()).ok).toBe(false) // reused
  })

  it("expires codes", () => {
    const { store, ref } = setup()
    const r = startVerification(store, { reference: ref, contact: "t@example.com" }, opts())
    if (!r.ok || !r.demoCode) throw new Error()
    const later = NOW.getTime() + 11 * 60_000
    expect(verifyCode(store, r.challengeId, r.demoCode, later)).toEqual({ ok: false, error: "expired" })
  })

  it("locks after too many wrong attempts", () => {
    const { store, ref } = setup()
    const r = startVerification(store, { reference: ref, contact: "t@example.com" }, opts())
    if (!r.ok || !r.demoCode) throw new Error()
    for (let i = 0; i < OTP_MAX_ATTEMPTS; i++) verifyCode(store, r.challengeId, "999999", NOW.getTime())
    expect(verifyCode(store, r.challengeId, r.demoCode, NOW.getTime())).toEqual({ ok: false, error: "locked" })
  })

  it("enforces a resend cooldown", () => {
    const { store, ref } = setup()
    const r = startVerification(store, { reference: ref, contact: "t@example.com" }, opts())
    if (!r.ok) throw new Error()
    expect(resendCode(store, r.challengeId, "t@example.com", opts()).ok).toBe(false)
    expect(resendCode(store, r.challengeId, "t@example.com", { ...opts(), now: NOW.getTime() + 61_000 }).ok).toBe(true)
  })

  it("rate-limits verification starts", () => {
    const { store, ref } = setup()
    const results = Array.from({ length: 6 }, () => startVerification(store, { reference: ref, contact: "t@example.com" }, opts()))
    expect(results.at(-1)).toEqual({ ok: false, error: "rate_limited" })
  })

  it("lost-code recovery finds bookings by verified contact", () => {
    const { store, ref } = setup()
    const r = startVerification(store, { contact: "T@Example.com" }, opts())
    if (!r.ok || !r.demoCode) throw new Error()
    expect(verifyCode(store, r.challengeId, r.demoCode, NOW.getTime())).toEqual({ ok: true, references: [ref] })
  })

  it("isolates booking ownership per session", () => {
    const { store, ref } = setup()
    const mine = createSession(store, [ref], NOW.getTime())
    const other = createSession(store, ["RR-OTHER1"], NOW.getTime())
    expect(canAccess(store, mine, ref, NOW.getTime())).toBe(true)
    expect(canAccess(store, other, ref, NOW.getTime())).toBe(false)
    expect(canAccess(store, undefined, ref, NOW.getTime())).toBe(false)
    expect(canAccess(store, mine, ref, NOW.getTime() + 31 * 60_000)).toBe(false)
  })
})
