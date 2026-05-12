# Spec 0008 – Pokémon Card Type Visual Language Refinement

**Status:** Draft  
**Iteration:** 8  
**Author:** Architect agent  
**Date:** 2026-05-12

---

## 1. Goal

Refine the visual language of the Pokémon card so that type identity is communicated through the card's structural material — its border and surface tint — rather than through applied color fills. The result must feel calm, confident, and immediately readable on a mobile viewport. Type color should reinforce the card's identity without dominating its content.

---

## 2. Context / Background

Iteration 4 introduced a centralized type color theme and established color as the sole type signal on the card, removing type name labels entirely. It applied type color to the card surface as a background fill: the title section carries a saturated type-colored background as the primary type treatment, with a subordinate treatment for the secondary type.

Subsequent iterations have preserved this visual structure. The saturated fill approach is effective at communicating type quickly, but it draws more attention than the card content it frames. Type color becomes emphasis rather than identity.

This iteration replaces the fill-based approach with a more restrained structural language. The card's outer boundary carries the type color, anchoring type identity to the card's perimeter rather than its interior surface. A low-weight background tint provides contextual type presence across the card surface without overshadowing content. The result is a card that communicates type quietly and with authority — closer to a system component than a game element.

The centralized type color theme introduced in Iteration 4 remains the sole source of truth for all type color values. The existing static dataset provides type information unchanged. No new data, infrastructure, or dependencies are introduced.

---

## 3. Functional Behavior

### 3.1 Type-themed card border

- The card's outer boundary carries the primary type color as a visible structural border.
- The border must read as the card's defining edge, not as an ornamental overlay.
- The border must be consistently rendered around the full perimeter of the card.
- For a single-type Pokémon, the border uniformly carries the primary type color.
- For a dual-type Pokémon, the border carries a secondary treatment that communicates the secondary type in addition to the primary. The primary type must remain visually dominant within the border. The precise distribution of primary and secondary type within the border is implementation-defined, provided the primary type's dominance is perceivable at a glance and the treatment reads as structural rather than decorative.

### 3.2 Subtle background tint

- The interior surface of the card carries a background tint derived from the primary type color.
- The tint must be low in visual weight: it supports type recognition without overpowering the card's text content, stat profile bars, or evolution chain navigation.
- The tint must not be applied at a saturation or opacity level that causes it to visually compete with text or card content.
- For dual-type Pokémon, the background tint reflects the primary type only. The secondary type is communicated through the border treatment in section 3.1, not through the tint.

### 3.3 Visual hierarchy and card cohesion

- The border is the primary structural carrier of type color. The tint is subordinate and contextual.
- The primary type must be more visually prominent than the secondary type across all color treatments present on the card.
- For both single-type and dual-type Pokémon, the card must read as a cohesive composition. The border and tint must feel like parts of a unified structure, not independently layered.

### 3.4 Preserved card content and behavior

- The card continues to display the same content as established in Iteration 7: Pokémon name, stat profile, and evolution chain navigation.
- The stat profile bars, evolution chain section, and autocomplete search remain visually and functionally unchanged.
- The structural content hierarchy and section ordering are preserved.
- URL-based selection state, evolution link navigation, and all other behaviors from Iteration 7 remain intact.

### 3.5 Data sourcing

- Type data continues to be sourced from the existing build-time dataset, unchanged.
- Type colors continue to be sourced exclusively from the centralized type color theme established in Iteration 4.
- No new data files, fields, or external sources are introduced.

---

## 4. Constraints

- **Static-only.** The application remains a fully static Next.js export. No API routes, server-side rendering at request time, or middleware is introduced.
- **No runtime network requests.** The browser makes no outbound requests for type, color, or any other data.
- **No new data sources.** Type information comes exclusively from the existing build-time dataset.
- **Centralized type color theme.** All type color values must be sourced from the centralized definition established in Iteration 4. No component may introduce a hardcoded type color value outside of that definition.
- **Structural type communication only.** Type color must appear exclusively on structural elements of the card — its border, its defining edges, or as a low-weight tint on its surface. Type color must not appear as a saturated or high-opacity solid fill on any section of the card. Type color must not appear as a standalone indicator: no dots, chips, badges, icons, or color swatches placed beside or on the card.
- **No type labels.** No type name, abbreviation, code, or label (e.g. "Fire", "Water", "Type") may appear on the card.
- **No explanatory UI.** No legends, tooltips, annotations, or symbols are introduced to explain or decode type color.
- **Readability preserved.** All text content on the card — Pokémon name, stat labels, evolution link text — must remain clearly legible against the background tint. The tint must not require text color inversion or reduced font weight to maintain legibility.
- **Primary type visual dominance.** The primary type must be more visually prominent than the secondary type across all treatments on the card.
- **No dramatic visual effects.** No gradients, heavy saturation, or ornamental effects may be introduced. The card must feel calm and restrained.
- **Mobile-first.** The primary design target is a 375 px wide viewport. The card must render correctly at this width without horizontal overflow or clipped border edges.
- **No new infrastructure or cost.** Deployment pipeline, hosting, and data sources remain unchanged.

---

## 5. Non-Goals

- Changes to the data displayed on the card (name, stat profile, evolution chain, types).
- Animations or transitions beyond default UI behavior.
- Accessibility enhancements beyond what the framework provides by default.
- Type icons, badge images, or sprite assets.
- Type labels or any textual communication of type identity.
- Comparison, ranking, or stat changes.
- Filtering or browsing Pokémon by type.
- Dark mode or theme switching.
- Hover states, tooltips, or popovers that change or explain type color.
- Changes to URL behavior or selection state introduced in Iteration 7.
- Any feature not explicitly stated in section 3.

---

## 6. Acceptance Criteria

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-01 | The card has a visible border that carries the primary type color, sourced from the centralized type color theme. | Select a single-type Pokémon; inspect the card's outer boundary; confirm a visible border in the expected primary type color is present around the full card perimeter. |
| AC-02 | The card's interior surface carries a background tint derived from the primary type color. | Select any Pokémon; inspect the card background; confirm a low-weight tint of the primary type color is present across the card's interior surface. |
| AC-03 | The background tint is low in visual weight and does not visually compete with the Pokémon name, stat bars, or evolution links. | Select Pokémon with varied types; confirm all text, stat bars, and evolution links are clearly visible and distinguishable against the card background. |
| AC-04 | For a dual-type Pokémon, the card border communicates both the primary and the secondary type, with the primary type visually dominant within the border. | Select a dual-type Pokémon (e.g. Bulbasaur, Grass/Poison); inspect the card's outer boundary; confirm both type colors appear on the outer boundary (not on any element placed inside or beside the card) and the primary type color occupies a clearly more prominent portion. |
| AC-05 | For a dual-type Pokémon, the background tint reflects the primary type only; the secondary type color is not present in the tint. | Select a dual-type Pokémon; confirm the card surface tint corresponds to the primary type color; confirm the secondary type color does not appear in the interior surface tint. |
| AC-06 | The primary type's overall visual presence on the card is greater than the secondary type's visual presence. | Select a dual-type Pokémon; confirm at a glance that the primary type color is more prominent than the secondary across all treatments on the card. |
| AC-07 | No standalone type indicator (dot, chip, badge, icon, color swatch) exists on the card; type color appears only on structural elements of the card. | Inspect the rendered card; confirm no isolated element whose sole purpose is to display a type color is present. |
| AC-08 | No type name, abbreviation, or label is displayed anywhere on the card. | Select several Pokémon with varied types; confirm no text such as "Fire", "Water", "Grass", "Type", or equivalent appears on the card. |
| AC-09 | No legend, tooltip, or explanatory annotation for type color is present on the card or page. | Inspect the rendered page; confirm no such explanatory element is present. |
| AC-10 | All type color values applied to the card border and tint are sourced from the centralized type color theme; no type color value is hardcoded outside of it. | Search the codebase; confirm all color values used in the card's border and tint reference the centralized theme definition. |
| AC-11 | The Pokémon name and all other card text are legible against the background tint without requiring text color inversion or reduced font weight. | Select Pokémon spanning a range of type colors, including light types (Normal, Ice, Electric) and dark types (Dragon, Ghost, Poison); confirm text remains legible in all cases. |
| AC-12 | The card's full visual treatment — including all border edges and the interior tint — is visible on a 375 px wide viewport without horizontal scrolling. | Open the page at 375 px viewport width; select any Pokémon; confirm the full card, including all border edges, is visible without horizontal scroll. |
| AC-13 | For a single-type Pokémon, the border is uniformly one type color and the card surface carries a single background tint. | Select a single-type Pokémon; confirm the border is a uniform color and the card tint is a single color. |
| AC-14 | For a dual-type Pokémon, the card reads as a unified composition — the color treatments feel like parts of a single structure, not two competing regions. | Select a dual-type Pokémon; confirm the card does not present visually fragmented or conflicting color regions and reads cohesively. |
| AC-15 | The stat profile bars from Iteration 6 remain visible and correctly proportioned against the background tint. | Select any Pokémon; confirm the Attack, Defense, and Stamina bars are present, visually distinct from the tinted background, and correctly scaled. |
| AC-16 | The evolution chain navigation from Iteration 7 remains functional and visually legible. | Select a mid-stage Pokémon; confirm predecessor and successor evolution links are visible, readable against the card surface, and clickable. |
| AC-17 | Running `next build` produces a static export with no server-dependent artefacts. | Run `next build`; confirm `out/` contains only static files and no API or server routes. |
| AC-18 | The browser makes no outbound network requests when a Pokémon is selected. | Open DevTools Network tab; select several Pokémon; confirm zero requests to any external host. |
| AC-19 | No section of the card carries a saturated or high-opacity solid fill of a type color. The card surface's base is the application background or a low-weight tint — not a solid type-color fill. | Select any Pokémon; inspect the card; confirm no card section has a solid saturated type-colored background fill. Confirm the card background reads as tinted, not filled. |

---

## 7. Risks

- **Tint opacity and readability on dark or saturated types.** Type colors such as Dragon, Ghost, and Poison are dark or heavily saturated. Even at low opacity, a tint of these colors may reduce text legibility on small screens. The implementation must select tint weight values that maintain legibility across all 18 type colors.
- **Border perceptibility on light type colors.** Types such as Normal, Ice, and Electric have light color values. A border in these colors may be insufficiently perceptible against a light page background. The border must be rendered at a weight and with sufficient color contrast to be perceptible for all 18 type colors.
- **Dual-type border treatment feeling decorative rather than structural.** Distributing two type colors within a single border requires a clear structural decision. If the division feels arbitrary or ornamental, it violates the design intent. The implementation must produce a treatment that reads as intentional and structural at small viewport sizes.
- **Primary dominance between visually similar type colors.** Some dual-type combinations involve colors of similar lightness or saturation (e.g. Grass and Bug, Water and Ice). Establishing clear primary visual dominance without introducing heavy contrast effects may be difficult. The implementation must ensure primary dominance is perceivable without resorting to dramatic visual differentiation.
- **Regression in stat bars or evolution links.** Introducing a background tint where a saturated fill previously existed may alter the visual context in which stat bars and evolution links are rendered. The implementation must verify that both remain clearly legible and proportioned after the tint is applied.

---

## 8. Future Considerations

The following are explicitly deferred and must not influence this iteration:

- Dark mode or system-level theme switching.
- Accessibility improvements to type color contrast beyond framework defaults.
- Type icons, sprite assets, or any graphical representation of type beyond color.
- Filtering or browsing Pokémon by type.
- Per-type custom typography, spacing, or card shape.
- Hover, focus, or active states that alter the card's type color treatment.
- Extension of the centralized type color theme beyond the border and tint use cases introduced here.
- Named URL routes or any changes to the URL and selection behavior introduced in Iteration 7.
