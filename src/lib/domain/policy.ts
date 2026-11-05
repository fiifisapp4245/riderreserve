import type { DriveOption } from "./categories"

/**
 * Authoritative cancellation / amendment policy (RR-03, RR-13). Quotes,
 * checkout summaries, Manage booking and the policy pages all read from here.
 *
 * Self-drive tiers were observed in the public Self-Drive Rental Agreement on
 * 5 Nov 2026. Boundary semantics (is exactly 48h "more than 48h"?) were not
 * stated; we treat 48h and 24h as belonging to the lower-refund tier and flag
 * this in docs/UNRESOLVED.md. Chauffeur rules are unresolved: the public
 * documents reference each other circularly.
 */

export interface RefundTier {
  /** Inclusive lower bound in hours before pickup; tier applies when hoursBefore > minHoursExclusive. */
  minHoursExclusive: number
  percent: number
  label: string
}

export interface CancellationPolicy {
  version: string
  status: "observed" | "confirmed" | "unresolved"
  tiers: RefundTier[]
  amendment: string
  summary: string[]
}

export const SELF_DRIVE_POLICY: CancellationPolicy = {
  version: "self-drive-2026-11-05-observed",
  status: "observed",
  tiers: [
    { minHoursExclusive: 48, percent: 100, label: "More than 48 hours before pickup" },
    { minHoursExclusive: 24, percent: 75, label: "24 to 48 hours before pickup" },
    { minHoursExclusive: 0, percent: 50, label: "Less than 24 hours before pickup" },
  ],
  amendment:
    "One change without an amendment fee if requested at least 24 hours before pickup, subject to availability and repricing. Later requests need staff approval.",
  summary: [
    "Full refund if you cancel more than 48 hours before pickup.",
    "75% refund between 24 and 48 hours before pickup.",
    "50% refund less than 24 hours before pickup.",
    "No refund at or after the pickup time, or if you don't collect.",
  ],
}

export const CHAUFFEUR_POLICY: CancellationPolicy = {
  version: "chauffeur-unresolved",
  status: "unresolved",
  tiers: [],
  amendment: "Contact RideReserve to change a chauffeur booking.",
  summary: [
    "Cancellation and refund terms for chauffeur bookings are being confirmed by RideReserve.",
    "Contact us before booking if you need the exact terms.",
  ],
}

export function policyFor(drive: DriveOption): CancellationPolicy {
  return drive === "self-drive" ? SELF_DRIVE_POLICY : CHAUFFEUR_POLICY
}

export type RefundEstimate =
  | { kind: "tier"; percent: number; label: string; refundable: number; cutoffs: { at: Date; percentAfter: number }[] }
  | { kind: "none"; reason: string }
  | { kind: "unresolved"; reason: string }

/** Refund preview shown before a customer confirms a cancellation. */
export function estimateRefund(
  drive: DriveOption,
  paidAmount: number,
  pickup: Date,
  now: Date = new Date(),
): RefundEstimate {
  const policy = policyFor(drive)
  if (policy.status === "unresolved" || policy.tiers.length === 0) {
    return { kind: "unresolved", reason: "Refund terms for this booking type must be confirmed by our team." }
  }
  const hoursBefore = (pickup.getTime() - now.getTime()) / 3_600_000
  if (hoursBefore <= 0) {
    return { kind: "none", reason: "No refund applies at or after the pickup time." }
  }
  const tier = policy.tiers.find((t) => hoursBefore > t.minHoursExclusive)!
  // Upcoming moments when the refund drops, so the UI can show exact local cutoffs.
  const cutoffs = policy.tiers.flatMap((t, i) =>
    t.minHoursExclusive > 0 && hoursBefore > t.minHoursExclusive
      ? [{ at: new Date(pickup.getTime() - t.minHoursExclusive * 3_600_000), percentAfter: policy.tiers[i + 1].percent }]
      : [],
  )
  return {
    kind: "tier",
    percent: tier.percent,
    label: tier.label,
    refundable: Math.round(paidAmount * tier.percent) / 100,
    cutoffs,
  }
}

/** Requirements by drive option (RR-04). */
export function documentRequirements(drive: DriveOption) {
  const common = [
    "Original Ghana Card, or passport for non-Ghanaian customers",
    "The phone number and email used for booking",
  ]
  return drive === "self-drive"
    ? [...common, "Original valid driving licence (held by every person who will drive)"]
    : [...common]
}

/** Journey costs outside the rental quote (RR-18). */
export function journeyExclusions(drive: DriveOption) {
  return drive === "chauffeur"
    ? [
        "Chauffeur meals during the trip are your responsibility.",
        "Overnight trips: you provide the chauffeur's accommodation.",
        "Fuel, tolls and parking: agreed with RideReserve before the trip.",
      ]
    : [
        "Fuel, tolls and parking are not part of the rental quote.",
        "Travel outside your declared destinations may incur charges.",
      ]
}
