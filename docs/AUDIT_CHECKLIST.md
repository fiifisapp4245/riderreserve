# Audit coverage: RR-01 to RR-24

Status key: **Done** = implemented and checked in the browser or with tests · **Partial** = UI done but blocked on data or a business decision · **Blocked** = needs an external integration.

| ID | Status | Evidence |
|---|---|---|
| RR-01 Trip-first flow | **Done** | `/rent`: trip → category with quote → details → review. Personal details come only after a category is chosen. Checked end to end in the browser |
| RR-02 Comparable category cards | **Partial** | `CategoryCard` has use cases, drive eligibility, specs, quote, deposit and a Select CTA. Specs and rates are unverified (U6, U7) |
| RR-03 One cancellation source | **Partial** | `policy.ts` feeds checkout, Manage booking and `/policies/cancellation`. Chauffeur terms are unresolved (U1) |
| RR-04 Requirements by drive option | **Done** | `documentRequirements()`. The licence is listed for self-drive only. Tested |
| RR-05 Itinerary capture | **Done** | Self-drive route questions in the details step, validated on the server and shown at review |
| RR-06 Home page content | **Done** | Search, service areas, categories, how it works, documents, cancellation summary, business CTA. No trust evidence, because none is verified |
| RR-07 Navigation | **Done** | Vehicles · Rental options · Business & long-term · Manage booking · Help, plus Sign in and Find a vehicle |
| RR-08 Business & long-term naming | **Done** | `/business`, which addresses both companies and individuals |
| RR-09 Quote process explained | **Partial** | Three-stage explanation and a "not an instant booking" note. No response time (U13) |
| RR-10 Company and contact separated | **Done** | Company name appears only for companies, plus a contact person field |
| RR-11 Consistent required/optional | **Done** | Fields are required by default and optional fields are labelled "(optional)" everywhere |
| RR-12 Lost-code recovery | **Done** (demo) | "I don't have my booking reference" verifies by contact only. Messaging is not connected yet |
| RR-13 Amendment rules | **Partial** | The rules are shown. Self-service rescheduling is not built (needs availability) |
| RR-14 Labelled service windows | **Done** | `SERVICE_HOURS` in the footer and on Help. The 24/7 scope is unconfirmed (U10) |
| RR-15 Duplicate Saloon | **Done** | Each category appears once. The source question is logged as U12 |
| RR-16 Policy summaries in context | **Done** | Exclusions and cancellation panels at category and review steps |
| RR-17 Deposit return timing | **Blocked** | Business rule needed (U5) |
| RR-18 Chauffeur extras | **Done** | Meals and accommodation shown at category, review and on Rental options |
| RR-19 Return location | **Done** | "Return the vehicle to the same location" on the field and at review |
| RR-20 Missing vs invalid errors | **Done** | Separate messages, linked error summary in form order. Tested |
| RR-21 Saloon vs Mid-Sedan explained | **Partial** | Summaries and use cases added. Wording needs validation (U14) |
| RR-22 Social links | **Done** | Omitted until verified |
| RR-23 Link labels | **Done** | "Contact our team" on About. Task-specific CTAs throughout |
| RR-24 About consolidation | **Partial** | Single structure in place. Approved copy needed (U15) |

## Additional workstream: guest access and accounts

| Item | Status |
|---|---|
| Booking code + contact only starts verification | **Done**, tested |
| Single-use 6-digit code, 10-minute expiry, 5 attempts, 60s resend cooldown, 3 sends | **Done**, tested |
| Identical responses whether or not a booking exists | **Done**, tested |
| Rate limits on start and verify | **Done** (in memory), tested |
| httpOnly server session cookie, 30 minutes | **Done** |
| Ownership checked on every read and mutation (`canAccess`) | **Done**, tested |
| CSRF | Server actions get Next.js same-origin protection |
| Optional accounts | **Blocked**: no auth provider chosen |
| Code delivery | **Blocked**: no messaging provider |

## Not verified

- Screen-reader testing with assistive technology (only the semantics have been reviewed)
- Measured colour contrast
- 200% zoom
- A real payment sandbox
