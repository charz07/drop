---
name: Drop
description: Taste-matched CPG discovery — four emerging brands, matched to your flavor profile, every session.
colors:
  # Primary — Ripe Goldenrod (OKLCH canonical; Stitch linter will warn, not error)
  accent: "oklch(0.82 0.20 80)"
  accent-dim: "oklch(0.82 0.20 80 / 0.14)"
  accent-text: "oklch(0.54 0.17 75)"
  accent-ink: "oklch(0.17 0.030 55)"
  # Neutral surfaces
  bg: "oklch(0.99 0.003 72)"
  surface: "oklch(0.97 0.006 70)"
  surface-raised: "oklch(0.94 0.010 68)"
  surface-hover: "oklch(0.91 0.014 66)"
  # Borders
  border: "oklch(0.87 0.016 65)"
  border-strong: "oklch(0.78 0.022 63)"
  # Ink ramp
  ink: "oklch(0.17 0.030 55)"
  ink-secondary: "oklch(0.38 0.022 55)"
  ink-muted: "oklch(0.56 0.015 55)"
  ink-disabled: "oklch(0.72 0.010 55)"
  # Reaction semantics
  like-bg: "oklch(0.93 0.10 80)"
  like-border: "oklch(0.78 0.16 80)"
  like-ink: "oklch(0.34 0.14 72)"
  maybe-bg: "oklch(0.95 0.05 76)"
  maybe-border: "oklch(0.76 0.08 74)"
  maybe-ink: "oklch(0.36 0.10 68)"
  pass-bg: "oklch(0.92 0.008 55)"
  pass-border: "oklch(0.70 0.012 55)"
  pass-ink: "oklch(0.44 0.014 55)"
  # Status
  error-ink: "oklch(0.48 0.18 22)"
  error-border: "oklch(0.28 0.12 22)"
  error-bg: "oklch(0.95 0.04 22)"
typography:
  display:
    fontFamily: "'Bricolage Grotesque', sans-serif"
    fontSize: "clamp(3rem, 12vw, 5rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Bricolage Grotesque', sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "'Bricolage Grotesque', sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    letterSpacing: "0.04em"
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
  "16": "64px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.md}"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
  button-primary-disabled:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-secondary}"
    height: "44px"
  button-ghost-hover:
    textColor: "{colors.ink}"
  reaction-btn:
    backgroundColor: "transparent"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.sm}"
    height: "52px"
  reaction-btn-want-active:
    backgroundColor: "{colors.like-bg}"
    textColor: "{colors.like-ink}"
  reaction-btn-maybe-active:
    backgroundColor: "{colors.maybe-bg}"
    textColor: "{colors.maybe-ink}"
  reaction-btn-no-active:
    backgroundColor: "{colors.pass-bg}"
    textColor: "{colors.pass-ink}"
  brand-tag:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.xs}"
    padding: "2px 8px"
---

# Design System: Drop

## 1. Overview

**Creative North Star: "The Warm Curator"**

Drop's visual system is built on one conviction: the recommendation earns trust by not over-explaining itself. Every surface is quiet enough to let the brand be the point. The Ripe Goldenrod accent appears exactly where decisions are made — primary actions, active reactions, the chat avatar, the moment the drop box blooms open — and nowhere else. Its restraint is the signal.

The ground is a near-white with a barely-perceptible goldenrod tint: warm not as a default food-app gesture, but because the hue bleeds just enough to connect the surfaces without announcing a color scheme. Bricolage Grotesque carries the display moments — drop numbers, persona headlines, "drop." on the lid — with compressed typographic weight that anchors each screen. DM Sans handles all the work text: invisible, efficient, earning no attention for itself.

What the system explicitly refuses to be: the democratic noise of Yelp, the clinical data surfaces of NielsenIQ, the transactional chrome of DoorDash, the listicle energy of BuzzFeed food content. Where those systems overwhelm with quantity, Drop withholds. The 2×2 box is not a constraint — it is the product.

**Key Characteristics:**
- Goldenrod accent used on ≤10% of any screen; its rarity is the cue, not the color
- Two-family type on a strong contrast axis: compressed display grotesque + warm humanist sans
- Tonal depth (bg → surface → surface-raised) as the primary depth language; shadows reserved for two moments only
- 3D flip card as the core interaction metaphor — the reveal earns the reaction
- Reaction vocabulary expressed in three chromatic registers, all derived from the same saffron hue family

## 2. Colors: The Goldenrod Palette

One color. One ramp. The palette is a warm-neutral field interrupted once by Ripe Goldenrod. Every surface tilt — the neutral ramp, the ink ramp, the border steps — sits at h≈55–80 so the accent lands cleanly when it appears.

### Primary

- **Ripe Goldenrod** (`oklch(0.82 0.20 80)`): The system's only color. Used on: primary button fill, chat avatar, chat send button, active reaction stamp over the card front, drop box bloom. Prohibited on decorative elements, section backgrounds, and icons. Its fill lightness (L=0.82) fails contrast as text against light surfaces — use `accent-text` instead.

- **Goldenrod Text** (`oklch(0.54 0.17 75)`): The dark-shifted accent for text on light backgrounds. Used on: drop rate hint, "more ↗" button, superlative insight labels, brand chat label, persona provisional hint, site link.

- **Goldenrod Dim** (`oklch(0.82 0.20 80 / 0.14)`, 14% alpha): Tinted background use only. Used on: user chat bubbles, dietary restriction tags.

**The One Voice Rule.** `--accent` (the fill) is for primary interaction surfaces only. Never use it as a decorative stripe, section header tint, or icon fill on a neutral background. If one surface on screen carries goldenrod, the surrounding surfaces must be neutral.

### Neutral

All neutrals share h≈55–72, angled toward goldenrod so the accent lands in-family. The four-step surface ramp and four-step ink ramp are the system's primary depth and hierarchy tools.

- **Warm Off-White** (`oklch(0.99 0.003 72)`): Page background. The tint is felt, not seen — it anchors the palette without announcing warmth.
- **Light Surface** (`oklch(0.97 0.006 70)`): Content panel backgrounds (brand sheet body, drop box body interior, chat screen).
- **Raised Surface** (`oklch(0.94 0.010 68)`): Cards — brand card faces, profile brand cards, dietary section, superlative stats. The primary depth signal.
- **Hover Surface** (`oklch(0.91 0.014 66)`): Interactive surface hover states.
- **Warm Border** (`oklch(0.87 0.016 65)`): Default dividers, group section borders, chat input underline.
- **Strong Border** (`oklch(0.78 0.022 63)`): Lid outline, drop box body border, ghost pill border (pass reaction badge), group separator.
- **Ink** (`oklch(0.17 0.030 55)`): Headings, brand names, primary body text. The warmest near-black in the system.
- **Secondary Ink** (`oklch(0.38 0.022 55)`): Supporting text, group labels, dietary labels, persona descriptions, ghost button default.
- **Muted Ink** (`oklch(0.56 0.015 55)`): Placeholder text, hint text, show/hide toggle labels. Confirmed ≥4.5:1 against all surface backgrounds.
- **Disabled Ink** (`oklch(0.72 0.010 55)`): Disabled state indicators only. Never for readable text — fails 4.5:1 on `--bg`.

### Semantic — Reaction Colors

Three chromatic registers, one per reaction. Want and maybe share the saffron hue family; pass is hue-neutral warm gray — a deliberate desaturation that signals withdrawal without negative connotation.

- **Want (saffron-warm)**: bg `oklch(0.93 0.10 80)` / border `oklch(0.78 0.16 80)` / ink `oklch(0.34 0.14 72)`
- **Maybe (muted goldenrod)**: bg `oklch(0.95 0.05 76)` / border `oklch(0.76 0.08 74)` / ink `oklch(0.36 0.10 68)`
- **Pass (neutral warm-gray)**: bg `oklch(0.92 0.008 55)` / border `oklch(0.70 0.012 55)` / ink `oklch(0.44 0.014 55)`

On the profile log, pass uses a ghost pill pattern (transparent bg, `border-strong` border) rather than the pass fill — because the card itself is already `surface-raised`, which makes the fill invisible.

### Status

- **Error**: ink `oklch(0.48 0.18 22)` (deep red, ≥6:1 on white), border `oklch(0.28 0.12 22)`, bg `oklch(0.95 0.04 22)`. Used in error banners and drop error messages only.

## 3. Typography

**Display Font:** Bricolage Grotesque (weight 800, sans-serif fallback)
**Body / UI Font:** DM Sans (weights 400/500/600, sans-serif fallback)

**Character:** The pairing works on an axis of maximum contrast. Bricolage Grotesque's compressed anatomy at 800 weight reads as editorial authority — there's confidence in the weight without needing size. DM Sans disappears into the content. The two families occupy entirely different visual registers; they never compete.

### Hierarchy

- **Display** (Bricolage Grotesque 800, `clamp(3rem, 12vw, 5rem)`, line-height 1.1, tracking -0.02em): Splash screen hero headline only. The "drop." lid mark.
- **Headline** (Bricolage Grotesque 800, 2.25rem, line-height 1.1, tracking -0.02em): Drop number ("drop 1"), persona label ("the heat seeker."), profile page title ("your taste."), fetching taglines.
- **Title** (Bricolage Grotesque 800, 1.5rem, line-height 1.1, tracking -0.02em): Brand sheet name.
- **Body** (DM Sans 400, 1rem, line-height 1.65): Chat bubbles, persona descriptions, brand sheet description body, taste summary. Max line length ~65ch via `max-width: 480px` app container.
- **Small body** (DM Sans 400, 0.875rem, line-height 1.5): Drop value tagline, user chat bubble, brand card description, brand sheet secondary text, general `muted` utility text.
- **Label** (DM Sans 500, 0.6875rem, tracking 0.04em): Brand tags, group headers, superlative stat labels, dietary labels, reaction badges, all UI chrome below 14px.

**The Display-Only Rule.** Bricolage Grotesque is reserved for display moments: headings, drop number labels, brand card names, and the lid logo. It must never appear in body paragraphs, form labels, buttons, or any text smaller than 0.875rem. DM Sans carries all UI chrome.

**The Tracking Floor Rule.** Display tracking is -0.02em — the tightest allowable. At Bricolage Grotesque 800 weight, tighter than -0.03em makes letters touch. Do not push further.

## 4. Elevation

Most surfaces in Drop are flat at rest. Depth is carried by the tonal ramp (bg → surface → surface-raised), not by shadows. Shadows appear at exactly two moments, each with a specific structural or choreographic role.

The drop box and the bottom sheet are the only surfaces with shadows. Cards, panels, dividers, and modals at rest use tonal separation only.

**The Two-Shadow Rule.** Shadows are structural (the drop box container lifts the interactive surface from the page) or choreographic (the saffron bloom fires once on open). Never decorative. If a new surface needs depth, reach for the tonal ramp first.

### Shadow Vocabulary

- **Container lift** (`0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.07)`): Applied only to the drop box outer wrapper. This is the single interactable container on the Drop screen. Not applied to cards, profile panels, or modals.
- **Box bloom** (animated saffron glow, fires on open): Peak value `0 0 70px oklch(0.82 0.20 80 / 0.22), 0 0 35px oklch(0.82 0.20 80 / 0.14)`. Fades to residual `0 0 40px oklch(0.82 0.20 80 / 0.08)`. The only moment a color appears in a shadow.
- **Box interior** (`inset 0 8px 20px rgba(0,0,0,0.06), inset ±4px 0 10px rgba(0,0,0,0.03)`): Interior shadow of the drop box body, simulating depth inside the box. Opens to add a faint goldenrod inset glow.
- **Brand card ambient** (`0 2px 8px rgba(0,0,0,0.07)`): Subtle lift on each flip card within the grid. Blur capped at 8px; never paired with a border on the same element.

**The Bloom-Once Rule.** The saffron glow appears only during the box-open animation sequence. Do not repurpose it for hover states, card selections, or profile sections. Its power comes from its singularity.

## 5. Components

Components respond to interaction through opacity and scale — never through color shift on default state or decorative border addition. Confidence through restraint.

### Buttons

- **Shape:** 8px radius (primary), focus ring only for ghost (4px radius outline)
- **Primary (`btn-primary`):** Ripe Goldenrod fill, near-black text, 52px height, full width, DM Sans 600 at 1rem. Hover: opacity 0.88. Active: scale(0.97). Disabled: opacity 0.35. Focus-visible: 2px goldenrod outline, 3px offset.
- **Ghost (`btn-ghost`):** Transparent background, 44px height, full width, DM Sans 500 at 0.875rem, `ink-secondary` text. Hover: text shifts to `ink`. No visible border at rest. Two ghost buttons in a sticky footer row take `flex: 1` each to split the full width.

### Reaction Buttons

Three-state toggle: want / maybe / pass. Default state is transparent with `border-strong` (1px). Active state swaps to the semantic tint without changing radius or height.

- **Default:** transparent bg, 1px `border-strong`, `ink-secondary` text, 6px radius
- **Want active:** `like-bg` fill, `like-border`, `like-ink` text
- **Maybe active:** `maybe-bg` fill, `maybe-border`, `maybe-ink` text
- **Pass active:** `pass-bg` fill, `pass-border`, `pass-ink` text
- 52px height in full contexts (brand sheet); 44px compact in card-back
- All states require `aria-pressed`. Active press: scale(0.96).

### Brand Tags (Chips)

Pill-shaped labels at 11px / 500 / 0.04em tracking. No border — `surface-raised` background provides visual separation from the page. Border was removed because it reads as generated metadata.

Six hash-assigned color families (saffron, herb-green, tomato, berry, ocean, teal) assigned deterministically by tag-name hash. Special variants: dietary (`accent-dim` bg + `accent-text` text); goal (muted sage green `oklch(0.95 0.05 155)` / `oklch(0.38 0.14 155)`).

### Brand Card — The Drop Grid (Signature Component)

The core interaction surface. Four flip cards in a 2×2 grid inside the drop box container.

- **Front face:** 3:2 aspect-ratio image with brand name below (Bricolage Grotesque xs, 800 weight, -0.02em). A reaction stamp overlays the full front face when a reaction is selected — colored tint with bold centered label text.
- **Back face:** Rotated 180° on Y-axis, reveals on hover (pointer devices) or tap (touch devices via JS class). Contains: brand name, 2-line clamped description, "more ↗" link (`accent-text`, 11px), and the three compact reaction buttons.
- **Flip animation:** `transform: rotateY(180deg)` on the inner element, 550ms `cubic-bezier(0.16, 1, 0.3, 1)`. Reduced motion: opacity crossfade (0.15s) with no 3D transform.
- **Entrance stagger:** Cards fade + translateY(0) with 80ms per-card delay after box opens.

### Brand Sheet (Bottom Sheet Modal)

Full brand detail view. Slides up from the bottom of the screen.

- **Shape:** 12px top radius (left and right), zero bottom radius — flush to screen edge
- **Entry:** `translateY(100%)` → `translateY(0)`, 0.28s expo-out. Overlay fades in at 0.18s.
- **Contents (top to bottom):** 16:9 hero image → brand name (title weight) → description → tag row → site link (`accent-text`, "visit site ↗") → reaction buttons
- **Close button:** 44px circular, `surface-raised` background, absolute top-right. `ink-muted` at rest, `ink` on hover.
- **Accessibility:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby` points to brand name. Focus trap via Tab intercept. Escape closes. Focus returns to trigger element on close.

### Profile Persona Card (Signature Component)

A full-width colored surface that identifies the user's taste archetype. Six personas, each with a distinct OKLCH hue at `L=0.91, C=0.07` tint strength — strong enough to read as a deliberately colored surface without requiring an outline.

- **Shape:** 8px radius, 20px internal padding
- **Contents:** Optional "early read" hint label (11px, `accent-text`) → persona headline (2.25rem, Bricolage Grotesque 800, persona-specific color at L≈0.36–0.40) → description paragraph (1rem, DM Sans, `ink-secondary`)
- **No border.** The colored surface carries the card identity. A 1px border reads as an AI metadata frame. The tint at L=0.91 provides sufficient contrast against the `--bg` ground (L=0.99) to register as a distinct surface.

### Navigation — Sticky Profile Footer

`position: sticky; bottom: 0` with `background: --bg` and a top `border: 1px solid --border` to prevent content bleed. Contains the primary CTA and ghost action row. The layout adapts based on whether a drop exists: both ghost buttons use `flex: 1` when the "back to drop" option is present; single centered ghost when not. Respects `env(safe-area-inset-bottom)` for notch devices.

## 6. Do's and Don'ts

### Do:

- **Do** use `--accent` (Ripe Goldenrod fill) exclusively for primary interactive surfaces — the main button, the chat send button, the avatar. Use `--accent-text` for goldenrod-colored text on light backgrounds; the fill lightness (L=0.82) fails text contrast.
- **Do** use the tonal surface ramp (bg → surface → surface-raised) as the primary depth signal before reaching for a shadow. Most surfaces need no shadow.
- **Do** use Bricolage Grotesque only at display scale: headings, drop number labels, the lid "drop." mark, brand card names. DM Sans handles all UI chrome, labels, and body text.
- **Do** keep `--tracking-display` at -0.02em. This is the tightest allowable for Bricolage Grotesque 800 weight. Tighter makes letters touch.
- **Do** provide `aria-pressed` on all reaction buttons and `aria-label` on icon-only buttons (chat send, sheet close). The reaction model depends on state disclosure.
- **Do** add `@media (prefers-reduced-motion: reduce)` alternatives for every animation. Card flip becomes an opacity crossfade; entrance animations collapse to instant transitions.
- **Do** respect `env(safe-area-inset-bottom)` on all sticky footers and full-height pages — the app targets notch and home-indicator devices.

### Don't:

- **Don't** add borders to persona cards. The tinted surface (`L=0.91, C=0.07`) carries the card identity. A 1px border reads as an AI metadata frame — the tell that a system generated the card, not a designer chose it.
- **Don't** add borders to brand tags. The `surface-raised` background provides visual separation. A border on tags reads as generated metadata.
- **Don't** use `--ink-disabled` (L=0.72) for any readable text. It fails 4.5:1 contrast on `--bg`. `--ink-muted` (L=0.56) is the minimum for text users need to read.
- **Don't** use Ripe Goldenrod on more than one prominent surface per screen. The primary button, the avatar, and the drop bloom are staggered across the user's flow — not stacked on the same screen.
- **Don't** add a match score, percentage, or algorithm explanation to any brand recommendation. Per PRODUCT.md: "the UI should never over-explain." If the recommendation is good, it speaks for itself.
- **Don't** use `border-radius` above 12px on cards or containers. `--radius-lg` (12px) is the cap. Full-pill radius (`999px`) is reserved for tags and reaction badges only.
- **Don't** make the interface feel like Yelp (democratic noise, star ratings, quantity signals), NielsenIQ (clinical data density, survey-like forms), DoorDash (transactional chrome, category tabs, price anchoring), or BuzzFeed food content (listicle energy, emoji-laden copy). These are the anti-references by name.
- **Don't** use side-stripe borders (`border-left` or `border-right` > 1px) as card or callout accents. Use full borders, tinted backgrounds, or nothing.
- **Don't** pair `border: 1px solid` with `box-shadow` at blur ≥ 16px on the same element. The drop box outer has shadows; its lid has a border. They are different elements.
- **Don't** use gradient text (`background-clip: text` + gradient fill). Goldenrod is expressed as a flat ink color (`--accent-text`) only, never as a gradient.
