import { getCategory, type CategoryId, type DriveOption } from "./categories"
import { tripInstants, type Trip } from "./trip"

/**
 * Pricing. RideReserve has not published rates, so there is no live price
 * source. In demo mode we use clearly-labelled sample rates; otherwise quotes
 * resolve to "price on request". Prices are always recomputed on the server.
 */

export const isDemoMode = () => process.env.NEXT_PUBLIC_DEMO_MODE === "true"

/** SAMPLE ONLY — not RideReserve prices. Used when NEXT_PUBLIC_DEMO_MODE=true. */
const DEMO_DAILY_RATES: Record<DriveOption, Partial<Record<CategoryId, number>>> = {
  "self-drive": { saloon: 450, "mid-sedan": 600, suv: 900, "pick-up": 950 },
  chauffeur: { saloon: 750, "mid-sedan": 900, suv: 1250, "pick-up": 1300, "premium-suv": 2500 },
}

export interface QuoteLine {
  label: string
  amount: number
  detail?: string
}

export type Quote =
  | {
      kind: "priced"
      source: "demo"
      categoryId: CategoryId
      drive: DriveOption
      rentalDays: number
      hours: number
      dailyRate: number
      lines: QuoteLine[]
      payNow: number
      /** Refundable, paid at collection — never part of payNow. */
      collectionDeposit: { amount: number | null; status: "observed" | "unresolved" | "not-applicable" }
      currency: "GHS"
    }
  | { kind: "on-request"; categoryId: CategoryId; drive: DriveOption; rentalDays: number; hours: number }

/**
 * Rental days are charged per started 24-hour period from pickup time.
 * UNRESOLVED: RideReserve hasn't confirmed this rule or any grace period.
 */
export function rentalDuration(pickup: Date, ret: Date) {
  const hours = (ret.getTime() - pickup.getTime()) / 3_600_000
  return { hours, rentalDays: Math.max(1, Math.ceil(hours / 24 - 1e-9)) }
}

export function buildQuote(trip: Trip, categoryId: CategoryId): Quote {
  const category = getCategory(categoryId)
  if (!category || !category.drive.includes(trip.drive)) throw new Error("Category not eligible for drive option")
  const { pickup, ret } = tripInstants(trip)
  const { hours, rentalDays } = rentalDuration(pickup, ret)

  const rate = isDemoMode() ? DEMO_DAILY_RATES[trip.drive][categoryId] : undefined
  if (rate === undefined) return { kind: "on-request", categoryId, drive: trip.drive, rentalDays, hours }

  const rental = rate * rentalDays
  const deposit =
    trip.drive === "chauffeur"
      ? { amount: null, status: "not-applicable" as const }
      : category.selfDriveDeposit.amount === null
        ? { amount: null, status: "unresolved" as const }
        : { amount: category.selfDriveDeposit.amount, status: "observed" as const }

  return {
    kind: "priced",
    source: "demo",
    categoryId,
    drive: trip.drive,
    rentalDays,
    hours,
    dailyRate: rate,
    lines: [
      {
        label: `${category.name} ${trip.drive === "chauffeur" ? "with chauffeur" : "self-drive"}`,
        amount: rental,
        detail: `${formatGHS(rate)} × ${rentalDays} day${rentalDays === 1 ? "" : "s"}`,
      },
    ],
    payNow: rental,
    collectionDeposit: deposit,
    currency: "GHS",
  }
}

const ghs = new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", currencyDisplay: "code" })
const ghsWhole = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  currencyDisplay: "code",
  maximumFractionDigits: 0,
})

/** "GHS 1,234" for whole cedis, "GHS 1,234.50" otherwise. Same format everywhere. */
export function formatGHS(amount: number) {
  return (Number.isInteger(amount) ? ghsWhole : ghs).format(amount).replace(/\u00a0/g, " ")
}
