/**
 * Business configuration. Single source for locations, hours and contact
 * channels. Every value carries its verification status so UI and docs can be
 * honest about what has and hasn't been confirmed by the business.
 *
 * "observed" = seen on the public site during the 5 Nov 2026 audit.
 * Replace with backend configuration once one exists (see docs/DECISIONS.md).
 */

export type Verification = "observed" | "confirmed" | "unresolved"

export const TIMEZONE = "Africa/Accra"

export type LocationId = "accra-airport-shell" | "kumasi-city-mall" | "takoradi-anaji"

export interface PickupLocation {
  id: LocationId
  name: string
  city: string
  region: string
  /** Rentals return to the same location. Alternatives not verified as supported. */
  returnPolicy: "same-location"
}

export const LOCATIONS: PickupLocation[] = [
  {
    id: "accra-airport-shell",
    name: "Accra Airport Shell",
    city: "Accra",
    region: "Greater Accra",
    returnPolicy: "same-location",
  },
  {
    id: "kumasi-city-mall",
    name: "Kumasi City Mall",
    city: "Kumasi",
    region: "Ashanti",
    returnPolicy: "same-location",
  },
  {
    id: "takoradi-anaji",
    name: "Takoradi RR Anaji Office",
    city: "Takoradi",
    region: "Western",
    returnPolicy: "same-location",
  },
]

export function getLocation(id: string | null | undefined) {
  return LOCATIONS.find((l) => l.id === id)
}

export const BOOKING_RULES = {
  /** Collection and return window, local Accra time, 24h clock. */
  openHour: 6,
  closeHour: 18,
  /** Minimum notice before pickup, in hours. */
  minLeadHours: 6,
  /** Furthest pickup can be booked ahead, in days. This is NOT a maximum rental duration. */
  maxAdvanceDays: 30,
  /** Not published; deliberately unset rather than inferred. */
  maxRentalDays: null as number | null,
  /** Time-slot granularity offered in pickers, minutes. */
  slotMinutes: 30,
  verification: "observed" as Verification,
}

export const CONTACT = {
  phoneDisplay: "053 882 2056",
  phoneE164: "+233538822056",
  whatsappUrl: "https://wa.me/233538822056",
  email: "info@ridereservegh.com",
  officeAddress: "Papa Badu Street, Anaji, Takoradi, Ghana",
  verification: "observed" as Verification,
}

/** The three windows legitimately differ (RR-14); always label them. */
export const SERVICE_HOURS = [
  {
    id: "office",
    label: "Office & enquiries",
    hours: "Mon–Sun, 8:00 AM – 8:00 PM",
    detail: "Phone, WhatsApp and email replies.",
  },
  {
    id: "collection",
    label: "Vehicle collection & return",
    hours: "Daily, 6:00 AM – 6:00 PM",
    detail: "At your chosen pickup location.",
  },
  {
    id: "support",
    label: "On-trip support",
    hours: "24/7",
    detail: "For customers with an active rental. Scope to be confirmed by RideReserve.",
  },
] as const

/** Only verified social profiles belong here. None verified yet (RR-22). */
export const SOCIAL_LINKS: { label: string; href: string }[] = []
