# Unresolved business rules

Each item needs a decision from RideReserve. The code takes a conservative position and marks it in config. It does not invent terms.

| # | Rule | Current handling | Where |
|---|---|---|---|
| U1 | **Chauffeur cancellation and refunds.** The chauffeur agreement and the Terms point to each other | Treated as `unresolved`. Online payment for chauffeur bookings is blocked, and the review step tells the customer to contact the team. Manage booking won't calculate a chauffeur refund | `policy.ts` → `CHAUFFEUR_POLICY` |
| U2 | **Self-drive tier boundaries.** Is exactly 48h "more than 48h"? | Exactly 48h counts as the 75% tier and exactly 24h as the 50% tier (the lower refund at the boundary) | `policy.ts`, `tests/policy-pricing.test.ts` |
| U3 | **Rental-day calculation.** Is there a grace period? | One day per started 24 hours from pickup | `pricing.ts` → `rentalDuration` |
| U4 | **Collection deposits** for Mid-Sedan, SUV, Pick-Up and Premium SUV, and for any chauffeur rental | Only the Saloon self-drive deposit (GHS 500) was observed. The others show "to be confirmed" | `categories.ts` |
| U5 | **Deposit return timeframe** after inspection | Not stated anywhere | Cancellation policy page |
| U6 | **Rates** | None published. Demo rates only | `pricing.ts` |
| U7 | **Vehicle specifications** (seats, luggage, transmission, A/C) | All shown as "To be confirmed" | `categories.ts` |
| U8 | **Maximum rental duration** | Deliberately unset. The 30-day limit is how far ahead a booking can be made, not a duration | `business.ts` |
| U9 | **Fuel, tolls and parking for chauffeur trips** | "Agreed with RideReserve before the trip" | `policy.ts` → `journeyExclusions` |
| U10 | **Scope of 24/7 support** | Labelled "for customers with an active rental — scope to be confirmed" | `business.ts` → `SERVICE_HOURS` |
| U11 | **Late changes to self-drive bookings** (under 24h, with staff approval) | Described in text. No self-service changes yet | `policy.ts` → `amendment` |
| U12 | **Second "Saloon" gallery** on the live category page | Possibly a mislabelled sixth category or a duplicate. Only the first gallery is used | `categories.ts` |
| U13 | **Business enquiry response time** | Not stated, because no time has been confirmed | `/business` |
| U14 | **Category copy** (summaries and "good for" lists) | Proposed wording. Needs validation | `categories.ts` |
| U15 | **About page content and operator identity** | Placeholder notice | `/about` |
| U16 | **Social profiles** | None verified, so the icons are omitted | `business.ts` → `SOCIAL_LINKS` |
