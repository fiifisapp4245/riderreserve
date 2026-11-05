import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { estimateRefund, documentRequirements } from "@/lib/domain/policy"
import { buildQuote, rentalDuration } from "@/lib/domain/pricing"

const pickup = new Date("2026-11-10T10:00:00Z")
const hoursBefore = (h: number) => new Date(pickup.getTime() - h * 3_600_000)

describe("self-drive cancellation boundaries", () => {
  it.each([
    [72, 100],
    [48.01, 100],
    [48, 75],
    [24.01, 75],
    [24, 50],
    [0.5, 50],
  ])("%sh before pickup → %s%%", (h, pct) => {
    const r = estimateRefund("self-drive", 1000, pickup, hoursBefore(h))
    expect(r.kind).toBe("tier")
    if (r.kind === "tier") expect(r.percent).toBe(pct)
  })

  it("no refund at or after pickup", () => {
    expect(estimateRefund("self-drive", 1000, pickup, pickup).kind).toBe("none")
  })

  it("computes refundable amount and upcoming cutoffs", () => {
    const r = estimateRefund("self-drive", 1350, pickup, hoursBefore(60))
    if (r.kind !== "tier") throw new Error()
    expect(r.refundable).toBe(1350)
    expect(r.cutoffs.map((c) => [c.at.toISOString(), c.percentAfter])).toEqual([
      ["2026-11-08T10:00:00.000Z", 75],
      ["2026-11-09T10:00:00.000Z", 50],
    ])
  })

  it("does not apply self-drive rules to chauffeur bookings", () => {
    expect(estimateRefund("chauffeur", 1000, pickup, hoursBefore(72)).kind).toBe("unresolved")
  })
})

describe("requirements by drive option", () => {
  it("licence only for self-drive", () => {
    expect(documentRequirements("self-drive").join(" ")).toMatch(/driving licence/)
    expect(documentRequirements("chauffeur").join(" ")).not.toMatch(/licence/)
  })
})

describe("pricing", () => {
  const trip = {
    location: "accra-airport-shell" as const,
    drive: "self-drive" as const,
    pickupDate: "2026-11-07",
    pickupTime: "10:00",
    returnDate: "2026-11-09",
    returnTime: "11:00",
    destinations: "Accra",
    intercity: "no" as const,
  }

  it("charges per started 24 hours", () => {
    const d = rentalDuration(new Date("2026-11-07T10:00:00Z"), new Date("2026-11-09T10:00:00Z"))
    expect(d.rentalDays).toBe(2)
    expect(rentalDuration(new Date("2026-11-07T10:00:00Z"), new Date("2026-11-09T11:00:00Z")).rentalDays).toBe(3)
    expect(rentalDuration(new Date("2026-11-07T10:00:00Z"), new Date("2026-11-07T12:00:00Z")).rentalDays).toBe(1)
  })

  describe("without demo mode", () => {
    it("never invents a price", () => {
      expect(buildQuote(trip, "saloon").kind).toBe("on-request")
    })
  })

  describe("in demo mode", () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_DEMO_MODE = "true"
    })
    afterEach(() => {
      delete process.env.NEXT_PUBLIC_DEMO_MODE
    })

    it("keeps the collection deposit out of the amount paid now", () => {
      const q = buildQuote(trip, "saloon")
      if (q.kind !== "priced") throw new Error()
      expect(q.rentalDays).toBe(3)
      expect(q.payNow).toBe(q.lines.reduce((s, l) => s + l.amount, 0))
      expect(q.collectionDeposit).toEqual({ amount: 500, status: "observed" })
      expect(q.source).toBe("demo")
    })

    it("marks unverified deposits as unresolved", () => {
      const q = buildQuote(trip, "suv")
      if (q.kind !== "priced") throw new Error()
      expect(q.collectionDeposit.status).toBe("unresolved")
    })

    it("refuses ineligible categories", () => {
      expect(() => buildQuote(trip, "premium-suv")).toThrow()
    })
  })
})

import { validateRenter } from "@/lib/domain/contact"

describe("renter validation", () => {
  it("uses missing-value wording for empty fields", () => {
    const { errors } = validateRenter({})
    expect(errors.fullName).toMatch(/Enter your full name/)
    expect(errors.email).toMatch(/Enter your email/)
    expect(errors.phone).toMatch(/Enter a phone number/)
  })
  it("uses format wording for invalid values and normalises phones", () => {
    expect(validateRenter({ fullName: "A", email: "nope", phone: "123" }).errors).toMatchObject({
      email: expect.stringMatching(/format/),
      phone: expect.stringMatching(/valid phone/),
    })
    expect(validateRenter({ fullName: "A", email: "a@b.co", phone: "+44 20 7123 4567" }).value?.phone).toBe("+442071234567")
  })
})
