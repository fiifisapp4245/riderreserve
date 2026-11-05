import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { checkAvailability, currentHolds, type FleetHold } from "@/lib/domain/availability"
import { createBooking, demoPaymentProvider } from "@/lib/server/bookings"
import { createStore } from "@/lib/server/store"
import { SELF_DRIVE_POLICY } from "@/lib/domain/policy"

const at = (s: string) => new Date(`2026-11-${s}:00Z`)
const holds: FleetHold[] = [
  { categoryId: "suv", location: "accra-airport-shell", from: at("07T08:00"), to: at("08T14:00"), reason: "On an airport transfer" },
  { categoryId: "suv", location: "accra-airport-shell", from: at("08T10:00"), to: at("09T09:00"), reason: "Booked for another trip" },
]

describe("availability", () => {
  it("is unavailable when a hold overlaps, returning the latest end", () => {
    const a = checkAvailability(holds, "suv", "accra-airport-shell", at("08T09:00"), at("10T09:00"))
    expect(a).toEqual({ status: "unavailable", reason: "Booked for another trip", availableFrom: at("09T09:00") })
  })

  it("is available when the trip starts as the hold ends", () => {
    expect(checkAvailability(holds, "suv", "accra-airport-shell", at("09T09:00"), at("10T09:00")).status).toBe("available")
  })

  it("only applies holds to the same category and location", () => {
    expect(checkAvailability(holds, "saloon", "accra-airport-shell", at("08T09:00"), at("09T09:00")).status).toBe("available")
    expect(checkAvailability(holds, "suv", "kumasi-city-mall", at("08T09:00"), at("09T09:00")).status).toBe("available")
  })

  it("never claims availability without fleet data", () => {
    expect(checkAvailability(null, "suv", "accra-airport-shell", at("08T09:00"), at("09T09:00")).status).toBe("unknown")
    expect(currentHolds(null, "suv", at("08T09:00"))).toBeNull()
  })

  it("lists holds active right now", () => {
    expect(currentHolds(holds, "suv", at("07T12:00"))).toHaveLength(1)
    expect(currentHolds(holds, "suv", at("06T12:00"))).toHaveLength(0)
  })
})

describe("booking a taken category", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_DEMO_MODE = "true"
  })
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_DEMO_MODE
  })

  it("is refused on the server", () => {
    const store = createStore()
    const r = createBooking(
      store,
      {
        trip: {
          location: "accra-airport-shell",
          drive: "self-drive",
          pickupDate: "2026-11-08",
          pickupTime: "10:00",
          returnDate: "2026-11-10",
          returnTime: "10:00",
          destinations: "Accra",
          intercity: "no",
        },
        categoryId: "suv",
        renter: { fullName: "Test", phone: "024 123 4567", email: "t@example.com", requests: "" },
        acceptedPolicyVersion: SELF_DRIVE_POLICY.version,
        expectedPayNow: 1800,
        idempotencyKey: "k",
      },
      demoPaymentProvider(store),
      new Date("2026-11-05T09:00:00Z"),
      holds,
    )
    expect(r.ok || r.code).toBe("unavailable")
    expect(store.bookings.size).toBe(0)
  })
})
