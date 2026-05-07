# Spec 0003 – Pokémon Type Display on Card

**Status:** Complete  
**Iteration:** 3  
**Author:** Architect agent  
**Date:** 2026-05-07

---

## 1. Goal

Extend the Pokémon card introduced in Iteration 2 to visually communicate each Pokémon's type or types. Every Pokémon has a primary type; some also have a secondary type. Both must be represented on the card using colour, sourced from the existing build-time dataset. No new data sources or infrastructure are introduced.

---

## 2. Context / Background

Iteration 2 introduced a card that displays only the selected Pokémon's name. The underlying build-time dataset already contains type information for each Pokémon. This iteration surfaces that data visually on the card without adding data sources, backend components, or cost-bearing infrastructure. The application remains fully static.

---

## 3. Functional Behavior

### 3.1 Type representation

- Every Pokémon has exactly one primary type. Some Pokémon have a secondary type in addition to the primary.
- When a Pokémon card is displayed, it must visually represent:
  - The primary type.
  - The secondary type, if one exists.
- Type information is sourced solely from the existing build-time dataset. No additional data is fetched at runtime.

### 3.2 Visual communication

- Each type is represented by a distinct colour consistent with Pokémon GO type colour conventions.
- Colour alone must be sufficient to distinguish one type from another at a glance on a mobile screen.
- No textual labels such as "Primary type", "Secondary type", "Type 1", or "Type 2" are shown.
- No explanatory copy or instructional text is added to the card.
- The type name may be shown as a concise text string (e.g. "Fire") only as a supplement to colour, not as the primary communication mechanism.

### 3.3 Single- and dual-type layout

- When a Pokémon has only a primary type, the card shows one type indicator.
- When a Pokémon has both a primary and a secondary type, the card shows two type indicators, one for each.
- The layout must remain uncluttered on a 375 px wide viewport. Both type indicators must be visible without horizontal scrolling or overflow.

### 3.4 Card structure

- The card continues to display the Pokémon's name as established in Iteration 2.
- Type indicators are added to the existing card. No other new data fields (images, stats, descriptions) are introduced.
- The name remains on the card alongside the type indicators.

### 3.5 Data sourcing

- Type data is consumed from the same build-time dataset used in previous iterations.
- No new data files, external APIs, or data ingestion steps are introduced.
- Type data is embedded in the application output at build time.

---

## 4. Constraints

- **Static-only.** The application remains a fully static export. No API routes, server-side rendering at request time, middleware, or backend services are introduced.
- **No runtime network requests.** The browser must not make any outbound requests for Pokémon or type data.
- **No new data sources.** Type information must come exclusively from the existing build-time dataset.
- **Pokémon GO colour conventions.** The colour assigned to each type must match established Pokémon GO type colours. No arbitrary or custom palette is introduced.
- **Colour as primary signal.** Type identity must be conveyed primarily through colour. Supplementary text (the type name) is permitted but must not be the sole or dominant indicator.
- **No labels or instructional copy.** The words "Primary", "Secondary", "Type 1", "Type 2", or any equivalent label must not appear on the card.
- **MUI only.** All UI components must come from the Material UI library. No other component libraries are introduced.
- **No custom theming.** No custom MUI themes are applied. Type colours are applied as direct colour values within the constraints of MUI component styling, without overriding the global theme.
- **In-memory state only.** No type selection or preference is persisted.
- **No new infrastructure or cost.** Deployment pipeline, hosting, and data sources remain unchanged.

---

## 5. Non-Goals

- Type effectiveness, strengths, weaknesses, or matchup information.
- Type icons, badge images, or sprite assets beyond colour-coded indicators.
- Hover tooltips, popovers, or instructional UI of any kind.
- Accessibility enhancements beyond what MUI provides by default.
- Custom animations or transitions.
- Dark mode or theme switching.
- Filtering or searching Pokémon by type.
- Any Pokémon data beyond name and type (images, stats, evolutions, descriptions).
- Changes to the build-time data ingestion script or the underlying dataset structure.
- Changes to the GitHub Actions deployment workflow.
- Any feature not explicitly stated in section 3.

---

## 6. Acceptance Criteria

The following criteria must all pass before this iteration is considered complete. Each criterion is independently verifiable.

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-01 | When a Pokémon with only a primary type is selected, the card displays exactly one type indicator using the Pokémon GO colour for that type. | Select a single-type Pokémon; confirm one colour indicator appears and matches the Pokémon GO convention for that type. |
| AC-02 | When a Pokémon with both a primary and a secondary type is selected, the card displays exactly two type indicators, each using the Pokémon GO colour for its respective type. | Select a dual-type Pokémon; confirm two distinct colour indicators appear, each matching the Pokémon GO convention for the corresponding type. |
| AC-03 | No type indicator contains a label such as "Primary type", "Secondary type", "Type 1", or "Type 2". | Inspect the rendered card; confirm no such label text is present. |
| AC-04 | The type name (e.g. "Fire") is visible on or within each type indicator as a concise text string. | Inspect the rendered card; confirm each indicator includes its type name. |
| AC-05 | The card continues to display the Pokémon's name. | Select any Pokémon; confirm the name is visible on the card alongside the type indicator(s). |
| AC-06 | No card is shown when no Pokémon is selected. | Load the page without selecting a Pokémon; confirm no card is visible. |
| AC-07 | Both type indicators for a dual-type Pokémon are fully visible on a 375 px wide viewport without horizontal scrolling. | Open the page at 375 px width; select a dual-type Pokémon; confirm both indicators are visible and the page does not scroll horizontally. |
| AC-08 | The type colours displayed match the Pokémon GO type colour conventions for all 18 standard types. | For a representative sample of types, compare the rendered colour against the Pokémon GO type colour reference; confirm they match. |
| AC-09 | Type data is not fetched at runtime. The browser makes no outbound network requests when a Pokémon is selected. | Open browser DevTools Network tab; select a Pokémon; confirm zero requests to any external host. |
| AC-10 | Running `next build` produces a static export with no server-dependent artefacts. | Run `next build`; confirm `out/` contains only static files and no API or server routes. |

---

## 7. Risks

- **Colour contrast on white backgrounds.** Some Pokémon GO type colours (e.g. Normal, Ice) are light and may have insufficient contrast against a white card background. The implementation must choose a presentation that remains legible; if a type colour is too light for text contrast, a border or contained chip style is preferred over flat text colouring.
- **Dataset type field naming.** The existing dataset may represent type data differently across Pokémon (e.g. missing secondary type field vs. a null value). The implementation must handle both cases without errors.

---

## 8. Future Considerations

The following are explicitly deferred and must not influence the implementation of this iteration:

- Filtering or browsing Pokémon by type.
- Type effectiveness, matchup, or battle mechanics.
- Type icons or badge sprite assets.
- Accessibility improvements beyond MUI defaults.
- Persistent type preferences or user settings.
- Any detail beyond name and type on the Pokémon card.
