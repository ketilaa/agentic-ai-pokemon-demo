# Spec 0010 – Pokémon Card Typed Visual Identity

**Status:** Draft  
**Iteration:** 10  
**Author:** Architect agent  
**Date:** 2026-05-13

---

## 1. Goal

Redesign the Pokémon card so that type identity is expressed structurally through differentiated card regions rather than as a uniform surface treatment. The card must feel "typed by nature" — its header firmly establishes which type the Pokémon is, while its content region remains visually neutral to support readable stat and evolution information. The result is a card that communicates type clearly at a glance, without ornamentation or emphasis.

---

## 2. Context / Background

Iteration 8 established a restrained type language: a full border in the primary type color, a low-opacity tint across the entire card surface, and a left accent stripe for the secondary type. This treatment is coherent but undifferentiated — every region of the card carries the same tint at the same weight.

The current design does not distinguish between where type identity is established and where capability information is read. This weakens both: the identity signal is diluted across the whole card, and the content area carries unnecessary color noise.

This iteration introduces explicit structural differentiation. The card is divided into a typed **header region** — where the Pokémon's identity and type are established — and a neutral **content region** — where capability information is read without color interference. The header carries the primary visual type treatment; the content carries none.

The redesign draws on the clarity of classic Pokémon trading cards, where the top band of the card immediately signals type and identity. It reinterprets this in a clean, modern manner: replacing saturated fills and ornamental framing with a structure-first approach in which the header's type color is restrained yet unambiguous, and the content reads as a calm, factual complement.

The Pokémon image (introduced in Iteration 9) continues to be displayed when available. Its placement and visual treatment must not conflict with the header's type identity function.

---

## 3. Functional Behavior

### 3.1 Card regions

The card is composed of four conceptual regions, each with a distinct visual responsibility:

**Card container** — the outermost card boundary. Carries the structural type border and the secondary type accent (when present). Provides the overall card shape.

**Card header** (identity zone) — the topmost interior region. Contains the Pokémon name. Carries the primary type color as a background treatment, which is the strongest type-color expression on the card. The header communicates type identity at a glance.

**Card content** (capability zone) — the lower interior region. Contains the stat profile (ATK, DEF, STA bars) and the evolution chain navigation. Carries no type-derived color treatment. Must feel visually calm and neutral.

**Card media** (optional) — present only when a Pokémon image is available. Carries no type-derived color treatment. Must not visually compete with or diminish the header's type identity.

### 3.2 Card header — type identity

- The header background is derived from the primary type color.
- The header type treatment is the strongest color expression on the card: its visual weight is perceptibly greater than the card container tint (if any exists) and markedly greater than the neutral content below.
- The Pokémon name appears in the header region.
- The Pokémon name must be legible against the header background for all 18 type colors, including dark and saturated types.

### 3.3 Card container — structural type border

- The card's outer boundary carries the primary type color as its border.
- For dual-type Pokémon, the card container also carries a secondary type accent that communicates the secondary type. This accent must be subordinate to the primary border treatment in visual weight.
- The secondary type accent, when present, appears on the card container only — not on the header or content regions.
- For single-type Pokémon, no secondary type accent is present.

### 3.4 Card content — neutrality

- The content region carries no type-derived color treatment.
- The stat profile bars and evolution chain navigation must be legible against the neutral content background.
- The visual contrast between the typed header and the neutral content must be immediately perceivable: the content must feel quieter than the header.

### 3.5 Card media — optional image

- When `imageUrl` is non-null, the card displays the Pokémon image within the media zone.
- The media zone carries no type-derived color treatment.
- When `imageUrl` is null, no placeholder, reserved space, or empty region is rendered.

### 3.6 Type color sourcing

All type colors used across the card — header background, border, and secondary accent — must originate exclusively from the centralized `TYPE_COLORS` registry established in Iteration 4. No type color value may be hardcoded outside that definition.

### 3.7 Preserved behaviors

All behaviors and displayed content from prior iterations remain unchanged:
- Pokémon name, stat profile bars, and evolution chain navigation (Iterations 5–7)
- URL-based selection state and evolution link navigation (Iteration 7)
- Image display from `imageUrl` (Iteration 9)
- Stat bars scaled to dataset maxima (Iteration 6)

---

## 4. Constraints

- **Static-only.** The application remains a fully static Next.js export. No API routes, server-side rendering at request time, or middleware is introduced.
- **No new data sources.** Type and image information come exclusively from the existing build-time dataset.
- **No type labels.** No type name, abbreviation, or label may appear on the card.
- **No standalone type indicators.** No badges, chips, dots, icons, or color swatches placed beside or on the card solely to indicate type.
- **No explanatory UI.** No legends, tooltips, or annotations to decode type color.
- **Restrained color.** No heavy saturation, dramatic gradients, or ornamental effects. The header type treatment must feel integral to the card structure, not applied on top of it.
- **Content neutrality is mandatory.** The content region must carry no type-derived color treatment.
- **Header legibility is mandatory.** The Pokémon name must remain legible against the header background for all 18 standard type colors.
- **Primary type visual dominance.** The primary type must be more visually prominent than the secondary type across all treatments on the card.
- **Mobile-first.** The primary design target is a 375 px wide viewport. No horizontal overflow.
- **No new infrastructure or cost.** Deployment pipeline, hosting, and data sources remain unchanged.

---

## 5. Non-Goals

- Changes to the data displayed on the card (name, stat profile, evolution chain, image).
- Animations or transitions beyond framework defaults.
- Accessibility enhancements beyond framework defaults.
- Type icons, sprite assets, or graphical type symbols.
- Type effectiveness, gameplay logic, or type matchup information.
- Dark mode or system-level theme switching.
- Filtering or browsing Pokémon by type.
- Hover states, tooltips, or popovers that change or explain type color.
- Typography-based type identity signals (font weight, typeface variation per type).
- Any change to URL behavior, selection state, or search behavior (Iterations 2, 7).
- Any feature not explicitly stated in section 3.

---

## 6. Acceptance Criteria

### Card structure

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-01 | The card has a distinct header region identified by `data-testid="card-header"` that contains the Pokémon name. | Inspect the rendered card; confirm an element with testid `card-header` is present and contains the Pokémon name text. |
| AC-02 | The card has a content region identified by `data-testid="card-content-section"` that contains the stat profile bars. | Inspect the rendered card; confirm an element with testid `card-content-section` is present and contains `stat-bar-atk`, `stat-bar-def`, and `stat-bar-sta`. |
| AC-03 | The Pokémon name does not appear in the content region. | Inspect the content region; confirm the Pokémon name text is not present within `card-content-section`. |

### Type communication — header

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-04 | The card header carries a background treatment derived from the primary type color. | Inspect `data-header-tint-color` on the `card-header` element; confirm it equals the primary type's color value from `TYPE_COLORS`. |
| AC-05 | The header background treatment is visually stronger than the content region background. | Inspect `data-header-tint-opacity` on the header and `data-content-tint-opacity` on the content; confirm the header value is strictly greater than the content value. |
| AC-06 | The header type treatment exceeds a meaningful visibility threshold. | Inspect `data-header-tint-opacity` on the header; confirm the value is greater than `0.15`. |

### Type communication — container border and secondary type

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-07 | The card container border carries the primary type color. | Inspect `data-border-primary-color` on the card container; confirm it equals the primary type's color from `TYPE_COLORS`. |
| AC-08 | For a dual-type Pokémon, a secondary type accent is present on the card container and reflects the secondary type color. | Render a dual-type Pokémon; inspect `data-border-secondary-color` on the card container; confirm it equals the secondary type's color from `TYPE_COLORS`. |
| AC-09 | For a single-type Pokémon, no secondary type accent is present on the card container. | Render a single-type Pokémon; inspect `data-border-secondary-color`; confirm it is empty, and `data-border-secondary-sides` is `0`. |
| AC-10 | The primary type is visually dominant over the secondary type on the card container. | Render a dual-type Pokémon; inspect `data-border-primary-sides` and `data-border-secondary-sides`; confirm the primary count is strictly greater. |

### Content neutrality

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-11 | The content region carries no type-derived color treatment. | Inspect `data-content-tint-opacity` on the `card-content-section` element; confirm the value is `0`. |
| AC-12 | The stat bars are present and retain their data attributes inside the content region. | Render any Pokémon; confirm `stat-bar-atk`, `stat-bar-def`, `stat-bar-sta` are present inside `card-content-section`. |
| AC-13 | The evolution chain navigation (where applicable) is present inside the content region. | Render a mid-stage Pokémon; confirm `evolves-from-section` and `evolves-to-section` are inside `card-content-section`. |

### Type label prohibition

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-14 | No type name or label appears anywhere on the card. | Select Pokémon with varied types; confirm no type name text (e.g., "Fire", "Water", "Grass") appears on the rendered card. |
| AC-15 | No standalone type indicator (badge, chip, dot, icon, swatch) is rendered on the card. | Inspect the DOM; confirm no element whose sole purpose is to indicate type (testid or role such as `type-badge`, `type-chip`, `type-swatch`, `type-dot`) is present. |

### Legibility

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-16 | The Pokémon name is legible in the header for dark and saturated types. | Render Pokémon of types Dragon, Ghost, Poison, and Dark; confirm the name text is readable against each header background. |
| AC-17 | The stat bars are legible in the content region — visually distinct from the neutral content background. | Render any Pokémon; confirm the stat bars are visually distinguishable from the content background. |

### Image and media

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-18 | When `imageUrl` is non-null, the image element is present on the card. | Render a Pokémon with a known non-null `imageUrl`; confirm testid `pokemon-image` is present. |
| AC-19 | When `imageUrl` is null, no image element or placeholder is rendered. | Render a Pokémon with `imageUrl` null; confirm testid `pokemon-image` is absent. |

### Build and static export

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-20 | Running `next build` produces a static export with no server-dependent artefacts. | Run `next build`; confirm `out/` contains only static files. |

---

## 7. Risks

- **Name legibility against the typed header background.** For dark and saturated types (Dragon `#5060E1`, Ghost `#704170`, Poison `#9141CB`, Dark `#624D4E`), even a moderate-opacity tint may reduce legibility of dark body text. The implementation must choose a header tint weight — and, if necessary, a header text color — that maintains legibility across all 18 standard type colors. AC-16 covers this.

- **Perceivable distinction between header and content.** The header–content split is the central design decision of this iteration. If the visual difference between the typed header and the neutral content is too subtle, the structural intent is lost. The implementation must select tint values that produce an immediately perceivable difference at 375 px viewport width.

- **Secondary type accent conflict with the typed header.** With the header now carrying strong primary type color, the secondary accent on the container must not create a competing identity signal. It must read as a subordinate structural detail. The visual relationship between the header tint and the secondary accent requires deliberate treatment.

- **Card media placement adjacent to the header.** The image zone's position relative to the header determines whether it strengthens or dilutes the type identity signal. If the image is placed near or within the header zone, the two must not visually compete. The implementation must treat the media zone as distinct from the identity function of the header.

- **`card-title-section` testid retirement.** Current tests reference `data-testid="card-title-section"` for the name region. This iteration renames that region to `card-header` to reflect its expanded structural role. Existing tests that assert on `card-title-section` must be updated or removed. The old testid must not remain as dead or conflicting test state after the migration.

- **Tint weight calibration.** The header tint must exceed the 0.15 threshold required by AC-06, while still reading as restrained and non-ornamental per the design constraints. The content must be at exactly 0. These values must be explicitly set and surfaced as data attributes for testability.

---

## 8. Future Considerations

The following are explicitly deferred and must not influence this iteration:

- Dark mode or system-level theme switching, including per-type text contrast improvements.
- Typography-based type identity signals (header font weight, typeface variation per type).
- Animated transitions on card selection change.
- Accessibility improvements to header color contrast beyond framework defaults.
- Filtering, sorting, or browsing Pokémon by type on the main page.
- Type icons, sprite assets, or any graphical representation of type beyond color.
- Named URL routes or any changes to the URL and selection behavior from Iteration 7.
