import "server-only"
import type { FleetHold } from "@/lib/domain/availability"
import { isDemoMode } from "@/lib/domain/pricing"

/**
 * Fleet-hold source. Replace with the operations system once one exists
 * (see docs/DECISIONS.md → "Fleet availability"). Returns null when no source
 * is connected, which the UI shows as "confirmed by our team".
 */
export function fleetHolds(now = new Date()): FleetHold[] | null {
  if (!isDemoMode()) return null
  const h = (hours: number) => new Date(now.getTime() + hours * 3_600_000)
  // SYNTHETIC demo data: lets the "taken" states be explored locally.
  return [
    { categoryId: "suv", location: "accra-airport-shell", from: h(-2), to: h(52), reason: "On an airport transfer" },
    { categoryId: "mid-sedan", location: "kumasi-city-mall", from: h(-5), to: h(100), reason: "On an airport transfer" },
    { categoryId: "premium-suv", location: "takoradi-anaji", from: h(20), to: h(80), reason: "Booked for another trip" },
  ]
}
