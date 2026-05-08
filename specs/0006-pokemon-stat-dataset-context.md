# Spec 0006 – Pokémon Stat Contextualization Against Dataset Maxima

**Status:** Draft  
**Iteration:** 6  
**Author:** Architect agent  
**Date:** 2026-05-08

---

## 1. Goal

Improve the interpretability of the strength profile introduced in Iteration 5 by presenting each base stat in proportion to the maximum value for that stat across the full Pokémon dataset. A user must be able to understand — at a glance — whether a given stat is low, moderate, or high relative to what is achievable in the dataset, without reading raw numbers and without comparing multiple Pokémon side-by-side. All contextual values are derived at build time from the existing static dataset.

---

## 2. Context / Background

Iteration 5 introduced a strength profile that communicates the relative magnitude of Attack, Defense, and Stamina within a single Pokémon's own stat distribution. This profile answers "which of this Pokémon's stats is strongest?" but does not answer "how strong is this stat among all Pokémon?" A Pokémon with uniformly high stats looks identical in shape to one with uniformly low stats under the current model. This iteration resolves that limitation by anchoring each stat's visual scale to the dataset maximum for that dimension, giving each bar or indicator a fixed and meaningful reference point.

---

## 3. Functional Behavior

### 3.1 Dataset-derived stat maxima

- At build time, the maximum value for each stat dimension — Attack, Defense, and Stamina — is computed across all Pokémon entries in the existing dataset.
- Each maximum is computed independently per dimension. The Attack maximum, Defense maximum, and Stamina maximum are three separate reference values.
- These maxima are embedded in the application at build time and do not require runtime computation or network access.

### 3.2 Stat representation

- Each of the three stats is displayed as a proportion of its respective dataset maximum.
  - Attack is represented as `pokémon_attack / dataset_max_attack`.
  - Defense is represented as `pokémon_defense / dataset_max_defense`.
  - Stamina is represented as `pokémon_stamina / dataset_max_stamina`.
- A Pokémon whose stat equals the dataset maximum for that dimension must be represented at full scale (100 %).
- A Pokémon whose stat is zero must be represented at zero scale (0 %).
- All values in between must scale proportionally.

### 3.3 Perceptual requirements

- The visual representation of each stat must allow a user to immediately perceive whether the stat is relatively low, moderate, or high, without reading numeric values.
- A user must be able to distinguish between a Pokémon with uniformly modest stats and one with at least one exceptional stat.
- Raw numeric stat values are optional supplementary information and must not be required to understand the displayed strength.

### 3.4 Retained behaviors from Iteration 5

- The strength profile continues to display all three stats — Attack, Defense, and Stamina — simultaneously on the card.
- The two-section card layout (title section and content section) is preserved unchanged.
- The title section retains the type-based surface treatment from Iteration 4 without modification.
- The content section contains the strength profile.
- The strength profile must not visually compete with the Pokémon's name or the type color treatment.

### 3.5 Data sourcing

- All stat values and dataset maxima are sourced exclusively from the existing build-time dataset.
- No new data files, external APIs, or ingestion steps are introduced.

---

## 4. Constraints

- **Static-only.** The application remains a fully static export. No API routes, server-side rendering at request time, middleware, or backend services are introduced.
- **No runtime network requests.** The browser must not fetch Pokémon data, stat data, or computed maxima at runtime.
- **No new data sources.** All stat values and reference maxima must come exclusively from the existing build-time dataset.
- **Per-dimension scaling only.** Each stat is scaled against its own dataset maximum. No cross-stat normalization is applied.
- **No cross-Pokémon comparison at runtime.** The display shows a single selected Pokémon only; no other Pokémon are rendered for comparison.
- **All three stats represented simultaneously.** Attack, Defense, and Stamina must all be visible at the same time on the card.
- **Interpretable without numbers.** The strength profile must convey each stat's position on the dataset scale visually; raw numerical values are supplementary, not required.
- **Hierarchy preserved.** The strength profile must not visually compete with the name or type color treatment.
- **Type surface treatment unchanged.** The title section must carry the type-based background treatment from Iteration 4 without modification.
- **Mobile-first.** The primary design target is a small-screen viewport (375 px wide).
- **MUI only.** All UI components must come from the Material UI library. No other component libraries are introduced.
- **In-memory state only.** No persistence of selected Pokémon or stat data.
- **No new infrastructure or cost.** Deployment pipeline, hosting, and data sources remain unchanged.

---

## 5. Non-Goals

- Global rankings, tiers, or percentage labels (e.g. "top 10 %", "rank 42").
- Percentile scores or normalized composite metrics.
- Stat comparison between multiple Pokémon displayed simultaneously.
- Cross-stat normalization (e.g. comparing Attack against Defense for the same Pokémon).
- Derived combat metrics (CP, DPS, bulk score, etc.).
- Move data or any Pokémon attribute beyond name, type, and base stats.
- User-controlled filters, toggles, or sort orders.
- Animation beyond default MUI behavior.
- Dark mode or theme switching.
- Accessibility enhancements beyond what MUI provides by default.
- Changes to the type color theme or surface treatment defined in Iteration 4.
- Any feature not explicitly stated in section 3.

---

## 6. Acceptance Criteria

The following criteria must all pass before this iteration is considered complete. Each criterion is independently verifiable.

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-01 | The build process computes the maximum Attack value across all Pokémon in the dataset and embeds it in the static output. | Inspect the build artefacts or the static data embedded in the application; confirm a `maxAttack` (or equivalent) value is present and equals the highest Attack value in the source dataset. |
| AC-02 | The build process computes the maximum Defense value across all Pokémon in the dataset and embeds it in the static output. | Inspect the build artefacts or the static data embedded in the application; confirm a `maxDefense` (or equivalent) value is present and equals the highest Defense value in the source dataset. |
| AC-03 | The build process computes the maximum Stamina value across all Pokémon in the dataset and embeds it in the static output. | Inspect the build artefacts or the static data embedded in the application; confirm a `maxStamina` (or equivalent) value is present and equals the highest Stamina value in the source dataset. |
| AC-04 | A Pokémon whose Attack equals the dataset maximum is represented at full scale in the Attack dimension. | Identify the Pokémon with the highest Attack in the dataset; select it in the UI; confirm its Attack indicator is rendered at 100 % of the available scale. |
| AC-05 | A Pokémon whose Attack is substantially below the dataset maximum is represented at a visually smaller scale in the Attack dimension. | Select a Pokémon with low Attack; confirm its Attack indicator is visually shorter or smaller than a Pokémon with high Attack in the same dimension. |
| AC-06 | The same proportional scaling applies independently to the Defense dimension. | Select the Pokémon with the highest Defense; confirm its Defense indicator is at full scale. Select a Pokémon with low Defense; confirm its Defense indicator is visibly smaller. |
| AC-07 | The same proportional scaling applies independently to the Stamina dimension. | Select the Pokémon with the highest Stamina; confirm its Stamina indicator is at full scale. Select a Pokémon with low Stamina; confirm its Stamina indicator is visibly smaller. |
| AC-08 | A user can distinguish, at a glance, between a Pokémon with uniformly low stats and one with at least one stat close to the dataset maximum. | Select a Pokémon known to have uniformly modest stats; then select one known to have a dominant stat; confirm the visual profiles are clearly different without reading numbers. |
| AC-09 | Raw stat numbers, if displayed, are not required to read the relative strength of each stat. | Cover or ignore any numeric labels; confirm the visual profile alone conveys whether each stat is low, moderate, or high. |
| AC-10 | All three stats are visible simultaneously on the card. | Select any Pokémon; confirm Attack, Defense, and Stamina are all present on the card at the same time. |
| AC-11 | The two-section card layout is preserved: a title section with the type-based surface treatment and a content section containing the strength profile. | Select a single-type and a dual-type Pokémon; confirm the title section background matches Iteration 4 treatment and the strength profile is in the content section in both cases. |
| AC-12 | The strength profile does not visually compete with the Pokémon name or the type color treatment. | Inspect the rendered card; confirm the name and type surface remain the most visually prominent elements. |
| AC-13 | The full card is visible on a 375 px wide viewport without horizontal scrolling. | Open the page at 375 px width; select any Pokémon; confirm the complete card renders without horizontal overflow. |
| AC-14 | No card is shown when no Pokémon is selected. | Load the page without selecting a Pokémon; confirm no card is visible. |
| AC-15 | Base stat data and dataset maxima are not fetched at runtime. The browser makes no outbound network requests when a Pokémon is selected. | Open browser DevTools Network tab; select a Pokémon; confirm zero requests to any external host. |
| AC-16 | Running `next build` produces a static export with no server-dependent artefacts. | Run `next build`; confirm `out/` contains only static files and no API or server routes. |

---

## 7. Risks

- **Dataset max stability.** If the dataset is updated in a future iteration, the embedded maxima will be stale. The current scope assumes a fixed dataset; if the dataset changes, maxima must be recomputed. This risk is deferred and does not affect this iteration.
- **Visual saturation at the top of the scale.** Multiple Pokémon near the dataset maximum in a given dimension will produce near-identical visual output for that dimension. This is correct behavior and is expected; the spec does not require fine-grained discrimination near the maximum.
- **Cross-dimension visual imbalance.** Because each dimension is scaled independently, a Pokémon with high Attack and low Stamina will appear uneven. This is the intended behavior and must not be corrected by re-normalizing across dimensions.
- **Legibility of modest stats.** A Pokémon with very low stats in all dimensions may produce a profile that is barely visible. The implementation must ensure the profile remains legible at small proportions without introducing false inflation of values.

---

## 8. Future Considerations

The following are explicitly deferred and must not influence the implementation of this iteration:

- Percentile-based or ranked contextualization.
- Type-filtered stat context (e.g. "strong for a Water type").
- Composite scoring or tier labels.
- User-selectable stat weighting or display modes.
- Display of CP, IV values, or move-based performance metrics.
- Any Pokémon attribute beyond name, type, and base stats.
