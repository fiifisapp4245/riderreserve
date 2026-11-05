# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
The audience is mixed, confirmed by the user on 5 Nov 2026:
- People in Ghana renting for trips.
- Returning diaspora and visitors who need a car or a driver.
- Companies and individuals who need fleet or long-term rentals, through a separate enquiry route.

Many book on a phone.

## Product Purpose
RideReserve is a car-rental service with pickup points in Accra, Kumasi and Takoradi. Customers can drive themselves or travel with a RideReserve chauffeur. The site has to answer the customer's questions in this order, before they share personal details or pay:
- Can you serve my location and dates?
- Which category fits?
- What do I pay now, and what is due at collection?
- Which documents and rules apply?
- How do I manage the booking?

## Positioning
- Bookings are for a category, not a specific model.
- Customers can choose self-drive or a chauffeur at the same pickup points.
- Every cost is shown before payment, with the collection deposit kept separate from the online payment.
- Guest booking needs no account.

## Operating Context
- Collection and return run from 6 AM to 6 PM, Africa/Accra time.
- Pickup must be booked at least 6 hours and at most 30 days ahead.
- The vehicle is returned to the same location.
- Customers bring original ID to collection, and a driving licence for self-drive only.

## Capabilities and Constraints
- The full redesign backlog is the RideReserve UX audit (RR-01 to RR-24). Open business rules are listed in `docs/UNRESOLVED.md`.
- Rates, vehicle specs, most deposits and the chauffeur cancellation policy are not yet confirmed.
- Payment, messaging, persistence and accounts are not connected. Demo mode simulates them and labels them as simulated.

## Brand Commitments
- The RideReserve logo (red, white and near-black) stays.
- The user's binding direction: near-black primary buttons, with RideReserve red used as the accent (logo, selected states, active step, key highlights). Perk (TravelPerk) on Mobbin is the interface reference.
- Fonts are the same as CashPath: Inter for body text and Bricolage Grotesque for headings.
- Use shadcn/ui components, including Select and a Calendar date picker.
- Large, touch-friendly controls.

## Evidence on Hand
- Fleet photos published at ridereservegh.com/vehicle-categories.
- Contact details: phone and WhatsApp 053 882 2056, info@ridereservegh.com.
- There are no customer reviews, partner logos, fleet guarantees or verified social profiles. Do not fabricate any of them.

## Product Principles
- Trip and price come before personal details.
- Never imply a price, availability or term that hasn't been confirmed.
- The phone is the primary device.
- One calm task per screen.

## Accessibility & Inclusion
Target WCAG 2.2 AA: keyboard-operable date and select controls, linked errors, and touch targets of at least 44px.
