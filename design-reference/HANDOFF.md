# Booking modal redesign — implementation handoff

> Approved spec for the 4-step booking wizard redesign. The `.dc.html` mockups are
> the visual source of truth; build with the app's real stack (React components,
> `pricing.js`, WhatsApp/Razorpay). Do not copy the `.dc.html` format.

## Decisions locked with the owner (2026-09-27)
- **Step 4 = enquiry AND payment both**: "Send on WhatsApp" + "Pay now" (Razorpay). The
  existing booking API, payment verify/webhook and boarding pass (`Step5ConfirmationPass`,
  `/pass/[id]`) stay in place.
- **GST**: prices are shown inclusive, with a summary line "Includes GST (12%): ₹X".
- **Availability**: all weekends show "Open" for now (no N-left/sold-out source yet).
- **Kids**: 50% of the adult price (unchanged).
- **Email**: optional.
- **Photos**: use each stay's real image in the cards.
- **Add-on copy**: mockup placeholder descriptions approved for now.

## Design tokens
See `src/components/booking/bookingUI.js` (`BK`). ink `#13201a`, muted `#56635a`,
body-2 `#3f4d44`, primary `#1c6b3c`, primary-soft `#eef5ee`/`#f1f7f1`, cta `#e9aa3a`
(text `#1a1305`), lime `#d5ed55`, panel `#f5f7f1`, line `rgba(19,32,26,0.10–0.16)`,
few-left `#9a4f00`, veg/non-veg `#1c6b3c`/`#d9893a`. Radii: modal 24 · cards 14–16 ·
inputs 12 · pills 999. Hit targets ≥40 (steppers), ≥44 (close/chips), 52 (CTA).
Fonts use the site's heading face for display, inherited body. No emoji — stroke icons only.

## Layout
**Desktop (≥768px):** centred modal ~960×720 (max-height 90vh). Header (thumbnail, title,
property line + altitude badge, 44px close) then a 4-step progress bar (completed steps show
a check and are clickable). Body is two columns: left ~600px scrolls (step content); right
360px `<aside>` live summary (dates, guests, stay, line items, "Included for every camper"),
total, "₹0 due now · Pay on arrival", Back + main button at the bottom.

**Mobile (<768px):** full-height bottom sheet with a grab handle. Header: back arrow (steps
2–4), centred title with "Step X of 4", close, 4-part progress. Scroll area for content.
Sticky bottom bar: total, one-line summary, "₹0 due now · pay on arrival", main button.
Form inputs use 16px text so iOS doesn't zoom.

## Steps
- **Step 1 · Stay & dates:** stay cards (radio group; full names, "Sleeps N", price/person,
  real photo, green border+tint+check when selected, no "Selected" badge). Weekend date
  buttons (next five Saturdays, status shown, sold-out disabled+struck) + "See more dates" →
  existing picker; check-in/out times shown once. Adults (12+, min 1) & Kids (5–11, min 0)
  counters, max 12 total, price per head; presets removed. Live unit line: `ceil(campers/cap)`
  and spare spots. Remove "Change Sanctuary". CTA "Continue to add-ons".
- **Step 2 · Add-ons:** grouped Experiences / Food / Around the campfire. Types: flat (checkbox),
  per_person (checkbox, "₹X × N people"), quantity (counter). Selected rows get border+tint and
  a summary line. CTA "Skip add-ons" when empty, else "Continue". Nothing preselected.
- **Step 3 · Guest details:** full name (required), WhatsApp number with fixed +91 box, email
  (optional). Meals: single veg counter (0…N), non-veg = N−veg, two-colour split bar. Dietary
  needs multi-select (Mild spice for kids · Jain · Gluten-sensitive). Notes optional. Inline
  errors on blur/submit. CTA "Review booking".
- **Step 4 · Review & send:** review list with Edit links per section; "What happens next"
  (Send enquiry → We confirm → Pay on arrival); WhatsApp message preview; primary
  "Send on WhatsApp" + secondary "Pay now" (Razorpay). "Online payment" as helper text.

WhatsApp number: +91 90748 58014. Message built from state (property, dates, stay/units,
guests, add-ons or "None", meals + dietary, notes, estimated total, name).

## Accessibility
Real button/input/label; `role="dialog"` + `aria-modal` + `aria-labelledby`; focus trapped,
Esc closes, focus returns to the opener; `aria-current="step"`; `aria-live` on totals/counters;
visible 3px `#1c6b3c` focus ring.

## Open questions still to confirm later
1. GST rate confirmed 12% (accommodation) — change if 5%/18%.
2. Real availability source for "N left"/"Sold out" (currently "Open" only).
3. Replace the two placeholder add-on descriptions (forest walk, extra campfire hour) when ready.
