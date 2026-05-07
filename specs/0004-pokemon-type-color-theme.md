# Spec 0004 – Pokémon Type Color Theme

**Status:** Active  
**Iteration:** 4  
**Author:** Architect agent  
**Date:** 2026-05-07

---

## 1. Goal

Establish a centralized type color theme as the authoritative source for Pokémon type colors, and refine the Pokémon card so that type identity is communicated through color alone — without any textual labels. Each Pokémon type maps to a single, well-defined color aligned with Pokémon GO conventions. All UI elements that reflect type identity must derive their color from this theme rather than from hardcoded values.

---

## 2. Context / Background

Iteration 3 added type indicators to the Pokémon card, using color as the primary signal and permitting the type name as supplementary text. Type colors were applied directly within components without a shared definition. This iteration removes the supplementary text entirely, making color the sole non-verbal signal, and introduces a centralized theme structure so that every type color is defined once and referenced consistently throughout the codebase. The application remains fully static; no new data sources or infrastructure are introduced.

---

## 3. Functional Behavior

### 3.1 Type color theme

- A single, centralized definition maps each of the 18 standard Pokémon types to exactly one color value.
- Color values conform to established Pokémon GO type color conventions.
- All UI elements that communicate type identity must derive their color from this centralized definition. No component may use a hardcoded type color value that bypasses the theme.

### 3.2 Visual communication of type on the card

- The Pokémon card must communicate type identity through color alone.
- No type name, label, abbreviation, or code (e.g. "Fire", "Water", "F", "1") is displayed on or within any type indicator.
- No explanatory legends, badges, chips, or annotations are added to the card or page solely to explain the meaning of colors.
- Primary type must be visually dominant relative to the secondary type.
- Secondary type, when present, must be visually distinguishable from the primary type without the use of text.

### 3.3 Single- and dual-type layout

- When a Pokémon has only a primary type, the card presents a single color indicator for that type.
- When a Pokémon has both a primary and a secondary type, the card presents two color indicators: one dominant indicator for the primary type and one subordinate indicator for the secondary type.
- The visual hierarchy between primary and secondary indicators must be perceivable at a glance on a 375 px wide viewport.

### 3.4 Card structure

- The card continues to display the Pokémon's name as established in previous iterations.
- The type indicators introduced in Iteration 3 remain on the card; this iteration refines their presentation by removing textual type labels and applying theme-derived colors.
- No other new data fields (images, stats, descriptions) are introduced.

### 3.5 Data sourcing

- Type data continues to be sourced from the existing build-time dataset, unchanged from previous iterations.
- No new data files, external APIs, or data ingestion steps are introduced.

---

## 4. Constraints

- **Static-only.** The application remains a fully static export. No API routes, server-side rendering at request time, middleware, or backend services are introduced.
- **No runtime network requests.** The browser must not make any outbound requests for Pokémon or type data.
- **No new data sources.** Type information must come exclusively from the existing build-time dataset.
- **Centralized type color theme.** Every type color must be defined in one place. No component may hardcode a type color value outside of the centralized theme definition.
- **Pokémon GO color conventions.** The color assigned to each type must match established Pokémon GO type colors. No arbitrary or custom palette is used.
- **Color as sole type signal.** Type identity must be conveyed exclusively through color. Type names, abbreviations, or any textual type identifiers must not appear on the card.
- **No explanatory UI.** No legends, tooltips, badges, chips, or annotations are added solely to explain the meaning of type colors.
- **Visual dominance of primary type.** The primary type indicator must be visually dominant relative to the secondary type indicator.
- **Readability preserved.** Color usage must remain subtle enough that the Pokémon's name and other card content remain clearly legible.
- **Default component styling preserved.** Existing component styling must not be unnecessarily altered. Changes are limited to what is required to apply theme-derived type colors and to remove textual type labels.
- **MUI only.** All UI components must come from the Material UI library. No other component libraries are introduced.
- **In-memory state only.** No selection or preference is persisted.
- **No new infrastructure or cost.** Deployment pipeline, hosting, and data sources remain unchanged.

---

## 5. Non-Goals

- Textual display of type names anywhere on the card or page.
- Type icons, badge images, or sprite assets.
- Type effectiveness, strengths, weaknesses, or matchup information.
- Hover tooltips, popovers, or instructional UI of any kind.
- Accessibility enhancements beyond what MUI provides by default.
- Custom animations or transitions.
- Dark mode or theme switching.
- Filtering or searching Pokémon by type.
- Global MUI theme overrides or application-wide theming beyond the type color definition.
- Any Pokémon data beyond name and type (images, stats, evolutions, descriptions).
- Changes to the build-time data ingestion script or the underlying dataset structure.
- Changes to the GitHub Actions deployment workflow.
- Any feature not explicitly stated in section 3.

---

## 6. Acceptance Criteria

The following criteria must all pass before this iteration is considered complete. Each criterion is independently verifiable.

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-01 | All 18 standard Pokémon type colors are defined in a single centralized location. | Inspect the codebase; confirm one file or module defines all 18 type-to-color mappings and no type color value is defined elsewhere. |
| AC-02 | No component contains a hardcoded type color value outside of the centralized theme definition. | Search the codebase for color strings or variables associated with type colors; confirm all references point to the centralized definition. |
| AC-03 | The color values in the centralized theme match established Pokémon GO type color conventions for all 18 types. | Compare each color value in the theme against the Pokémon GO type color reference; confirm they match. |
| AC-04 | When a Pokémon is selected, no type name, label, or abbreviation appears anywhere on the card. | Select several Pokémon; inspect the rendered card; confirm no text such as "Fire", "Water", "F", "Type 1", or equivalent is visible. |
| AC-05 | When a Pokémon with only a primary type is selected, the primary type color from the centralized theme is present on the card's visual surface — its background, border, or structural fill. | Select a single-type Pokémon; confirm the card container or a structural part of its surface carries the theme color for that type. |
| AC-06 | When a Pokémon with both a primary and a secondary type is selected, both type colors are present on the card's visual surface, with the primary type color occupying the more prominent portion. | Select a dual-type Pokémon; confirm both type colors are visible on the card's structural surface and the primary color is clearly more prominent. |
| AC-07 | The primary type is visually dominant on the card's surface. The secondary type is communicated through a subordinate surface treatment. The distinction is perceivable at a glance without reading text. | Select a dual-type Pokémon; confirm the primary type's surface treatment commands clearly more visual weight than the secondary type's treatment. |
| AC-08 | Type color is applied to the card container or its structural edges. No standalone element (e.g. circle, dot, chip, or badge) exists within the card solely to communicate type identity; no such element can be removed without leaving the card surface devoid of type color. | Inspect the rendered card; confirm type color appears on the card's structural surface; confirm no isolated symbol for type exists that is detached from the card container itself. |
| AC-09 | The secondary type, when present, is communicated through a secondary surface treatment of the card — such as a split, accent edge, or secondary fill — not through a separate added element. | Select a dual-type Pokémon; confirm the secondary type color is part of the card's structural surface, not an element placed on top of or beside the card. |
| AC-10 | The Pokémon's name remains clearly legible on the card when type colors are applied. | Select several Pokémon with varied types; confirm the name text is readable against the card surface. |
| AC-11 | A user can identify that a card carries one or two type colors at a glance from the card's surface treatment alone, without reading any text. | View the rendered card without consulting type data; confirm the presence of one or two distinct type colors is immediately apparent from the card's surface. |
| AC-12 | The card and its full type surface treatment are visible on a 375 px wide viewport without horizontal scrolling. | Open the page at 375 px width; select any Pokémon; confirm the full card surface is visible and the page does not scroll horizontally. |
| AC-13 | No legend, tooltip, badge, annotation, or standalone decorative type indicator is present on the card or page. | Inspect the rendered page; confirm no such explanatory or isolated UI element is present. |
| AC-14 | Type data is not fetched at runtime. The browser makes no outbound network requests when a Pokémon is selected. | Open browser DevTools Network tab; select a Pokémon; confirm zero requests to any external host. |
| AC-15 | Running `next build` produces a static export with no server-dependent artefacts. | Run `next build`; confirm `out/` contains only static files and no API or server routes. |

---

## 7. Risks

- **Loss of type legibility without text.** Removing type name text increases reliance on color alone. Users unfamiliar with Pokémon GO type colors may not immediately recognize a type. This risk is accepted per the design intent; the non-verbal communication requirement is explicit.
- **Color contrast on white backgrounds.** Some Pokémon GO type colors (e.g. Normal, Ice) are light. Indicators must remain visually distinct against the card background; if a theme color provides insufficient contrast, the indicator's presentation should ensure it remains perceivable without introducing text labels.
- **Primary/secondary visual hierarchy.** Achieving a clear visual dominance relationship between two color indicators using default MUI component styling may be constrained. The implementation must produce a perceptible hierarchy within those constraints.

---

## 8. Future Considerations

The following are explicitly deferred and must not influence the implementation of this iteration:

- Textual type labels as an accessibility or discoverability enhancement.
- Type icons or sprite assets.
- Type effectiveness or battle mechanics.
- Filtering or browsing Pokémon by type.
- Accessibility improvements beyond MUI defaults.
- Persistent user preferences or settings.
- Global application theming beyond the type color definition.
- Any detail beyond name and type on the Pokémon card.
