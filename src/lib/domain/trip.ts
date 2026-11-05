import { z } from "zod"
import { BOOKING_RULES, getLocation, type LocationId } from "./business"
import { isCategoryEligible, type CategoryId, type DriveOption } from "./categories"
import { addDays, formatShortDate, formatTimeLabel, fromLocal, toLocalParts } from "./time"

export const tripSchema = z.object({
  location: z.enum(["accra-airport-shell", "kumasi-city-mall", "takoradi-anaji"]),
  pickupDate: z.string(),
  pickupTime: z.string(),
  returnDate: z.string(),
  returnTime: z.string(),
  drive: z.enum(["self-drive", "chauffeur"]),
  /** Self-drive itinerary capture (RR-05). */
  destinations: z.string().max(300).optional().default(""),
  intercity: z.enum(["yes", "no", ""]).optional().default(""),
})

export type Trip = z.infer<typeof tripSchema>

export type TripField = keyof Trip

export type TripErrors = Partial<Record<TripField, string>>

/** Time slots offered in pickers, e.g. 06:00 … 18:00. */
export function timeSlots(): { value: string; label: string }[] {
  const slots = []
  for (let m = BOOKING_RULES.openHour * 60; m <= BOOKING_RULES.closeHour * 60; m += BOOKING_RULES.slotMinutes) {
    const value = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`
    slots.push({ value, label: formatTimeLabel(value) })
  }
  return slots
}

function withinHours(time: string) {
  const [h, m] = time.split(":").map(Number)
  const minutes = h * 60 + m
  return minutes >= BOOKING_RULES.openHour * 60 && minutes <= BOOKING_RULES.closeHour * 60
}

const openLabel = formatTimeLabel(`${String(BOOKING_RULES.openHour).padStart(2, "0")}:00`)
const closeLabel = formatTimeLabel(`${String(BOOKING_RULES.closeHour).padStart(2, "0")}:00`)

/**
 * Earliest pickup the rules allow from `now`: at least minLeadHours ahead,
 * rounded up to the next slot, and moved into opening hours.
 */
export function earliestPickup(now: Date = new Date()): { date: string; time: string } {
  const slotMs = BOOKING_RULES.slotMinutes * 60_000
  const min = new Date(Math.ceil((now.getTime() + BOOKING_RULES.minLeadHours * 3_600_000) / slotMs) * slotMs)
  const local = toLocalParts(min)
  const minutes = local.hour * 60 + local.minute
  const open = `${String(BOOKING_RULES.openHour).padStart(2, "0")}:00`
  if (minutes < BOOKING_RULES.openHour * 60) return { date: local.date, time: open }
  if (minutes > BOOKING_RULES.closeHour * 60) return { date: addDays(local.date, 1), time: open }
  return { date: local.date, time: local.time }
}

export function latestPickupDate(now: Date = new Date()) {
  return addDays(toLocalParts(now).date, BOOKING_RULES.maxAdvanceDays)
}

/**
 * Validate a trip. Used identically on the client (for feedback) and the
 * server (as the authority). Distinguishes missing values from invalid ones.
 */
export function validateTrip(input: Partial<Trip>, now: Date = new Date()): TripErrors {
  const errors: TripErrors = {}

  if (!input.location) errors.location = "Choose a pickup location."
  else if (!getLocation(input.location)) errors.location = "Choose one of the listed pickup locations."

  if (!input.drive) errors.drive = "Choose self-drive or with chauffeur."

  if (!input.pickupDate) errors.pickupDate = "Enter a pickup date."
  if (!input.pickupTime) errors.pickupTime = "Choose a pickup time."
  if (!input.returnDate) errors.returnDate = "Enter a return date."
  if (!input.returnTime) errors.returnTime = "Choose a return time."

  if (input.pickupTime && !withinHours(input.pickupTime))
    errors.pickupTime = `Pickup is available between ${openLabel} and ${closeLabel}.`
  if (input.returnTime && !withinHours(input.returnTime))
    errors.returnTime = `Return is available between ${openLabel} and ${closeLabel}.`

  const pickup = input.pickupDate && input.pickupTime ? fromLocal(input.pickupDate, input.pickupTime) : null
  const ret = input.returnDate && input.returnTime ? fromLocal(input.returnDate, input.returnTime) : null

  if (input.pickupDate && input.pickupTime && !pickup) errors.pickupDate = "Enter a real date, for example 14/11/2026."
  if (input.returnDate && input.returnTime && !ret) errors.returnDate = "Enter a real date, for example 16/11/2026."

  if (pickup && !errors.pickupTime) {
    const minPickup = now.getTime() + BOOKING_RULES.minLeadHours * 3_600_000
    if (pickup.getTime() < minPickup) {
      const e = earliestPickup(now)
      errors.pickupDate = `Pickup must be at least ${BOOKING_RULES.minLeadHours} hours from now. Earliest available: ${formatShortDate(e.date)} at ${formatTimeLabel(e.time)}.`
    } else if (input.pickupDate! > latestPickupDate(now)) {
      errors.pickupDate = `Online bookings open up to ${BOOKING_RULES.maxAdvanceDays} days ahead. For later dates, contact us.`
    }
  }

  if (pickup && ret && !errors.returnTime && ret.getTime() <= pickup.getTime()) {
    errors.returnDate = "Return must be after pickup."
  }

  return errors
}

/** Self-drive route declaration (RR-05), asked with renter details. */
export function validateItinerary(input: Partial<Trip>): TripErrors {
  const errors: TripErrors = {}
  if (input.drive !== "self-drive") return errors
  if (!input.destinations?.trim()) errors.destinations = "Tell us where you plan to drive."
  if (!input.intercity) errors.intercity = "Tell us whether you'll travel between cities or regions."
  return errors
}

export function isTripValid(input: Partial<Trip>, now?: Date) {
  return Object.keys(validateTrip(input, now)).length === 0
}

export function tripInstants(trip: Pick<Trip, "pickupDate" | "pickupTime" | "returnDate" | "returnTime">) {
  const pickup = fromLocal(trip.pickupDate, trip.pickupTime)
  const ret = fromLocal(trip.returnDate, trip.returnTime)
  if (!pickup || !ret) throw new Error("Invalid trip dates")
  return { pickup, ret }
}

/** Explain why a previously chosen category no longer fits (drive change). */
export function categoryConflict(categoryId: CategoryId | undefined, drive: DriveOption | undefined) {
  if (!categoryId || !drive) return null
  return isCategoryEligible(categoryId, drive)
    ? null
    : drive === "self-drive"
      ? "Premium SUV is available with a chauffeur only. Choose another category for self-drive."
      : "This category isn't available for the selected drive option."
}

export type { LocationId }
