---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/app/rent/page.tsx"]
---

# Home (/) and booking flow (/rent): surface brief

Scope: the landing page is in Persuade mode but works task-first: the search is the page. The /rent flow is in Operate mode.

Audience and job: a mixed audience (locals, diaspora, visitors, companies). They want to find a vehicle for their dates and location and see the price before giving any details.

## Direction contract

THESIS: The home page works as a booking desk, not a brochure. It has a centred "Where are you headed?" greeting and one calm search card, in the style of Perk. It refuses the category default of a full-bleed car photo with a form floating on it, followed by stacked marketing sections.

OWN-WORLD:
- A warm off-white band (#f5f3ee) behind the top of the page, white below.
- Near-black (#141414) primary buttons. RideReserve red appears only on the selected drive pill, the active step, the logo and small marks.
- 1px stone borders (#dedbd3) and 12px radii. No gradients and no soft-shadow cards.
- Inter for body text, Bricolage Grotesque for headings.
- Bordered inputs with leading icons, built from shadcn Select and Popover Calendar.

STORY: The visitor picks self-drive or chauffeur, a location and dates. They tap one large black button and see categories with prices. Further down the page are three more things:
- Categories as list rows: photo, "or similar", drive tags and a "Check prices" link.
- A quiet strip covering what to bring and the cancellation rules.
- One line linking to business rentals.

FIRST VIEWPORT: A centred column, at most 720px wide.
- An h1 reading "Where are you headed?".
- A segmented pill (Self-drive | With chauffeur).
- The search card: location select, pickup date and time, return date and time, and a full-width 56px black "Search vehicles" button.
- A pastel information strip under the card.

The booking stepper and its forms are also centred in a single column, with buttons at least 56px tall.

FORM: Pinned by the user (Perk on Mobbin), so no roll was run.
seed: none (roll skipped: direction pinned by the user to Perk)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
