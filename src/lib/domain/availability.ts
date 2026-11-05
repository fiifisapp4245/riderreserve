import type { LocationId } from "./business"
import type { CategoryId } from "./categories"

/**
 * Fleet availability. A "hold" is a period when a category's vehicles at a
 * location are out, for example on an airport transfer or another rental.
 *
 * There is no live fleet system yet: in demo mode holds come from synthetic
 * data, otherwise availability is "unknown" and the UI says it is confirmed
 * by the team. Never present unknown availability as available.
 */

export interface FleetHold {
  categoryId: CategoryId
  location: LocationId
  from: Date
  to: Date
  /** Customer-safe reason, e.g. "On an airport transfer". */
  reason: string
}

export type Availability =
  | { status: "available" }
  | { status: "unavailable"; reason: string; availableFrom: Date }
  | { status: "unknown" }

const overlaps = (h: FleetHold, start: Date, end: Date) => h.from < end && h.to > start

/** Availability of one category at one location for the trip window. */
export function checkAvailability(
  holds: FleetHold[] | null,
  categoryId: CategoryId,
  location: LocationId,
  pickup: Date,
  ret: Date,
): Availability {
  if (!holds) return { status: "unknown" }
  const clashing = holds.filter((h) => h.categoryId === categoryId && h.location === location && overlaps(h, pickup, ret))
  if (!clashing.length) return { status: "available" }
  const latest = clashing.reduce((a, b) => (b.to > a.to ? b : a))
  return { status: "unavailable", reason: latest.reason, availableFrom: latest.to }
}

/** Holds active right now for a category, per location (vehicle pages). */
export function currentHolds(holds: FleetHold[] | null, categoryId: CategoryId, now: Date) {
  if (!holds) return null
  return holds.filter((h) => h.categoryId === categoryId && h.from <= now && h.to > now)
}
