# Spec 0012 – Pokémon Card Move Type Coverage

**Status:** Draft  
**Iteration:** 12  
**Author:** Architect agent  
**Date:** 2026-05-13

---

## 1. Goal

Surface the types of moves a Pokémon can have — separately for quick moves and charged moves — so that players can immediately understand move coverage and STAB potential at a glance, without any move names, statistics, or mechanics appearing on the card.

---

## 2. Context / Background

Iterations 1–11 have built a card that communicates a Pokémon's identity (name, type, image) and base capability (ATK, DEF, STA stat profile, evolution chain). The area of the content zone below the stat bars currently carries no capability information beyond the evolution chain navigation present for mid-stage Pokémon.

The build-time dataset already contains full move data for each Pokémon, including the type of every quick move and every charged move. This information is present at build time and requires no new data sources or runtime requests.

For Pokémon GO players, the type of a move carries immediate strategic meaning: it determines whether a move benefits from STAB (Same-Type Attack Bonus), and what coverage a Pokémon offers beyond its own typing. Players already know the type color system from the existing card — they interpret type colors without needing text labels. A small, quiet display of the unique types present in a Pokémon's move pool allows a player to read "this Pokémon can have Grass and Normal quick moves, and Grass and Poison charged moves" from color alone.

Move names, damage values, energy values, and timing data are not surfaced — these belong to dedicated move reference tools. This iteration contributes the single, minimal insight: *what kinds of moves can this Pokémon have?*

The card structure from Iteration 10–11 divides the card into a typed header (identity zone) and a neutral content section (capability zone). Move type coverage belongs in the capability zone, below the stat profile, as a further capability signal. It must not enter the header.

---

## 3. Functional Behavior

### 3.1 Move type data sourcing

- The move pool for each Pokémon is derived exclusively from the existing build-time dataset.
- The dataset contains four move collections per Pokémon: regular quick moves, elite quick moves, regular charged moves, and elite charged moves.
- The quick move type group is derived from the union of regular quick moves and elite quick moves. The charged move type group is derived from the union of regular charged moves and elite charged moves. A type is included in a group if any move in that group's corresponding collections carries that type.
- Move types are the sole information extracted from the dataset for this feature. Move names, power values, energy values, duration, and combat statistics must not be read or surfaced.

### 3.2 Quick move type group

- The card displays the unique set of types present among all quick moves (regular and elite) available to the Pokémon.
- Each type in the set appears exactly once, regardless of how many quick moves carry that type.
- The order of types within the group is not significant.
- This group carries `data-testid="quick-move-type-group"` for test purposes; no visible label is required.
- When the Pokémon has no quick moves in any collection, the quick move type group is absent from the card.

### 3.3 Charged move type group

- The card displays the unique set of types present among all charged moves (regular and elite) available to the Pokémon.
- Each type in the set appears exactly once.
- The order of types within the group is not significant.
- This group carries `data-testid="charged-move-type-group"` for test purposes; no visible label is required.
- When the Pokémon has no charged moves in any collection, the charged move type group is absent from the card.

### 3.4 Visual communication

- Each move type is represented by a single color swatch derived from the `TYPE_COLORS` registry established in Iteration 4.
- No type name, abbreviation, or textual label appears on any type swatch.
- No move name, number, or other move attribute is displayed.
- The two groups (quick and charged) must be visually distinguishable from each other — a player scanning the card must be able to tell which color swatches belong to quick moves and which belong to charged moves.
- The visual distinction between groups must not rely on text labels for the group names. It may use position, spacing, a structural separator, or a non-textual visual cue.
- Color values for type swatches must originate exclusively from the `TYPE_COLORS` registry. No type color value may be hardcoded outside that registry.

### 3.5 Placement and hierarchy

- Move type coverage is placed inside the card content section (`card-content-section`), below the stat profile (ATK, DEF, STA bars).
- Move type coverage must not appear in the card header, above the card, or outside the card container.
- Move type coverage is visually subordinate to the stat profile. It must not attract more visual attention than the stat bars.
- Move type coverage is visually subordinate to the card header. It must not attract more visual attention than the header type treatment.

### 3.6 Preserved behaviors

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
- **No new data sources.** Move type information is derived exclusively from the existing build-time dataset (`quickMoves`, `eliteQuickMoves`, `cinematicMoves`, `eliteCinematicMoves`). No additional data ingestion, APIs, or external resources are introduced.
- **Type colors from registry only.** All type color values used for move type swatches must come from the existing `TYPE_COLORS` registry. No type color may be hardcoded outside that definition.
- **No text labels.** No type name, abbreviation, or label may appear on or adjacent to any type swatch. No move name or description may appear.
- **No move mechanics.** No damage value, energy value, cooldown, duration, or combat statistic may appear.
- **Capability zone only.** Move type coverage must appear inside `card-content-section`, below the stat bars. It must not appear in or affect the card header.
- **Compact on mobile.** The move type display must remain scannable and not overflow horizontally at 375 px viewport width.
- **Content neutrality preserved.** The addition of move type swatches must not introduce a type-derived background color into `card-content-section`. The content region remains visually neutral.
- **No interaction.** Move type swatches are non-interactive. They must not be focusable, clickable, or respond to hover as a standalone action.
- **No new infrastructure or cost.** Deployment pipeline, hosting, and data sources remain unchanged.

---

## 5. Non-Goals

- Move names, move IDs, or any move identifier on the card.
- Move statistics: damage, energy, cooldown, duration, DPS, TDO, EPS.
- STAB analysis, type effectiveness, or any derived game-mechanics computation.
- "Best move" indication or move ranking.
- PvP or PvE move distinctions.
- Move selection or filtering by the player.
- Player-specific current moveset (this iteration shows all possible moves only).
- Icons, sprites, or decorative imagery for move types.
- Comparison of move type coverage between Pokémon.
- Hover, tap, or click interaction on any move type element.
- Animations or transitions beyond framework defaults.
- Accessibility enhancements beyond framework defaults.
- Changes to the evolution chain, stat bars, image, or card header.
- Changes to URL behavior, selection state, or search behavior (Iterations 2, 7).
- Any feature not explicitly stated in section 3.

---

## 6. Acceptance Criteria

### Move type section — structure and placement

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-01 | The card contains a move type section identified by `data-testid="move-type-section"` inside `card-content-section`. | Render any Pokémon with at least one move; confirm an element with testid `move-type-section` is present and is a descendant of `card-content-section`. |
| AC-02 | The move type section is not present inside `card-header`. | Render any Pokémon; confirm no element with testid `move-type-section` is a descendant of `card-header`. |
| AC-03 | The move type section appears after the stat bars in document order. | Render any Pokémon; confirm `move-type-section` follows `stat-bar-sta` in DOM order within `card-content-section`. |
| AC-03b | When a Pokémon has no quick moves and no charged moves, `move-type-section` is absent from the card. | Render a Pokémon whose quick move pool and charged move pool are both empty; confirm no element with testid `move-type-section` is present anywhere on the card. |

### Quick move type group

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-04 | The card contains a quick move type group identified by `data-testid="quick-move-type-group"` inside `move-type-section`. | Render a Pokémon with at least one quick move; confirm an element with testid `quick-move-type-group` is present inside `move-type-section`. |
| AC-05 | The quick move type group contains one swatch per unique quick move type, with no duplicates. | Render a Pokémon; collect all elements with testid `move-type-swatch` inside `quick-move-type-group`; confirm the count equals the number of distinct types across all quick moves (regular + elite) for that Pokémon. |
| AC-06 | Each type swatch in the quick move type group carries `data-type-id` equal to the corresponding type identifier from the dataset. | Render a Pokémon with a known quick move pool; confirm each `move-type-swatch` inside `quick-move-type-group` has a `data-type-id` matching a type present in that Pokémon's quick move pool. |
| AC-07 | No two swatches in the quick move type group carry the same `data-type-id`. | Render any Pokémon; collect `data-type-id` values of all swatches in `quick-move-type-group`; confirm all values are distinct. |
| AC-08 | When a Pokémon has no quick moves, `quick-move-type-group` is absent from the card. | Render a Pokémon with an empty quick move pool; confirm no element with testid `quick-move-type-group` is present. |

### Charged move type group

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-09 | The card contains a charged move type group identified by `data-testid="charged-move-type-group"` inside `move-type-section`. | Render a Pokémon with at least one charged move; confirm an element with testid `charged-move-type-group` is present inside `move-type-section`. |
| AC-10 | The charged move type group contains one swatch per unique charged move type, with no duplicates. | Render a Pokémon; collect all `move-type-swatch` elements inside `charged-move-type-group`; confirm the count equals the number of distinct types across all charged moves (regular + elite) for that Pokémon. |
| AC-11 | Each type swatch in the charged move type group carries `data-type-id` equal to the corresponding type identifier. | Render a Pokémon with a known charged move pool; confirm each swatch inside `charged-move-type-group` has a `data-type-id` matching a type present in that Pokémon's charged move pool. |
| AC-12 | No two swatches in the charged move type group carry the same `data-type-id`. | Render any Pokémon; collect `data-type-id` values of all swatches in `charged-move-type-group`; confirm all values are distinct. |
| AC-13 | When a Pokémon has no charged moves, `charged-move-type-group` is absent from the card. | Render a Pokémon with an empty charged move pool; confirm no element with testid `charged-move-type-group` is present. |

### Color correctness

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-14 | Each type swatch carries `data-type-color` equal to the color value in `TYPE_COLORS` for that type. | Render a Pokémon; for each `move-type-swatch`, confirm `data-type-color` matches the entry for its `data-type-id` in the `TYPE_COLORS` registry. |

### Text and mechanics prohibition

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-15 | No type name or label appears inside `move-type-section`. | Render several Pokémon; confirm no text content representing a type name (e.g. "Fire", "Water", "Grass") appears inside `move-type-section`. |
| AC-16 | No numeric move statistic (damage value, energy value) appears inside `move-type-section`. | Inspect all text nodes inside `move-type-section`; confirm none contain numeric content that corresponds to a move statistic. Move name prohibition is covered by AC-15. |

### Visual separation of groups (Manual QA)

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-17 | The quick move type group and charged move type group are visually distinguishable without reading any text label. | Render a Pokémon with both quick and charged moves; confirm a player can identify which swatches belong to quick moves and which to charged moves from visual layout alone. (Manual QA) |
| AC-18 | The move type display is compact and does not overflow the card at 375 px viewport width. | Render a Pokémon with a large move pool (e.g. 4+ quick move types, 5+ charged move types) at 375 px viewport width; confirm no horizontal overflow occurs. (Manual QA) |
| AC-19 | Move type coverage is visually subordinate to the stat profile — it does not attract more visual attention than the stat bars. | Render any Pokémon; confirm the stat bars are the dominant visual element in the content zone and the move type section reads as secondary information. (Manual QA) |

### Content neutrality preserved

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-20 | The content region carries no type-derived background color after this iteration. | Inspect `data-content-tint-opacity` on `card-content-section`; confirm the value remains `0`. |

### Build and static export

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-21 | Running `next build` produces a static export with no server-dependent artefacts. | Run `next build`; confirm `out/` contains only static files. |

---

## 7. Risks

- **Content zone crowding.** The content zone already carries three stat bars and (for mid-stage Pokémon) two evolution navigation elements. Adding a move type section increases density. The implementation must ensure the card does not feel visually overloaded at 375 px, and that the hierarchy between stat profile (dominant) and move type coverage (subordinate) is preserved.

- **Large move pools.** A small number of Pokémon have very large move pools with many unique types (up to 11 quick-move types and 14 charged-move types in the dataset). At 375 px, a row of 11 or 14 swatches will overflow if rendered naively inline. The implementation must handle large pools without horizontal overflow — for example by wrapping, but without producing a visually cluttered result.

- **Group distinguishability without text.** The requirement that quick and charged groups are distinguishable without text labels places a design burden on the layout. Positional separation (e.g. one group above the other), consistent sizing, or a non-textual structural cue must carry the distinction clearly. If the implementation cannot achieve unambiguous group separation without text, the spec must be revised rather than working around it with labels.

- **`eliteQuickMoves` and `eliteCinematicMoves` shape in the dataset.** In the current dataset, these fields can be either an object (keyed by move ID) or an empty array. The implementation must handle both shapes without error. An empty array contributes no types; a non-empty object contributes its moves' types to the pool.

- **Pokémon with no moves.** At least one Pokémon in the dataset has an empty quick move pool and at least one has an empty charged move pool. When a pool is empty, the corresponding group must be absent, not rendered as an empty container. The implementation must guard against rendering empty or zero-swatch groups.

- **Content neutrality.** The type colors introduced for move swatches must not bleed into or alter the background of `card-content-section`. The content region's `data-content-tint-opacity` must remain `0`. The swatches are foreground elements within a neutral background; they must not introduce a type-derived color into the region itself.

- **TYPE_COLORS registry completeness.** The spec requires that every swatch color originates from the `TYPE_COLORS` registry. If any type that appears in the move dataset is absent from the registry, swatch rendering for that type will fail or produce no valid color. The implementation must verify that the registry contains an entry for every type identifier that can appear in the four move collections. Any gap must be resolved by extending the registry — not by hardcoding a fallback color — before this feature ships.

---

## 8. Future Considerations

The following are explicitly deferred and must not influence this iteration:

- Move names alongside type swatches (e.g. tooltip or expandable view).
- Move statistics: damage, energy, DPS, TDO, EPS.
- STAB highlighting — indicating which move types benefit from STAB for this Pokémon.
- Type effectiveness indicators — communicating move coverage against opponent types.
- PvP versus PvE move distinctions or best-move recommendations.
- Player-specific current moveset vs. full possible move pool differentiation.
- Interactive filtering of Pokémon by move type.
- Move type icons or graphical symbols beyond color swatches.
- Animated transitions on move type swatches.
- Accessibility improvements to color-only type communication (e.g. pattern fills, tooltips for screen readers).
- Dark mode or system-level theme adaptation.
- Changes to URL behavior, selection state, or search behavior (Iterations 2, 7).
