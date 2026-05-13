# Spec 0015 – Pokémon Card Move PvE Recommendation Semantics

**Status:** Complete  
**Iteration:** 15  
**Author:** Architect agent  
**Date:** 2026-05-13

---

## 1. Goal

Replace the raw-stat maximization introduced in Iteration 14 with recommendation logic that reflects practical PvE viability, so that the recommended moves on the card answer "which move would a reasonable Pokémon GO player actually use in gym and raid battles?" — not "which move has the highest single stat value?"

---

## 2. Context / Background

Iteration 14 introduced visual recommendation emphasis for moves and defined the determination logic as:

- **Quick moves:** highest `energy` field value.
- **Charged moves:** highest `power` field value.

This logic is correct in many cases but produces systematic errors for Charged moves:

**Energy cost and survivability.** A Pokémon with low survivability — low base stamina, or low base defense — is unlikely to generate the energy required to fire a high-cost Charged move before fainting. Recommending that move to a player would give advice the player cannot reliably act on. A lower-cost alternative, even one with less raw power, is the move a reasonable player would actually use.

**Energy efficiency.** Charged move power does not exist in isolation. A move that can be fired twice per battle beats a move that can be fired once, even if the latter has higher per-activation power. The relationship between a Charged move's cost and the Pokémon's energy generation rate determines how many times the move can be fired in practice.

**Same-type attack bonus (STAB).** When a Charged move shares a type with the Pokémon using it, it benefits from STAB — a consistent 20% multiplier applied in the game engine for all gym and raid battles. A raw power comparison ignores this multiplier. A STAB move can outperform a higher-power non-STAB move in real battles, and should be treated as more viable when other factors are comparable.

The visual recommendation layer established in Iteration 14 — emphasis styling, data attributes, hierarchy — is correct as defined and remains entirely unchanged. Only the logic that determines *which* move receives recommendation is updated by this iteration.

---

## 3. Functional Behavior

### 3.1 Recommended Quick move

No change from Iteration 14 (Spec 0014 §3.1). The recommended Quick move is the move in the pool with the highest PvE energy generation value. Energy generation rate is the primary determinant of PvE quick move value: it governs how frequently a Pokémon can fire Charged moves and is the consistent factor across all gym and raid encounters.

Tie-breaking, empty pool, and single-move pool behavior are unchanged from Iteration 14.

### 3.2 Recommended Charged move

The recommended Charged move is the move that is most practically effective for this specific Pokémon in PvE (gym and raid battles). This determination supersedes the Iteration 14 criterion of highest `power` field. Practical effectiveness is evaluated using the following factors in priority order:

**Factor 1 – Survivability-adjusted feasibility**

A Pokémon with low survivability must not have a very high energy cost Charged move recommended when a lower-cost alternative exists in its pool. Low survivability Pokémon cannot reliably generate sufficient energy to execute expensive moves before fainting; recommending such a move does not reflect how the Pokémon is actually used in gym and raid battles.

A Pokémon's survivability is determined by its base stamina and defense stats from the build-time dataset. A Pokémon with low survivability relative to the dataset is one whose ability to sustain itself through a battle is substantially limited compared to typical Pokémon.

This factor is the most important: a Charged move that a low-survivability Pokémon cannot reliably execute must not be recommended, regardless of how high its power is.

**Factor 2 – Energy efficiency**

A Charged move that costs less energy to fire is more reliably executed in a battle. Energy cost must be considered relative to the Pokémon's energy generation — the rate at which the quick move replenishes charge. A move that can realistically be fired multiple times in a battle provides more total value than a higher-power move that can rarely be fired.

All else being equal, a lower energy cost is preferable.

**Factor 3 – Same-type attack bonus (STAB)**

A Charged move whose type matches one of the Pokémon's own types benefits from STAB in all gym and raid encounters. This bonus amplifies the move's practical output and must be treated as a positive viability factor. When no clear winner emerges from factors 1 and 2 — that is, when neither feasibility nor energy efficiency substantially favors one move over another — the STAB move is preferred over a non-STAB move.

STAB is a meaningful advantage within a comparable power range. When a non-STAB Charged move has substantially higher base power and the gap is large enough that a 20% STAB multiplier would not overcome it in practice, base power takes precedence. STAB is not a categorical override of raw power — it is a practical correction for moves that are otherwise close.

STAB does not override Factor 1 or Factor 2. A STAB move with very high energy cost is not recommended for a low-survivability Pokémon when a lower-cost alternative exists.

**Factor 4 – Base power**

Raw base power remains a consideration. Among moves where factors 1–3 do not yield a clear winner, the higher-power move is preferred. Base power must not cause a move that fails survivability or energy-efficiency checks to be recommended over one that passes them.

**Tiebreaking**

When all four factors are equivalent, the developer must apply a stable tiebreaker (such as alphabetical order by move name) so that recommendation is deterministic across builds. The tiebreaker must be documented.

**Edge cases**

- When the Charged move pool contains exactly one move, that move is recommended regardless of its energy cost or the Pokémon's survivability.
- When the Charged move pool is empty, no Charged move is recommended.

### 3.3 Preserved visual layer

All visual and structural behavior from Iteration 14 is preserved without change:

- At most one Quick move and at most one Charged move receive recommendation emphasis per Pokémon.
- Recommended move items carry `data-is-recommended="true"`.
- Non-recommended move items carry `data-is-recommended="false"`.
- Recommendation emphasis is expressed through visual properties of the move name text (weight, contrast, or outline); no label, badge, icon, or explanatory text accompanies it.
- Elite status is indicated by italic move name; it is an orthogonal signal with no effect on recommendation determination.
- An Elite move may be recommended or not recommended; a non-Elite move may be recommended or not recommended.
- Emphasis is applied independently within each group.
- The visual hierarchy ordering — header > recommended emphasis > type color > elite italics — is unchanged.

### 3.4 Preserved behaviors from prior iterations

All functional behavior from Iterations 13 and 14 is preserved, except that the Spec 0014 §3.2 criterion for Charged move recommendation (highest `power` field) is superseded by §3.2 of this spec.

---

## 4. Constraints

- **No new data sources.** All inputs to recommendation determination come from the existing build-time dataset (move power, energy cost, Pokémon stamina, Pokémon defense, move type, Pokémon types). No additional APIs, files, or external resources are introduced.
- **No displayed statistics.** Values used in recommendation computation — power, energy cost, stamina, defense — must not appear in the rendered output. Recommendation remains a visual signal, not a numeric one.
- **Deterministic.** Given a fixed dataset, recommendation output must be identical across all builds and environments. Non-determinism is not acceptable.
- **Build-time only.** All recommendation logic executes at parse or build time. No computation occurs at runtime or in the browser.
- **Static-only.** The application remains a fully static Next.js export. No API routes, server-side rendering at request time, or middleware is introduced.
- **No new infrastructure.** Deployment pipeline, hosting, and data sources are unchanged.
- **No text labels.** No text such as "recommended", "best", "use this", or similar appears anywhere in the move section as a result of this iteration.
- **No ranking or ordering.** The priority ordering of factors in §3.2 governs the determination algorithm; it must not be surfaced as visible ranking or ordering of moves in the UI.

---

## 5. Non-Goals

- PvP move recommendations (Great League, Ultra League, Master League, or any PvP league context).
- Numeric move statistics in the UI (damage, energy cost, cooldown, DPS, EPS, TDO, or derived values).
- Explanation of why a move is recommended or what factors influenced the determination.
- Rankings, tiers, or ordered lists of moves.
- STAB highlighting on move items (STAB affects determination logic but must not produce a separate visual signal).
- Player-specific current moveset or team context.
- Changes to the visual recommendation layer, the Elite italic signal, or any visual behavior from Iteration 14.
- Changes to the move list structure, group labels, deduplication logic, or placement from Iteration 13.
- Changes to the card header, stat bars, evolution chain, image, URL behavior, or search behavior.
- Any feature not explicitly stated in section 3.

---

## 6. Acceptance Criteria

### Quick move recommendation — unchanged from Iteration 14

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-01 | All quick move recommendation criteria from Spec 0014 (AC-01 through AC-03) continue to pass unchanged. | Run the full test suite for Iteration 14 quick move recommendation; confirm no regression. |

### Charged move recommendation — feasibility for low-survivability Pokémon

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-02 | A Pokémon with demonstrably low survivability (base stamina substantially below the dataset average) that has both a charged move with very high energy cost and at least one charged move with moderate or low energy cost does not receive `data-is-recommended="true"` on the very high energy cost move. | Identify at least two Pokémon in the live dataset satisfying: (a) base stamina among the lowest in the dataset, (b) charged move pool includes a move with energy cost ≥ 75, and (c) charged move pool also includes at least one move with energy cost ≤ 50. Render each Pokémon; confirm the move with energy cost ≥ 75 does not carry `data-is-recommended="true"`. If no such Pokémon exists in the live dataset, introduce a test fixture satisfying all three conditions. |
| AC-03 | When a low-survivability Pokémon's charged move pool contains only moves with high energy cost (no lower-cost alternative exists), a move may be recommended. | Identify a Pokémon with low survivability whose entire charged move pool consists of moves with energy cost ≥ 75. Confirm that exactly one charged move carries `data-is-recommended="true"` (no pool is left without a recommendation when there is no viable alternative). |

### Charged move recommendation — energy efficiency

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-04 | Among two Charged moves of the same type where power is not the primary differentiator, the move with lower energy cost receives `data-is-recommended="true"`. | Identify a Pokémon with at least two same-type Charged moves where one has noticeably lower energy cost and the power difference is not large enough to be the primary differentiator. Render the Pokémon; confirm the lower-cost move carries `data-is-recommended="true"`. If no such Pokémon exists in the live dataset, introduce a test fixture. |

### Charged move recommendation — STAB consideration

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-05 | When a Pokémon has a STAB Charged move and a non-STAB Charged move with similar energy cost and close base power, the STAB move receives `data-is-recommended="true"`. | Identify a Pokémon with at least one Charged move matching one of its types (STAB) and at least one Charged move not matching any of its types (non-STAB), where: (a) energy costs are similar and neither clearly favors the other on energy efficiency, and (b) the STAB move has lower raw base power than the non-STAB move but the power gap is small enough that a 20% STAB multiplier on the STAB move's power would overcome it. Render the Pokémon; confirm the STAB move carries `data-is-recommended="true"`. If no such Pokémon exists in the live dataset, introduce a test fixture. |
| AC-06 | STAB does not override feasibility: a STAB Charged move with very high energy cost is not recommended for a low-survivability Pokémon when a non-STAB lower-cost alternative exists. | Identify or construct a test fixture representing a low-survivability Pokémon whose STAB Charged move has energy cost ≥ 75 and whose non-STAB Charged move has energy cost ≤ 50. Render the Pokémon; confirm the non-STAB lower-cost move carries `data-is-recommended="true"`, not the STAB high-cost move. |

### Charged move recommendation — base power subordinate to feasibility

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-07 | The highest-power Charged move in a pool is not automatically recommended when a lower-cost alternative better serves the Pokémon's survivability profile. | Identify a Pokémon where the highest-power charged move has energy cost ≥ 75 and the Pokémon has low survivability with a lower-cost alternative available. Render the Pokémon; confirm the highest-power move does not carry `data-is-recommended="true"`. (This AC is satisfied by AC-02 if the highest-power move is also the highest-cost move; both must be verified.) |

### Recommendation completeness

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-08 | Every Pokémon with a non-empty Charged move pool has exactly one Charged move carrying `data-is-recommended="true"`. | Render a representative sample of at least ten Pokémon from the live dataset; confirm exactly one `move-item` inside each `charged-moves-group` carries `data-is-recommended="true"`. |
| AC-09 | Recommendation output is identical across two independent builds from the same dataset. | Run `next build` twice without modifying the dataset; confirm the `data-is-recommended` attributes for all Pokémon are identical in both outputs. |

### No text label or statistic in UI

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-10 | No text label communicating recommendation, energy cost, power, stamina, STAB, or any derived value appears inside `move-section` as a result of this iteration. | Inspect all text nodes inside `move-section` across several rendered Pokémon; confirm none contain text introduced by this iteration's recommendation logic. |

### Iteration 14 visual layer — no regression

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-11 | All Iteration 14 acceptance criteria for visual emphasis, data attributes, Elite italic, combined signals, and visual hierarchy (AC-01 through AC-23 from Spec 0014) continue to pass. | Run the full test suite and manual QA checklist from Iteration 14; confirm no regressions. |

### Build and static export

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-12 | Running `next build` produces a static export with no server-dependent artefacts. | Run `next build`; confirm `out/` contains only static files. |

---

## 7. Risks

- **Survivability metric derivation.** Base stamina alone may not fully characterize survivability for all Pokémon; some Pokémon have below-average stamina but high defense, making them more durable than stamina alone suggests. If the developer finds that stamina alone produces counterintuitive results for specific well-known cases (e.g., a Pokémon widely known to be fragile being classified as durable), they must raise a spec revision before shipping.

- **Energy cost field availability.** The charged move energy cost used for Factor 1 and Factor 2 must come from the existing build-time dataset and must represent PvE energy cost (not the `combat.energy` PvP field). If any charged move in the dataset lacks a PvE energy cost value, the developer must raise a spec revision; proceeding with missing data would silently default to an arbitrary fallback.

- **STAB type matching.** STAB determination requires comparing the move's type against the Pokémon's own types. Both must be sourced from the build-time dataset using the existing type identifiers. If a type identifier mismatch exists between move type identifiers and Pokémon type identifiers (e.g., due to aliasing or casing differences), STAB matching will fail silently. The developer must verify that the comparison uses the same identifier namespace for both.

- **MoveEntry interface extension.** Iteration 14 added `isRecommended: boolean` to `MoveEntry`. This iteration changes how `isRecommended` is computed, but the interface itself is unchanged. The developer must update the computation in `parsePokemonData` (or equivalent) and confirm that no code caches or pre-validates the old computed values.

- **Dataset cases that are ambiguous to the algorithm.** Real Pokémon data will include edge cases where two moves score identically on all four factors. The tiebreaker must be stable and documented. If the tiebreaker produces a result that contradicts community consensus for a prominent Pokémon, the developer should raise this before shipping rather than silently ship a counterintuitive recommendation.

- **Regression against Iteration 14 ACs.** Changing the `isRecommended` computation may change the recommended move for any Pokémon compared to Iteration 14's output. All Iteration 14 structural and visual ACs must still pass, but specific Pokémon that were tested manually in Iteration 14 may now show a different recommendation. This is expected and acceptable — the test suite should verify structure and attribute correctness, not which specific move is recommended.

---

## 8. Future Considerations

The following are explicitly deferred and must not influence this iteration:

- Displaying the factor values (energy cost, power, survivability score, STAB flag) used to compute recommendation.
- PvP recommendation distinctions (Great League, Ultra League, Master League, Silph Cup formats).
- STAB highlighting as a separate visual signal on move items (independent of recommendation).
- Raid boss type effectiveness — recommending moves that are super-effective against common raid bosses rather than STAB-effective for the Pokémon itself.
- Weather boost consideration (certain move types gain a bonus under specific in-game weather).
- Shadow Pokémon bonus consideration (Shadow Pokémon deal increased damage, which affects the relative value of move cost vs. power).
- Accessibility improvements to style-only signals.
- Animated transitions or interactive filtering.
- Player-specific moveset overlay or moveset comparison.
- Dark mode or system-level theme adaptation.
