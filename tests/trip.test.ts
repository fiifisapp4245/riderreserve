import { describe, expect, it } from "vitest"
import { categoryConflict, earliestPickup, validateItinerary, validateTrip } from "@/lib/domain/trip"
import { isCategoryEligible } from "@/lib/domain/categories"
import { fromLocal } from "@/lib/domain/time"

// 5 Nov 2026, 09:00 in Accra (UTC+0).
const NOW = new Date("2026-11-05T09:00:00Z")
const base = {
  location: "accra-airport-shell" as const,
  drive: "self-drive" as const,
  pickupDate: "2026-11-07",
  pickupTime: "10:00",
  returnDate: "2026-11-09",
  returnTime: "10:00",
}

describe("trip date eligibility", () => {
  it("accepts a valid trip", () => {
    expect(validateTrip(base, NOW)).toEqual({})
  })

  it("separates missing values from invalid ones", () => {
    const e = validateTrip({}, NOW)
    expect(e.location).toMatch(/Choose a pickup location/)
    expect(e.pickupDate).toMatch(/Enter a pickup date/)
  })

  it("rejects pickup less than 6 hours ahead and suggests the earliest slot", () => {
    const e = validateTrip({ ...base, pickupDate: "2026-11-05", pickupTime: "14:30" }, NOW)
    expect(e.pickupDate).toMatch(/at least 6 hours/)
    expect(e.pickupDate).toMatch(/Thu 5 Nov at 3:00 PM/)
  })

  it("accepts pickup exactly 6 hours ahead", () => {
    expect(validateTrip({ ...base, pickupDate: "2026-11-05", pickupTime: "15:00" }, NOW)).toEqual({})
  })

  it("rejects pickup beyond the 30-day booking window", () => {
    expect(validateTrip({ ...base, pickupDate: "2026-12-06", returnDate: "2026-12-08" }, NOW).pickupDate).toMatch(/30 days/)
    expect(validateTrip({ ...base, pickupDate: "2026-12-05", returnDate: "2026-12-08" }, NOW)).toEqual({})
  })

  it("does not impose a maximum rental duration", () => {
    expect(validateTrip({ ...base, returnDate: "2027-03-01" }, NOW)).toEqual({})
  })

  it("rejects times outside 6 AM – 6 PM", () => {
    expect(validateTrip({ ...base, pickupTime: "05:30" }, NOW).pickupTime).toMatch(/between 6:00 AM and 6:00 PM/)
    expect(validateTrip({ ...base, returnTime: "18:30" }, NOW).returnTime).toMatch(/between/)
    expect(validateTrip({ ...base, returnTime: "18:00" }, NOW)).toEqual({})
  })

  it("rejects return before or equal to pickup", () => {
    expect(validateTrip({ ...base, returnDate: "2026-11-07" }, NOW).returnDate).toMatch(/after pickup/)
  })

  it("rejects impossible calendar dates", () => {
    expect(fromLocal("2026-02-31", "10:00")).toBeNull()
  })

  it("moves the earliest pickup into opening hours", () => {
    expect(earliestPickup(new Date("2026-11-05T13:10:00Z"))).toEqual({ date: "2026-11-06", time: "06:00" })
    expect(earliestPickup(new Date("2026-11-05T22:00:00Z"))).toEqual({ date: "2026-11-06", time: "06:00" })
    expect(earliestPickup(new Date("2026-11-05T09:10:00Z"))).toEqual({ date: "2026-11-05", time: "15:30" })
  })

  it("requires a declared route for self-drive only", () => {
    expect(validateItinerary({ drive: "self-drive" }).destinations).toBeDefined()
    expect(validateItinerary({ drive: "chauffeur" })).toEqual({})
  })
})

describe("drive / category compatibility", () => {
  it("Premium SUV is chauffeur only", () => {
    expect(isCategoryEligible("premium-suv", "self-drive")).toBe(false)
    expect(isCategoryEligible("premium-suv", "chauffeur")).toBe(true)
    expect(categoryConflict("premium-suv", "self-drive")).toMatch(/chauffeur only/)
    expect(categoryConflict("saloon", "self-drive")).toBeNull()
  })
})
