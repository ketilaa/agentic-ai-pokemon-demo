# Spec 0013 – Pokémon Card Move List

**Status:** Complete  
**Iteration:** 13  
**Author:** Architect agent  
**Date:** 2026-05-13

---

## 1. Goal

Display the Quick and Charged moves available to a Pokémon by name, with each move's type communicated through the existing type color system, so that a Pokémon GO player can immediately read what moves this Pokémon can have — without being taught move mechanics.

---

## 2. Context / Background

Iteration 12 introduced a move type coverage section that surfaces the *types* of moves a Pokémon can have as color swatches, without move names, labels, or statistics. This was a deliberate minimal step: establish that the capability zone can carry move information before deciding how much to expose.

Player feedback and the iteration intent make it clear that type swatches alone are insufficient for practical value. A player who sees two Fire-type swatches in the charged moves area cannot tell whether this Pokémon has Overheat or Flame Charge — a distinction with real strategic weight. The move *name* is the unit of practical information. The type color is a supporting orientation cue that lets a player quickly scan the move pool without needing to read every name.

The build-time dataset contains move names resolvable from move identifiers. Move type is also available from the dataset — the same type registry established in Iteration 4 already covers the full type set used by moves.

This iteration upgrades the move display from type-swatch-only to a named move list. The move-type-section introduced in Iteration 12 is retired and replaced by a richer move section that shows move names with type color as a secondary signal, labeled groups for orientation, and a subtle distinction for Elite TM–exclusive moves.

No new data sources, runtime requests, or interaction are introduced. The application remains fully static.

---

## 3. Functional Behavior

### 3.1 Move data sourcing

- The move list for each Pokémon is derived exclusively from the existing build-time dataset.
- The dataset contains four move collections per Pokémon:
  - Regular quick moves (`quickMoves`)
  - Elite quick moves (`eliteQuickMoves`)
  - Regular charged moves (`cinematicMoves`)
  - Elite charged moves (`eliteCinematicMoves`)
- For each move identifier, the displayed name and the associated type are resolved from the build-time dataset. No name or type value may be hardcoded outside the dataset or the `TYPE_COLORS` registry.
- A move that appears in both the regular and elite collection for the same category is treated as a single move item and is shown with the elite distinction applied.
- The fields `eliteQuickMoves` and `eliteCinematicMoves` may be either an object (keyed by move identifier) or an empty array in the dataset. An empty array contributes no moves; a non-empty object contributes its keys as move identifiers.
- If a move identifier cannot be resolved to a human-readable name from the dataset, the move is omitted from the displayed list. The omission must be surfaced as a build-time warning (e.g. a `console.warn` or equivalent during data ingestion) so that gaps in name resolution are visible and correctable without a silent data loss.

### 3.2 Quick moves group

- The card displays all quick moves available to the Pokémon — the union of `quickMoves` and `eliteQuickMoves`.
- Each unique move appears exactly once.
- The order of moves within the group is not significant.
- The group is identified by `data-testid="quick-moves-group"` on its containing element.
- When a Pokémon has no quick moves in either collection, the quick moves group is absent from the card.

### 3.3 Charged moves group

- The card displays all charged moves available to the Pokémon — the union of `cinematicMoves` and `eliteCinematicMoves`.
- Each unique move appears exactly once.
- The order of moves within the group is not significant.
- The group is identified by `data-testid="charged-moves-group"` on its containing element.
- When a Pokémon has no charged moves in either collection, the charged moves group is absent from the card.

### 3.4 Move item presentation

- Each move is rendered as a single item within its group.
- Each move item carries `data-testid="move-item"`, `data-move-name` set to the resolved move name as a string, and `data-move-type` set to the type identifier as it appears in the dataset.
- The move name is the primary text content of the item.
- The move's type is communicated through a color derived from the `TYPE_COLORS` registry for that type identifier. The type color is a supporting visual signal; the move name is the dominant element within the item.
- No type name, abbreviation, or textual label for the type appears on or adjacent to the move item. The type is communicated by color only.
- No numeric move data — damage, energy, cooldown, duration, DPS, or any other statistic — appears anywhere in the move section.

### 3.5 Elite move distinction

- A move that originates from an elite collection (`eliteQuickMoves` or `eliteCinematicMoves`) is visually distinguished from regular moves.
- The distinction must be:
  - Visible without interaction (no hover, tap, or tooltip required).
  - Subtle — it must not overpower the move name or type color signal.
  - Non-numeric — no number, score, or count is used as the signal.
  - Non-explanatory — no legend, tooltip, label, or inline explanation accompanies the distinction.
- Each elite move item carries `data-is-elite="true"`. Non-elite move items carry `data-is-elite="false"`.
- If a move appears in both a regular and an elite collection for the same category, `data-is-elite="true"` is applied.

### 3.6 Group labels

- The quick moves group is preceded by a small textual label reading exactly **"Quick moves"**.
- The charged moves group is preceded by a small textual label reading exactly **"Charged moves"**.
- Labels carry `data-testid="quick-moves-label"` and `data-testid="charged-moves-label"` respectively.
- A label is present if and only if its corresponding group is present. When a group is absent, its label is also absent from the DOM.
- Labels serve as orientation aids only. They must be visually subordinate to the move names — smaller in apparent visual weight and less prominent in the layout hierarchy.
- Labels must not be the focal element of the section.

### 3.7 Placement and hierarchy

- The move section is placed inside the card content section (`card-content-section`), below the stat profile (ATK, DEF, STA bars).
- The move section is identified by `data-testid="move-section"`.
- The move section must not appear in the card header, above the card, or outside the card container.
- The move section is visually subordinate to the stat profile. It must not attract more visual attention than the stat bars.
- The move section is visually subordinate to the card header. It must not attract more visual attention than the header type treatment.
- The `move-type-section` element from Iteration 12 is retired. No element with `data-testid="move-type-section"` should be present after this iteration.

### 3.8 Preserved behaviors

All structural and behavioral properties from prior iterations remain unchanged:

- Card structure: `card-header`, `card-content-section`, `evolution-section`, stat bars (Iterations 5–11)
- Header type identity: `data-header-tint-color`, `data-header-tint-opacity` in range (0.15, 0.5) (Iteration 10)
- Card container tint retirement: `data-tint-opacity` set to `0` (Iteration 10)
- Content neutrality: `data-content-tint-opacity` set to `0` (Iteration 10)
- Primary type border and secondary type accent (Iteration 8)
- Image in card header, no-crop constraint (Iteration 11)
- Responsive maximum card width (Iteration 11)
- URL-based selection state and evolution link navigation (Iteration 7)

---

## 4. Constraints

- **Static-only.** The application remains a fully static Next.js export. No API routes, server-side rendering at request time, or middleware is introduced.
- **No new data sources.** Move names and types are resolved from the existing build-time dataset. No additional data ingestion, APIs, or external resources are introduced.
- **Type colors from registry only.** All type color values used for move type signals must come from the existing `TYPE_COLORS` registry. No type color may be hardcoded outside that definition.
- **No type labels on move items.** No type name, abbreviation, or textual label for a move's type may appear on or adjacent to any move item.
- **No move mechanics.** No damage value, energy value, cooldown, duration, or combat statistic may appear anywhere in the move section.
- **Capability zone only.** The move section must appear inside `card-content-section`, below the stat bars. It must not appear in or affect the card header.
- **Compact on mobile.** The move section must remain scannable and not overflow horizontally at 375 px viewport width. Move names that are long must wrap or truncate predictably — no element may cause the card to scroll horizontally.
- **Content neutrality preserved.** The addition of the move section must not introduce a type-derived background color into `card-content-section`. The content region remains visually neutral.
- **No interaction.** Move items are non-interactive. They must not be focusable, clickable, or respond to hover as a standalone action.
- **No icons or badges.** No icons, sprites, or decorative imagery are introduced for move types, elite moves, or group labels.
- **No new infrastructure or cost.** Deployment pipeline, hosting, and data sources remain unchanged.

---

## 5. Non-Goals

- Move statistics: damage, energy, cooldown, duration, DPS, TDO, EPS, or any derived combat value.
- STAB analysis, type effectiveness, or any derived game-mechanics computation.
- "Best move" indication or move ranking of any kind.
- PvP or PvE move distinctions.
- Move selection, filtering, or toggling by the player.
- Player-specific current moveset — this iteration shows all possible moves only.
- Icons or graphical symbols for move types or elite status.
- Comparison of move lists between Pokémon.
- Hover, tap, or click interaction on any move element.
- Legends or explanations for the elite move distinction.
- Animations or transitions beyond framework defaults.
- Accessibility enhancements beyond framework defaults.
- Changes to the evolution chain, stat bars, image, or card header.
- Changes to URL behavior, selection state, or search behavior (Iterations 2, 7).
- Any feature not explicitly stated in section 3.

---

## 6. Acceptance Criteria

### Move section — structure and placement

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-01 | The card contains a move section identified by `data-testid="move-section"` inside `card-content-section`. | Render any Pokémon with at least one move; confirm an element with testid `move-section` is present and is a descendant of `card-content-section`. |
| AC-02 | The move section is not present inside `card-header`. | Render any Pokémon; confirm no element with testid `move-section` is a descendant of `card-header`. |
| AC-03 | The move section appears after the stat bars in document order. | Render any Pokémon; confirm `move-section` follows `stat-bar-sta` in DOM order within `card-content-section`. (This anchor is stable as long as §3.8 preserved behaviors hold; if stat bar testids change in a future iteration, this criterion must be updated.) |
| AC-04 | When a Pokémon has no quick moves and no charged moves, `move-section` is absent from the card. | Render a Pokémon whose quick move pool and charged move pool are both empty; confirm no element with testid `move-section` is present on the card. If no such Pokémon exists in the live dataset, a test fixture with empty move collections must be used. |
| AC-05 | No element with `data-testid="move-type-section"` is present on the card (Iteration 12 element retired). | Render any Pokémon; confirm no element with testid `move-type-section` is present in the DOM. |

### Quick moves group

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-06 | The card contains a quick moves group identified by `data-testid="quick-moves-group"` inside `move-section`. | Render a Pokémon with at least one quick move; confirm an element with testid `quick-moves-group` is present inside `move-section`. |
| AC-07 | The quick moves group contains one `move-item` per unique quick move, with no duplicates. | Render a Pokémon; collect all elements with testid `move-item` inside `quick-moves-group`; confirm the count equals the number of distinct quick moves (union of `quickMoves` and `eliteQuickMoves`) for that Pokémon. |
| AC-08 | Each move item inside `quick-moves-group` carries `data-move-name` equal to the resolved name of a quick move available to that Pokémon. | Render a Pokémon with a known quick move pool; confirm each `move-item` inside `quick-moves-group` has a `data-move-name` matching a known quick move name. |
| AC-09 | No two items in `quick-moves-group` share the same `data-move-name`. | Render any Pokémon; collect `data-move-name` values inside `quick-moves-group`; confirm all values are distinct. |
| AC-10 | When a Pokémon has no quick moves, `quick-moves-group` is absent from the card. | Render a Pokémon with an empty quick move pool; confirm no element with testid `quick-moves-group` is present. |

### Charged moves group

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-11 | The card contains a charged moves group identified by `data-testid="charged-moves-group"` inside `move-section`. | Render a Pokémon with at least one charged move; confirm an element with testid `charged-moves-group` is present inside `move-section`. |
| AC-12 | The charged moves group contains one `move-item` per unique charged move, with no duplicates. | Render a Pokémon; collect all elements with testid `move-item` inside `charged-moves-group`; confirm the count equals the number of distinct charged moves (union of `cinematicMoves` and `eliteCinematicMoves`) for that Pokémon. |
| AC-13 | Each move item inside `charged-moves-group` carries `data-move-name` equal to the resolved name of a charged move available to that Pokémon. | Render a Pokémon with a known charged move pool; confirm each `move-item` inside `charged-moves-group` has a `data-move-name` matching a known charged move name. |
| AC-14 | No two items in `charged-moves-group` share the same `data-move-name`. | Render any Pokémon; collect `data-move-name` values inside `charged-moves-group`; confirm all values are distinct. |
| AC-15 | When a Pokémon has no charged moves, `charged-moves-group` is absent from the card. | Render a Pokémon with an empty charged move pool; confirm no element with testid `charged-moves-group` is present. |

### Move type signal

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-16 | Each `move-item` carries `data-move-type` equal to the type identifier from the dataset for that move. | Render a Pokémon with known move types; confirm each `move-item`'s `data-move-type` matches the expected type identifier. |
| AC-17 | Every `data-move-type` value present on any `move-item` is a key in the `TYPE_COLORS` registry. No invented or aliased type identifier may appear. | Collect all `data-move-type` values across all rendered `move-item` elements; confirm each value is a key in the `TYPE_COLORS` registry. |

### Elite move distinction

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-18 | A move item from an elite collection (`eliteQuickMoves` or `eliteCinematicMoves`) carries `data-is-elite="true"`. | Render a Pokémon known to have an elite move; confirm the corresponding `move-item` has `data-is-elite="true"`. |
| AC-19 | A move item not from any elite collection carries `data-is-elite="false"`. | Render a Pokémon; confirm that `move-item` elements corresponding to non-elite moves carry `data-is-elite="false"`. |
| AC-20 | Elite and non-elite move items are visually distinguishable without interaction. | Render a Pokémon with both elite and non-elite moves; confirm the visual difference is apparent without hovering, tapping, or expanding. (Manual QA) |
| AC-21 | The elite distinction does not overpower the move name or type color as the dominant visual element of the item. | Render a Pokémon with several elite moves; confirm the move name remains the most prominent text and the elite cue reads as secondary information. (Manual QA) |

### Group labels

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-22 | A label with `data-testid="quick-moves-label"` and text content "Quick moves" is present when `quick-moves-group` is present. | Render a Pokémon with quick moves; confirm the label element is present and its text content is exactly "Quick moves". |
| AC-23 | A label with `data-testid="charged-moves-label"` and text content "Charged moves" is present when `charged-moves-group` is present. | Render a Pokémon with charged moves; confirm the label element is present and its text content is exactly "Charged moves". |
| AC-24 | The group labels are visually subordinate to the move names — they do not attract more visual attention than the move name text. | Render any Pokémon; confirm the labels read as secondary, orientation-level text compared to the move names. (Manual QA) |

### Text and mechanics prohibition

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-25 | No numeric move statistic appears inside `move-section`. | Inspect all text nodes inside `move-section`; confirm none contain numeric content that corresponds to a move statistic (damage, energy, duration, etc.). |
| AC-26 | No type name or abbreviation appears as visible text inside any `move-item`. | Render several Pokémon; confirm no text content representing a type name (e.g. "Fire", "Water", "Normal") appears as visible text within any move item element. |

### Visual hierarchy (Manual QA)

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-27 | The move section is visually subordinate to the stat profile — the stat bars remain the dominant capability signal in the content zone. | Render any Pokémon; confirm the stat bars attract more visual attention than the move list. (Manual QA) |
| AC-28 | The move section does not overflow the card at 375 px viewport width. | Render a Pokémon with a large move pool at 375 px; confirm no horizontal overflow occurs and all move names are readable. (Manual QA) |

### Content neutrality preserved

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-29 | The content region carries no type-derived background color after this iteration. | Inspect `data-content-tint-opacity` on `card-content-section`; confirm the value remains `0`. |

### Build and static export

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-30 | Running `next build` produces a static export with no server-dependent artefacts. | Run `next build`; confirm `out/` contains only static files. |

---

## 7. Risks

- **Move name resolution from identifiers.** Move identifiers in the dataset (e.g. `QUICK_ATTACK`, `HYDRO_CANNON`) require resolution to human-readable names. If the build-time dataset does not already expose a name field for each move, the implementation must derive names from identifiers — for example by converting `HYDRO_CANNON` to "Hydro Cannon". The transformation rule must be consistent and complete; gaps in name resolution will produce raw identifiers on the card. The spec requires that names come from the dataset; the developer must verify that name data is available and define the resolution strategy before building.

- **Move type availability.** Each move must have an associated type in the build-time dataset. If any move identifier lacks a type entry, the `data-move-type` attribute cannot be populated and the type color signal cannot be applied. The developer must verify dataset completeness before building and raise a spec revision if type data is missing for any moves.

- **Large move pools on mobile.** A small number of Pokémon have large move pools (over 10 quick moves or over 15 charged moves). At 375 px, a list of 15 move names must remain readable and must not overflow horizontally. The implementation must handle large pools through vertical stacking or a layout that wraps predictably, without producing a visually cluttered or inaccessible result.

- **Content zone density.** The content zone already carries stat bars, group labels, and (for mid-stage Pokémon) evolution navigation. Adding a full named move list substantially increases content density. The hierarchy between stat profile (dominant) and move section (subordinate) must be preserved through visual weight management — the developer should verify this at representative Pokémon (first-stage, mid-stage with long move lists).

- **Elite distinction legibility.** The elite cue must be subtle enough not to overpower move names, yet clear enough to be noticed without interaction. This balance is difficult to achieve purely through specification — the developer should confirm the result with Manual QA criteria AC-20 and AC-21 before marking the iteration complete.

- **`eliteQuickMoves` and `eliteCinematicMoves` shape in the dataset.** These fields can be either an object (keyed by move identifier) or an empty array. The implementation must handle both shapes. An empty array contributes no elite moves; a non-empty object contributes its keys as elite move identifiers.

- **Move appearing in both regular and elite collections.** If a move identifier appears in both `quickMoves` and `eliteQuickMoves`, it must be rendered as a single item with `data-is-elite="true"`. The implementation must deduplicate correctly and not produce two items for the same move.

- **`TYPE_COLORS` registry completeness.** The spec requires that every move type color originates from the `TYPE_COLORS` registry. If any type identifier from the move dataset is absent from the registry, the color signal for that type will fail. The developer must verify registry completeness against all type identifiers that can appear in move data before shipping.

- **Domain model extension required.** The current `PokemonEntry` interface carries only `quickMoveTypes` and `chargedMoveTypes` — lists of type identifier strings with no move names. Implementing this spec requires extending `PokemonEntry` (or introducing a dedicated `MoveEntry` type carrying name, type identifier, and elite status) and updating `parsePokemonData` accordingly. This is the most significant structural change in this iteration. The developer must extend the domain model and ensure all existing consumers of `quickMoveTypes` and `chargedMoveTypes` remain compatible or are updated before building the card component.

---

## 8. Future Considerations

The following are explicitly deferred and must not influence this iteration:

- Move statistics alongside names: damage, energy, DPS, TDO, EPS, cooldown.
- STAB highlighting — indicating which moves benefit from STAB for this Pokémon.
- Type effectiveness indicators or coverage analysis.
- PvP versus PvE move distinctions or best-move recommendations.
- Player-specific current moveset vs. full possible move pool differentiation.
- Interactive filtering of Pokémon by move.
- Expandable or collapsible move sections.
- Explanation or legend for the elite move distinction.
- Move type icons or graphical symbols beyond color signals.
- Animated transitions on move items.
- Accessibility improvements to color-only type communication (e.g. pattern fills, tooltips for screen readers).
- Dark mode or system-level theme adaptation.
- Changes to URL behavior, selection state, or search behavior (Iterations 2, 7).
