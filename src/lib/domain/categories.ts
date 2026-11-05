import type { Verification } from "./business"

export type DriveOption = "self-drive" | "chauffeur"

export type CategoryId = "saloon" | "mid-sedan" | "suv" | "pick-up" | "premium-suv"

export interface CategorySpec {
  label: string
  /** null = not yet verified; render as "To be confirmed", never guess. */
  value: string | null
}

export interface VehicleCategory {
  id: CategoryId
  name: string
  /** Plain-language explanation of the category (RR-21). Proposed copy. */
  summary: string
  suitedFor: string[]
  drive: DriveOption[]
  specs: CategorySpec[]
  /** Fleet photos published on ridereservegh.com/vehicle-categories. Illustrative only. */
  photos: { src: string; alt: string }[]
  /** Collection deposit for self-drive in GHS; null = not verified. */
  selfDriveDeposit: { amount: number | null; verification: Verification }
}

const UPLOADS = "https://ridereservegh.com/wp-content/uploads/2026/11"

const photo = (file: string, alt: string) => ({ src: `${UPLOADS}/${file}`, alt })

const unverifiedSpecs = (): CategorySpec[] => [
  { label: "Passengers", value: null },
  { label: "Luggage", value: null },
  { label: "Transmission", value: null },
  { label: "Air conditioning", value: null },
]

export const CATEGORIES: VehicleCategory[] = [
  {
    id: "saloon",
    name: "Saloon",
    summary: "Compact four-door car for city driving and short trips.",
    suitedFor: ["Getting around town", "Solo or couple travel", "Short intercity trips"],
    drive: ["self-drive", "chauffeur"],
    specs: unverifiedSpecs(),
    photos: [
      photo("IMG_3463-1024x576.jpeg", "Silver saloon car, front three-quarter view"),
      photo("IMG_3464-768x576.jpeg", "Saloon car interior"),
      photo("IMG_3458-768x576.jpeg", "Saloon car, side view"),
      photo("IMG_3459-768x576.jpeg", "Saloon car, rear view"),
    ],
    selfDriveDeposit: { amount: 500, verification: "observed" },
  },
  {
    id: "mid-sedan",
    name: "Mid-Sedan",
    summary: "Larger sedan with more cabin and boot space than a Saloon.",
    suitedFor: ["Business travel", "Small families", "Longer road trips"],
    drive: ["self-drive", "chauffeur"],
    specs: unverifiedSpecs(),
    photos: [
      photo("IMG_3466-1024x384.jpeg", "Mid-size sedan, side profile"),
      photo("IMG_3468-768x576.jpeg", "Mid-size sedan, front view"),
      photo("IMG_3469-768x576.jpeg", "Mid-size sedan interior"),
      photo("IMG_3467-768x576.jpeg", "Mid-size sedan, rear view"),
    ],
    selfDriveDeposit: { amount: null, verification: "unresolved" },
  },
  {
    id: "suv",
    name: "SUV",
    summary: "Higher ground clearance and room for passengers and bags.",
    suitedFor: ["Families and groups", "Mixed road conditions", "Upcountry travel"],
    drive: ["self-drive", "chauffeur"],
    specs: unverifiedSpecs(),
    photos: [
      photo("IMG_3479-1024x576.jpeg", "SUV, front three-quarter view"),
      photo("IMG_3478-768x576.jpeg", "SUV, side view"),
      photo("IMG_3480-768x576.jpeg", "SUV interior"),
      photo("IMG_3481-768x576.jpeg", "SUV, rear view"),
    ],
    selfDriveDeposit: { amount: null, verification: "unresolved" },
  },
  {
    id: "pick-up",
    name: "Pick-Up Truck",
    summary: "Double-cab pick-up with an open load bed for equipment and rough roads.",
    suitedFor: ["Site and project work", "Carrying equipment", "Rough or rural roads"],
    drive: ["self-drive", "chauffeur"],
    specs: unverifiedSpecs(),
    photos: [
      photo("IMG_3493-1024x576.jpeg", "Pick-up truck, front three-quarter view"),
      photo("IMG_3494-768x576.jpeg", "Pick-up truck, side view"),
      photo("IMG_3492-768x576.jpeg", "Pick-up truck load bed"),
      photo("IMG_3495-768x576.jpeg", "Pick-up truck interior"),
    ],
    selfDriveDeposit: { amount: null, verification: "unresolved" },
  },
  {
    id: "premium-suv",
    name: "Premium SUV",
    summary: "Executive SUV, available with a RideReserve chauffeur only.",
    suitedFor: ["Executive and VIP travel", "Airport transfers", "Events and weddings"],
    drive: ["chauffeur"],
    specs: unverifiedSpecs(),
    photos: [
      photo("IMG_3504-1024x576.jpeg", "Premium SUV, front three-quarter view"),
      photo("IMG_3506-768x576.jpeg", "Premium SUV, side view"),
      photo("IMG_3505-768x576.jpeg", "Premium SUV interior"),
      photo("IMG_3509-768x576.jpeg", "Premium SUV, rear view"),
    ],
    selfDriveDeposit: { amount: null, verification: "unresolved" },
  },
]

export function getCategory(id: string | null | undefined) {
  return CATEGORIES.find((c) => c.id === id)
}

export function isCategoryEligible(categoryId: CategoryId, drive: DriveOption) {
  return getCategory(categoryId)?.drive.includes(drive) ?? false
}

export function eligibleCategories(drive: DriveOption) {
  return CATEGORIES.filter((c) => c.drive.includes(drive))
}

export const DRIVE_OPTIONS: { id: DriveOption; label: string; description: string }[] = [
  {
    id: "self-drive",
    label: "Self-drive",
    description: "You drive. Valid driving licence and collection deposit required.",
  },
  {
    id: "chauffeur",
    label: "With chauffeur",
    description: "A RideReserve driver drives you. No driving licence needed.",
  },
]
