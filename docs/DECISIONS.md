# Decisions and integration status

## Stack

- **Next.js 16.4 (App Router, Turbopack, Cache Components on)**, React 19.3, TypeScript, Tailwind CSS 4.
- **shadcn/ui (base-nova style, built on Base UI)**. Use the `render` prop instead of `asChild`. `ButtonLink` in `src/components/ui-extras.tsx` styles a Next `Link` as a button.
- **Fonts: the same pair as CashPath.** Inter for body and UI text, Bricolage Grotesque for headings. Both load through `next/font/google` in `src/app/layout.tsx`.
- **Light mode only**, as the brief asks. Brand tokens live in `src/app/globals.css`: red `#d71920`, ink `#141414`, white.
- Zod for schemas, `libphonenumber-js` for phone normalisation, Vitest for tests.

## Where things live

| Concern | File |
|---|---|
| Locations, hours, contact, booking-window rules | `src/lib/domain/business.ts` |
| Categories, drive eligibility, fleet photos | `src/lib/domain/categories.ts` |
| Trip validation (Africa/Accra), earliest pickup | `src/lib/domain/trip.ts`, `src/lib/domain/time.ts` |
| Cancellation policy, refund preview, documents, exclusions | `src/lib/domain/policy.ts` |
| Quotes and rental-day calculation | `src/lib/domain/pricing.ts` |
| Booking, payment and refund status models | `src/lib/domain/booking.ts` |
| Booking creation, idempotency, payment adapter | `src/lib/server/bookings.ts` |
| Guest OTP verification and sessions | `src/lib/server/verification.ts` |
| Server actions (the server-side authority) | `src/app/actions.ts` |

The client and the server run the same validation functions. The server repeats every check: dates, eligibility, price, policy acceptance and ownership.

## Demo mode vs production

`NEXT_PUBLIC_DEMO_MODE=true` turns on:

- **Sample daily rates.** They are labelled "Sample price — demo only" wherever they appear.
- **A simulated payment provider** at `/pay/demo/[id]`. It lets you choose success, delayed callback, failure or cancel.
- **On-screen booking codes.** The code appears only when the details match a booking.
- **An in-memory store** with one synthetic booking: `RR-DEMO42`, phone `024 123 4567`, email `ama.demo@example.com`.

When the flag is off, the app fails safely:

- Quotes show "Price on request".
- Payment returns "Online payment isn't connected yet. No booking was made".
- Booking access tells the customer to call or WhatsApp.
- Enquiries return a failure message and the form keeps the draft.

Nothing is faked.

## Integrations still needed (production blockers)

| Integration | Status | What's needed |
|---|---|---|
| Fleet availability | **Missing** | `src/lib/server/fleet.ts` returns holds (for example, a vehicle out on an airport transfer). Demo mode uses synthetic holds. Without a source, the UI says "Availability confirmed by our team" and never claims a car is free. Booking creation re-checks on the server |
| Rates | **Missing** | A real price source per category and drive option, plus availability by location and date |
| Persistence | **Missing** | A database for bookings, payments, enquiries, OTP challenges and sessions. The in-memory store is not shared between instances |
| Payment gateway | **Missing** | Choose a provider (for example Paystack or Hubtel). Implement the `PaymentProvider` interface, a webhook with signature verification and a status lookup. `syncPayment` already separates payment status from booking status |
| SMS / WhatsApp / email | **Missing** | Implement `messaging()` in `actions.ts`. Codes must never be logged |
| Customer accounts | **Not started** | Choose an auth provider (for example Auth.js with email magic links, or Clerk). `/sign-in` says honestly that accounts are coming. Link guest bookings only after verified ownership |
| Staff/admin | Out of scope | Future work |
| Analytics | Not added | Do not record names, contacts, references or codes |

## Routing

Old WordPress routes redirect permanently (`next.config.ts`):

- `/rent-a-car` → `/rent`
- `/vehicle-categories` → `/vehicles`
- `/business-corporate-rental` → `/business`
- `/my-booking` → `/manage-booking`
- `/about-us` → `/about`
- `/contact-us` → `/help`
- The policy pages → `/policies/*`

## Policy texts

The full legal texts are **not** rewritten. The policy pages show plain-language summaries generated from `policy.ts` and link to the texts currently published on ridereservegh.com. Migrate the full texts once RideReserve approves them.

## Images

Category photos come from the fleet images RideReserve publishes on its current site. They are loaded remotely through `next/image` with a `remotePatterns` entry. Copy them into `/public` before the WordPress site is retired.
