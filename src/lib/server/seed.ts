import "server-only"
import { buildQuote } from "@/lib/domain/pricing"
import { SELF_DRIVE_POLICY } from "@/lib/domain/policy"
import { addDays, toLocalParts } from "@/lib/domain/time"
import type { Store } from "./store"

/** Synthetic demo booking so Manage booking can be explored locally. */
export const DEMO_BOOKING = { reference: "RR-DEMO42", phone: "024 123 4567", email: "ama.demo@example.com" }

export function seedDemo(store: Store, now = new Date()) {
  if (store.bookings.has(DEMO_BOOKING.reference)) return
  const today = toLocalParts(now).date
  const trip = {
    location: "accra-airport-shell" as const,
    pickupDate: addDays(today, 5),
    pickupTime: "10:00",
    returnDate: addDays(today, 8),
    returnTime: "10:00",
    drive: "self-drive" as const,
    destinations: "Accra, Cape Coast",
    intercity: "yes" as const,
  }
  const quote = buildQuote(trip, "saloon")
  if (quote.kind !== "priced") return
  store.bookings.set(DEMO_BOOKING.reference, {
    reference: DEMO_BOOKING.reference,
    createdAt: now.toISOString(),
    trip,
    categoryId: "saloon",
    drive: "self-drive",
    renter: { fullName: "Ama Mensah (demo)", phone: "+233241234567", email: DEMO_BOOKING.email, requests: "" },
    quote,
    policyVersion: SELF_DRIVE_POLICY.version,
    status: "confirmed",
    payment: { id: "pay_demo_seed", status: "succeeded", amount: quote.payNow, updatedAt: now.toISOString() },
    refund: { status: "none" },
    amendmentsUsed: 0,
  })
}
