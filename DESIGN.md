---
name: RideReserve
description: Car rental in Accra, Kumasi and Takoradi, booked at a calm desk: trip and price before personal details.
colors:
  ink: "#141414"
  ink-hover: "#2b2b2b"
  brand: "#d71920"
  brand-soft: "#fdecec"
  canvas: "#ffffff"
  sand: "#f5f3ee"
  oat: "#efece5"
  linen: "#f1eee8"
  stone: "#dedbd3"
  hairline: "#e7e4dd"
  slate: "#55565c"
  success: "#1c7c3c"
  success-soft: "#e8f5ec"
  warning: "#8a5300"
  warning-soft: "#fff4e0"
  info: "#1d4f91"
  info-soft: "#eaf1fb"
  destructive: "#b42318"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Inter, Helvetica, Arial, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Bricolage Grotesque, Inter, Helvetica, Arial, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Bricolage Grotesque, Inter, Helvetica, Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.025em"
  title-sm:
    fontFamily: "Bricolage Grotesque, Inter, Helvetica, Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.55
    letterSpacing: "-0.025em"
  figure:
    fontFamily: "Inter, Helvetica, Arial, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.33
    letterSpacing: "-0.025em"
    fontFeature: "\"tnum\" 1"
  body-lede:
    fontFamily: "Inter, Helvetica, Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Inter, Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, Helvetica, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.43
  caption:
    fontFamily: "Inter, Helvetica, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.33
rounded:
  sm: "9.6px"
  md: "12px"
  lg: "16.8px"
  xl: "21.6px"
  full: "9999px"
spacing:
  hair: "4px"
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "40px"
  section: "56px"
  section-lg: "80px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 24px"
    height: "56px"
  button-primary-hover:
    backgroundColor: "{colors.ink-hover}"
  button-outline:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0 24px"
    height: "56px"
  button-outline-hover:
    backgroundColor: "{colors.sand}"
  button-compact:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
    padding: "0 20px"
    height: "48px"
  field:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "56px"
  drive-switch-track:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.full}"
    padding: "4px"
  drive-switch-selected:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.full}"
    height: "48px"
  drive-switch-idle:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.slate}"
    rounded: "{rounded.full}"
    height: "48px"
  choice-tile-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
    height: "56px"
  stepper-marker-active:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.full}"
    size: "32px"
  stepper-marker-done:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.full}"
    size: "32px"
  stepper-marker-upcoming:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.slate}"
    rounded: "{rounded.full}"
    size: "32px"
  search-card:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.xl}"
    padding: "24px"
  category-row:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.xl}"
    padding: "20px"
  quote-panel:
    backgroundColor: "{colors.sand}"
    rounded: "{rounded.lg}"
    padding: "12px"
  info-strip:
    backgroundColor: "{colors.info-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
  status-badge:
    backgroundColor: "{colors.sand}"
    textColor: "{colors.slate}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
---

# Design System: RideReserve

## Overview

**Creative North Star: "The Booking Desk"**

RideReserve is a service counter, not a showroom. Every surface opens on a centred column with one question and one calm card, in the manner of Perk (TravelPerk): a warm sand band at the top of the page, white below, ink-black actions and thin stone borders holding every field. The visitor states drive mode, place and dates, presses one large black button, and gets categories with prices. Nothing floats over a photograph and nothing competes with the form.

The palette is almost entirely neutral and warm. Near-black carries every decision the visitor makes; RideReserve red is a signature, not a colour field, and appears only where the brand speaks or where the visitor's current choice lives. Depth comes from borders and from the sand-to-white band change, not from shadows. Controls are big on purpose: the phone is the primary device, so primary buttons and fields stand 56px tall and pills 48px.

Density is relaxed. Forms run one column, centred, with 16-24px gaps; lists are divided by stone hairlines rather than boxed into card grids. Bricolage Grotesque gives headings a little warmth and character; Inter does all the reading and all the numbers.

**Key Characteristics:**
- Centred single-column layout: a 640px hero column, 576px form column, 768px list column.
- Near-black primary actions; red as accent only.
- Warm sand band at the top, white canvas below, ink footer.
- 1px stone borders and generously rounded corners; no gradients, no shadowed cards.
- 56px buttons and fields, 48px pills, 44px minimum tap areas on links.

## Colors

A warm-neutral palette held by near-black, with a single red signature used sparingly.

### Primary
- **Desk Ink** (ink): the action colour. Primary buttons, selected choice tiles, completed stepper markers, the selected card border, headings, the focus outline, and the footer field. Hover deepens to **Ink Lift** (ink-hover) on primary buttons.

### Secondary
- **RideReserve Red** (brand): the logo's red, used as an accent only. It fills the selected Drive Switch pill and the active stepper marker, draws the 2px underline mark beneath key text links and the current nav item, and paints text selection. **Blush** (brand-soft) is its tint, used only as the error badge background.

### Neutral
- **Canvas White** (canvas): page background below the hero band, every card, field and popover surface.
- **Desk Sand** (sand): the warm off-white band behind the hero and the "before you book" strip, photo placeholders, the trip-summary bar, quote panels, idle-pill and ghost-button hover.
- **Oat** (oat): secondary button fill.
- **Linen** (linen): highlighted item wash inside select and menu popovers.
- **Stone** (stone): the structural line. Field and card borders, list dividers, the stepper connector, outline buttons and the upcoming-step ring.
- **Hairline** (hairline): the softer default border, used for the sticky header rule and internal dividers inside cards.
- **Slate** (slate): secondary text, hints, placeholders, "or similar" qualifiers. Body copy that must recede also uses ink at 70-80% opacity.

### Status
- **Field Green** (success / success-soft): check marks beside suitability notes and success badges.
- **Amber Ledger** (warning / warning-soft): the demo-mode banner and "Sample price" labels.
- **Harbour Blue** (info / info-soft): the information strip under the search card, with its icon in full info and a 15% info border.
- **Signal Red** (destructive): inline field errors and invalid borders. Distinct from RideReserve Red so errors never read as brand.

### Named Rules
**The Red Is a Signature Rule.** RideReserve red marks exactly five things: the logo, the selected Drive Switch pill, the active stepper marker, underline marks on key links and the current nav item, and text selection. Primary buttons are never red. Errors use Signal Red, never brand red.

**The Ink Decides Rule.** Whatever the visitor commits to (a submit, a selected tile, a selected category, a completed step) turns ink. Ink is the colour of a decision.

## Typography

**Display Font:** Bricolage Grotesque (with Inter, Helvetica, Arial)
**Body Font:** Inter (with Helvetica, Arial)

**Character:** Bricolage brings a slightly characterful, friendly grotesque to headings, always bold and tightly tracked; Inter stays neutral and highly legible for forms, prices and policy text.

### Hierarchy
- **Display** (700, 48px from 640px up, stepping to 28px on phones, line-height 1.25): the page question, e.g. "Where are you headed?". Booking-step h1s use the same 28px phone size and grow to 36px.
- **Headline** (700, 30px, 24px on phones): section heads such as "Vehicle categories".
- **Title** (700, 20px): category names, sub-section heads ("What to bring", "Your route").
- **Title Small** (700, 18px): panel heads inside the flow ("Price", "Bring to collection").
- **Figure** (Inter 700, 24px, tight tracking, tabular figures): the pay-now price in category rows. Price lines in the review use tabular figures at body size.
- **Body Lede** (400, 18px): the one-line hero subtitle, capped near 28rem.
- **Body** (400, 16px, line-height 1.5): all running copy and field values. Fields never drop below 16px.
- **Label** (600, 14px): field labels, fieldset legends, definition terms. Hints and notes use the same size at 400 in slate.
- **Caption** (400-600, 12px): stepper labels on phones, badges, fine print.

### Named Rules
**The Headings Only Rule.** Bricolage Grotesque is for h1-h4 only. Qualifiers inside a heading ("or similar") drop back to Inter at 14px, regular, in slate.

**The Sentence Case Rule.** Headings, labels and buttons are sentence case at normal tracking. Booking references in monospace are the only letter-spaced text.

## Layout

Everything centres. The landing hero is a single column at most 640px wide, 16px side padding, with 24px top padding on phones and 64px from 640px up. The booking stepper and its forms sit in a 576px column; the category step and the landing category list widen to 768px. Header and footer use the page container (1152px max, 16/24/32px side padding by breakpoint).

Vertical rhythm is built from 4px steps: 8px between paired controls (date beside time), 16px between fields on phones and 20-24px on larger screens, 24px between blocks in a step, 40px between columns in a two-up strip, and 56px section padding rising to 64-80px from 640px.

Pick-up and return each place a date field beside a fixed 152px time field. Category rows go from photo-plus-text on phones (104px thumbnail) to a three-column row (176px photo, details, 208px price column with a stone divider) from 640px. Primary buttons are full width inside forms; on wider screens the stepper footer pairs a flexible primary with an auto-width outline Back button, primary on the right.

The main nav collapses into a right-hand sheet below 1280px.

**The One Column Rule.** Forms are centred and single column. Only the date/time pair and the yes/no tile pair share a row.

## Elevation & Depth

The system is flat. Depth comes from three moves only: the sand band changing to white, 1px stone borders, and an ink border on whatever is selected. Cards, rows, the search card and the stepper carry no shadow. The only shadows are on floating layers (select menus, the date popover), which use a small soft drop with a 10% ink ring so they read as lifted above the page. The sticky header is white at 85-95% opacity with a backdrop blur and a hairline bottom rule.

### Shadow Vocabulary
- **Popover lift** (`box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` plus a 1px ring at ink 10%): select menus and the calendar popover only.

### Named Rules
**The Border, Not Shadow Rule.** A resting surface is defined by a 1px stone line. Selection swaps the line to ink; it never adds a shadow.

## Shapes

Corners are generous and soft, scaled from a 12px base radius. Buttons, fields, choice tiles, thumbnails, quote panels and the information strip use the 16.8px radius; the search card, category rows, category cards, the trip-summary bar and the calendar popover use the 21.6px radius; select items and small panels sit at 12px. The Drive Switch, its pills, stepper markers and badges are fully round. Photos are clipped to their rounded containers at 4:3 in rows and 16:10 in cards, on a sand placeholder. Lines are always 1px; link underline marks are 2px with a 4px offset.

## Components

### Buttons
Big, quiet and black. One per decision.
- **Shape:** gently rounded (16.8px radius), 1px transparent border.
- **Primary:** ink fill, white text, 16px semibold, 56px tall with 24px side padding, full width in forms, optional trailing arrow icon. This is the large size and the default for every submit.
- **Compact:** the default size is 48px with 20px padding, used in the header ("Find a vehicle") and the trip-summary "Edit".
- **Hover / Focus:** primary deepens to ink-hover; outline and ghost take a sand wash. Focus shows a 3px ink ring at 50%; pressing nudges the button down 1px. Disabled drops to 50% opacity.
- **Outline:** white fill, 1px stone border, ink text. Used for secondary actions (Back, Request a quote, Get help).
- **Ghost / Link:** ghost has no fill until hover (header "Sign in"); link is ink text with underline on hover.

### Drive Switch (signature)
The segmented pill that opens every search. A fully round white track with a 1px stone border and 4px padding holds two 48px pills, each with a 20px leading icon and a 16px semibold label. Selected fills RideReserve red with white text; idle is ink at 70% and takes a sand wash on hover. It is a radio group; keyboard focus draws a 2px ink outline offset 2px around the pill.

### Inputs / Fields
- **Style:** 56px tall, white, 1px stone border, 16.8px radius, 16px side padding, 16px text, a 20px leading icon at ink 60% (map pin, calendar, clock). Text input, select trigger and date trigger share one chrome; textareas use the same border, radius and padding.
- **Hover / Focus:** hover darkens the border to ink at 40%. Focus and open state set an ink border with a 3px ink ring at 15%.
- **Error:** Signal Red border and a 15% Signal Red ring, with a linked message in 14px medium Signal Red below. An error summary sits at the top of the form.
- **Menus:** select popovers are white with 12px-radius items at least 48px tall; the calendar popover uses 44px day cells, weeks starting Monday.

### Choice Tiles
Two-up 56px tiles for yes/no questions: white with a stone border, ink at 40% on hover; selected fills ink with white text.

### Stepper
Four steps in a centred 576px row. 32px round markers on a 1px stone connector: completed markers are ink with a check and turn their connector ink; the active marker is RideReserve red with a white numeral; upcoming markers are white with a stone ring and a slate numeral. Labels are 12px on phones and 14px from 640px, semibold ink when active.

### Cards / Containers
- **Search card:** white, 1px stone border, 21.6px radius, 16px padding (24px from 640px), holding the fields and a full-width primary button.
- **Category row:** white, stone border (ink when selected), 21.6px radius, 16-20px padding; photo, name with "or similar", two green-checked suitability notes, then a price column showing the pay-now figure, the deposit due at pick-up, and the action.
- **Category card:** a 16:10 photo above a 20px-padded body; border goes ink at 40% on hover and full ink when selected.
- **Sand panels:** the trip-summary bar and "Bring to collection" use sand with a stone border; quote panels use sand with no border.
- **Landing list:** on the home page, categories are not boxed; they are rows separated by stone dividers with a "Check prices" link.

### Information Strip
A pastel note under the search card: info-soft fill, 15% info border, 16.8px radius, 12px by 16px padding, a 16px info-blue icon and 14px ink text.

### Status Badges
Fully round, 12px semibold, 4px by 10px. Tones pair a soft fill with its strong text (neutral: sand and slate; success; warning; info; error uses Blush with Signal Red).

### Links
Key links are 600-weight ink text with a 2px RideReserve red underline at a 4px offset and a minimum 44px tap height. In the desktop category list the underline rests in stone and turns red on row hover.

### Navigation
A sticky 64px white header with a hairline bottom rule: logo at 40px tall on the left, then 14px medium nav items in ink at 80%. The current page gets a 2px red underline at a 10px offset. Below 1280px the nav moves into a right-hand sheet opened by a 48px outline icon button. The footer is an ink field with white text at 80%.

## Do's and Don'ts

### Do:
- **Do** make every primary action an ink button, 56px tall, full width inside forms.
- **Do** keep RideReserve red to the logo, the selected Drive Switch pill, the active stepper marker, link underline marks and text selection.
- **Do** build fields from the shared 56px chrome: white, 1px stone border, 16.8px radius, leading icon.
- **Do** centre forms in a single column (576px in the flow, 640px in the hero).
- **Do** show selection by switching the border or fill to ink.
- **Do** put the warm sand band behind the top of a page and keep the rest white.
- **Do** keep tap targets at least 44px; pills 48px, buttons and fields 56px.

### Don't:
- **Don't** fill primary buttons with red, or use brand red for errors.
- **Don't** add shadows to cards, rows or the search card; shadows belong only to floating menus and popovers.
- **Don't** use gradients.
- **Don't** float the search form over a full-bleed car photo.
- **Don't** set Bricolage Grotesque on body text, labels or prices.
- **Don't** put a small uppercase label above a heading.
- **Don't** drop field text below 16px.
