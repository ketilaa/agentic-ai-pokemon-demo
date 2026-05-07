# Spec 0005 – Pokémon Strength Profile and Card Layout Refinement

**Status:** Active  
**Iteration:** 5  
**Author:** Architect agent  
**Date:** 2026-05-07

---

## 1. Goal

Introduce a visual strength profile on the Pokémon card that communicates each Pokémon's base Attack, Defense, and Stamina stats at a glance. Simultaneously, refine the card into two distinct sections — a title section and a content section — to establish a clear visual hierarchy between the Pokémon's identity (name and type) and its capability (base stat profile). All data is sourced from the existing build-time dataset. No new data sources or infrastructure are introduced.

---

## 2. Context / Background

Iterations 1–4 delivered a static Pokémon search experience in which the card communicates a Pokémon's identity through its name and type-based surface color treatment. The build-time dataset already contains three base stats for each Pokémon — Attack, Defense, and Stamina — which have not yet been surfaced to the user. This iteration introduces a visual stat profile and reorganizes the card layout to support two conceptually distinct zones. The type color treatment from Iteration 4 is preserved without alteration in the title section.

---

## 3. Functional Behavior

### 3.1 Base stat data

- The existing build-time dataset contains three base stats for each Pokémon: Attack, Defense, and Stamina.
- All three stats are consumed at build time from the existing dataset. No additional data is fetched at runtime.
- Stats represent raw base values specific to each individual Pokémon and are not normalized against the broader Pokémon roster.

### 3.2 Strength profile

- When a Pokémon is selected, the card displays a visual strength profile representing all three base stats simultaneously.
- The profile must communicate the relative magnitude of each stat within the selected Pokémon's own profile — a user must be able to perceive which stat is highest, lowest, or balanced without reading numbers.
- The profile must be interpretable at a glance without reading numerical values.
- Displaying raw stat numbers is not required but is not prohibited.
- Textual labels for individual stats (e.g. "Attack", "Defense", "Stamina") are not required but are not prohibited if used minimally and without adding visual clutter.

### 3.3 Card layout

The card is organized into two conceptual sections:

**Title section**
- Contains the Pokémon's name.
- Carries the type-based surface treatment (background color or gradient) established in Iteration 4, unchanged.
- Represents the Pokémon's identity: who it is and what type it belongs to.

**Content section**
- Contains the strength profile.
- Does not carry the type-based surface treatment; its appearance is visually calmer than the title section.
- Represents the Pokémon's capability: how its base stats are distributed.

### 3.4 Visual hierarchy

- The title section is perceived first and commands greater visual weight.
- The content section is subordinate in visual prominence.
- The strength profile must not visually compete with the Pokémon's name or the type color treatment.
- The two-section structure must be evident from the rendered card without requiring explicit borders, labels, or headings to explain it.

### 3.5 Data sourcing

- Base stats are consumed from the existing build-time dataset, unchanged.
- No new data files, external APIs, or ingestion steps are introduced.

---

## 4. Constraints

- **Static-only.** The application remains a fully static export. No API routes, server-side rendering at request time, middleware, or backend services are introduced.
- **No runtime network requests.** The browser must not fetch Pokémon or stat data at runtime.
- **No new data sources.** Stats must come exclusively from the existing build-time dataset.
- **All three stats represented simultaneously.** Attack, Defense, and Stamina must all be visible at the same time on the card.
- **Relative, not global.** The stat profile communicates relative magnitude within the selected Pokémon's own three stats. No cross-Pokémon normalization or global scaling is applied.
- **Interpretable without numbers.** The strength profile must convey stat relationships visually; raw numerical values are supplementary, not required.
- **Hierarchy preserved.** The strength profile must not visually compete with the name or type color treatment.
- **Type surface treatment unchanged.** The title section must carry the type-based background treatment from Iteration 4 without modification.
- **Mobile-first.** The primary design target is a small-screen viewport (375 px wide).
- **MUI only.** All UI components must come from the Material UI library. No other component libraries are introduced.
- **In-memory state only.** No persistence of selected Pokémon or stat data.
- **No new infrastructure or cost.** Deployment pipeline, hosting, and data sources remain unchanged.

---

## 5. Non-Goals

- Stat comparison between multiple Pokémon.
- Rankings, percentiles, or normalization against the full Pokémon roster.
- Combat simulation, type effectiveness, or derived battle metrics.
- Move data or any Pokémon attribute beyond name, type, and base stats.
- Accessibility enhancements beyond what MUI provides by default.
- Custom animations or transitions.
- Dark mode or theme switching.
- Changes to the type color theme or surface treatment defined in Iteration 4.
- Filtering or searching Pokémon by stat values.
- Any feature not explicitly stated in section 3.

---

## 6. Acceptance Criteria

The following criteria must all pass before this iteration is considered complete. Each criterion is independently verifiable.

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-01 | The parsed Pokémon data exposes Attack, Defense, and Stamina as distinct numeric values for each entry. | Inspect the data model; confirm all three stat fields are present and numeric for a representative sample of Pokémon entries. |
| AC-02 | When a Pokémon is selected, the card displays a strength profile that represents all three base stats simultaneously. | Select any Pokémon; confirm all three stats are represented at the same time on the card. |
| AC-03 | The strength profile communicates the relative magnitude of each stat without requiring the user to read numerical values. | Select a Pokémon with clearly unbalanced stats; confirm the visual profile reflects the imbalance without relying on numbers to convey it. |
| AC-04 | The card is divided into two visually distinct sections: a title section and a content section. | Inspect the rendered card; confirm two clearly differentiated zones are present without requiring labels or borders to explain them. |
| AC-05 | The title section contains the Pokémon's name. | Select any Pokémon; confirm the name appears in the title section. |
| AC-06 | The title section carries the type-based surface treatment from Iteration 4: a solid type color for single-type Pokémon and a gradient split for dual-type Pokémon. | Select a single-type and a dual-type Pokémon; confirm the title section background matches the respective Iteration 4 treatment in each case. |
| AC-07 | The content section does not carry the type-based surface treatment. | Inspect the rendered card; confirm the content section background is visually distinct from and calmer than the title section. |
| AC-08 | The strength profile is contained within the content section. | Select any Pokémon; confirm the stat visualization appears in the content section and not in the title section. |
| AC-09 | The title section is visually more prominent than the content section. | Inspect the rendered card; confirm the title section commands greater visual weight than the content section. |
| AC-10 | The strength profile does not visually compete with the Pokémon name or the type color treatment. | Inspect the rendered card; confirm the name and type surface remain the most visually prominent elements on the card. |
| AC-11 | No card is shown when no Pokémon is selected. | Load the page without selecting a Pokémon; confirm no card is visible. |
| AC-12 | The full card, including both the title section and the content section, is visible on a 375 px wide viewport without horizontal scrolling. | Open the page at 375 px width; select any Pokémon; confirm the complete card is visible without horizontal scrolling. |
| AC-13 | Base stat data is not fetched at runtime. The browser makes no outbound network requests when a Pokémon is selected. | Open browser DevTools Network tab; select a Pokémon; confirm zero requests to any external host. |
| AC-14 | Running `next build` produces a static export with no server-dependent artefacts. | Run `next build`; confirm `out/` contains only static files and no API or server routes. |

---

## 7. Risks

- **Stat scale variance.** Pokémon GO base stats span a wide numerical range. If the strength profile does not scale each stat relative to the selected Pokémon's own maximum, extreme stat values may cause the visualization to appear compressed or clipped. The implementation must use the Pokémon's own three stats as the internal reference for scaling.
- **Visual competition with type color.** A strength profile containing three distinct visual elements may introduce clutter that competes with the type-colored title. The content section's deliberately calm appearance and subordinate visual weight are the primary mitigations.
- **Name legibility in the title section.** Splitting the card into two sections must not reduce the legibility of the Pokémon's name. The title section must retain sufficient height and contrast for the name to remain clearly readable.

---

## 8. Future Considerations

The following are explicitly deferred and must not influence the implementation of this iteration:

- Cross-Pokémon stat comparison or browsing by stat range.
- Display of CP (Combat Power), IV values, or level-scaled stats.
- Move data or battle performance metrics.
- Accessibility improvements beyond MUI defaults.
- Persistent user preferences (e.g. preferred stat view).
- Any Pokémon attribute beyond name, type, and base stats.
