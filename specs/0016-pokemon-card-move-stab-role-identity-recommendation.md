# Spec 0016 – Pokémon Card Move STAB and Role-Identity Recommendation Refinement

**Status:** Complete  
**Iteration:** 16  
**Author:** Architect agent  
**Date:** 2026-05-15

---

## 1. Goal

Extend move recommendation to account for same-type attack bonus (STAB) in quick move selection and to incorporate role identity — a primary-type preference for high-Attack Pokémon — in both quick and charged move selection, so that recommendations reflect how a Pokémon is actually used in gym and raid battles rather than which move wins on a single raw stat.

---

## 2. Context / Background

Spec 0014 introduced quick move recommendation as highest energy generation and charged move recommendation as highest base power.

Spec 0015 replaced charged move recommendation with a four-factor PvE viability model — survivability-adjusted feasibility, energy efficiency, STAB, and base power — but left quick move recommendation unchanged: highest energy generation, alphabetical tiebreaker.

Two gaps remain that reduce the practical trustworthiness of recommendations:

**STAB is absent from quick move recommendation.** A non-STAB quick move with marginally higher energy generation is recommended over a STAB alternative, even when the STAB damage contribution more than compensates in sustained PvE play. Every quick move activation deals damage; a STAB quick move deals 20% more damage per activation throughout the entire encounter. Ignoring this produces recommendations that undervalue type-matched moves — the moves a knowledgeable player would actually choose.

**Off-type and secondary-type moves can be recommended over a Pokémon's primary-type STAB moves even for high-Attack Pokémon.** A Pokémon with high base Attack is used in gym and raid battles primarily as a type-specialized attacker. Its primary type is its combat identity: players select it for the raid because of what type of damage it deals. Recommending an off-type quick move or a secondary-type move over a viable primary-type STAB move misrepresents that role. Absol is a concrete illustration: a Dark-type attacker with base Attack of 246 (substantially above the dataset mean of ~167) whose quick move pool includes both Snarl (Dark, STAB) with energy 13 and Psycho Cut (Psychic, non-STAB) with energy 7. Under the spec 0015 framework, Snarl already wins on energy generation — but the principle that a non-STAB move with higher energy could win over a primary-type STAB move for high-Attack Pokémon is a gap that this spec closes explicitly. The pattern is also relevant for cases where the energy generation advantage of an off-type move is marginal but not negligible.

This iteration makes two targeted additions to the recommendation framework:

1. **STAB for quick moves.** A STAB quick move is preferred when its energy generation is not substantially lower than the best non-STAB alternative. The STAB damage contribution compensates for a small energy generation deficit.
2. **Role identity.** For Pokémon with high base Attack relative to the dataset, a quick or charged move matching the Pokémon's primary type is additionally preferred when other factors are otherwise comparable. This reflects their function as type-specialized attackers.

All visual behavior, move list structure, Elite italic signal, and non-recommendation-logic behavior from Iterations 13–15 is unchanged.

---

## 3. Functional Behavior

### 3.1 Recommended Quick move (supersedes spec 0014 §3.1 as preserved in spec 0015 §3.1)

The recommended Quick move is the move most practically effective for this Pokémon in PvE gym and raid battles. Energy generation remains the foundation of quick move value — it determines how frequently charged moves can be fired — but STAB and role identity are now positive factors that can influence the recommendation when the energy generation comparison is not decisive.

Practical effectiveness is evaluated using the following factors in priority order:

**Factor 1 – STAB preference**

A quick move whose type matches one of the Pokémon's own types (STAB) benefits from a 20% damage multiplier on every activation in gym and raid encounters. When a STAB quick move exists in the pool, it is preferred unless the best available non-STAB quick move has an energy generation advantage large enough that the resulting increase in charged move frequency would outweigh the STAB damage bonus across a typical raid encounter. When the energy generation gap is small enough that a player would not notice a meaningful difference in charged move frequency, the STAB bonus tips the balance.

A non-STAB quick move may still be recommended when its energy generation advantage is large enough that the additional charged move activations it enables deliver more total benefit than the per-activation STAB damage contribution — a gap that represents a genuine practical difference in raid effectiveness, not merely a marginal paper improvement. Energy generation remains decisive when the advantage is clear.

When no STAB quick move exists in the pool, this factor does not apply and the remaining factors determine recommendation.

When all quick moves in the pool are STAB, this factor does not differentiate among them and the remaining factors apply.

**Factor 2 – Role identity**

Factor 2 applies only when Factor 1 did not yield a clear winner — specifically when all quick moves in the pool are STAB (so the STAB-vs-non-STAB comparison in Factor 1 does not differentiate among them) or when energy generation is equal between remaining candidates.

Within that scope, for Pokémon with high base Attack relative to the dataset, a quick move matching the Pokémon's primary type is preferred over a move matching only the secondary type. High-Attack Pokémon function as type-specialized attackers in gym and raid battles; their primary type is their combat identity. When two STAB quick moves are otherwise equivalent, the primary-type move reflects how the Pokémon is actually deployed.

This factor applies only to Pokémon whose base Attack is substantially above the dataset mean. For all other Pokémon, this factor is skipped.

**Factor 3 – Energy generation**

Among moves where Factors 1 and 2 do not yield a clear winner, higher energy generation is preferred.

**Tiebreaker**

When all factors are equivalent, the developer must apply a stable alphabetical tiebreaker (localeCompare by move name) so that recommendation is deterministic across builds. The tiebreaker must be documented.

**Edge cases**

- When the quick move pool contains exactly one move, that move is recommended regardless of its type.
- When the quick move pool is empty, no quick move is recommended.

### 3.2 Recommended Charged move (supersedes spec 0015 §3.2)

The four-factor PvE viability framework from spec 0015 §3.2 is retained. Factors 1, 2, and 4 are unchanged. Factor 3 is extended to incorporate role identity for high-Attack Pokémon.

**Factor 1 – Survivability-adjusted feasibility** (unchanged from spec 0015 §3.2)

A Pokémon with low survivability must not have a very high energy cost charged move recommended when a lower-cost alternative exists. Low-survivability Pokémon cannot reliably execute expensive moves before fainting. This factor is the most important: it must not be overridden by STAB, role identity, or base power.

**Factor 2 – Energy efficiency** (unchanged from spec 0015 §3.2)

A charged move that costs substantially less energy to fire is more reliably executed. When one move has low energy cost and another has very high energy cost, energy efficiency clearly determines the winner. All else being equal, a lower energy cost is preferable.

**Factor 3 – STAB and role identity**

*STAB:* When no clear winner emerges from Factors 1 and 2, a STAB charged move is preferred over a non-STAB charged move when the STAB move's base power multiplied by 1.2 meets or exceeds the non-STAB move's base power. STAB does not override Factor 1 or Factor 2.

*Role identity:* Role identity applies within Factor 3 only after the STAB comparison has been evaluated and did not yield a clear winner — that is, when both candidate moves are STAB with comparable power such that the 1.2× test does not differentiate them, or when neither candidate is STAB. In those cases, for Pokémon with high base Attack relative to the dataset, the primary-type move is preferred over a move matching only the secondary type or no type.

**Factor 4 – Base power** (unchanged from spec 0015 §3.2)

Among moves where Factors 1–3 do not yield a clear winner, the higher-power move is preferred.

**Tiebreaker and edge cases** (unchanged from spec 0015 §3.2)

Alphabetical tiebreaker. Single-move pool: that move is recommended. Empty pool: no recommendation.

### 3.3 Preserved visual layer (unchanged from spec 0015 §3.3)

All visual and structural behavior from spec 0015 §3.3 is preserved without change. At most one Quick move and one Charged move receive recommendation emphasis per Pokémon. Elite status is italic only and remains orthogonal to recommendation.

### 3.4 Preserved behaviors from prior iterations

All functional behavior from Iterations 13–15 is preserved, except that:

- The Spec 0014 §3.1 quick move recommendation rule (as preserved in Spec 0015 §3.1) is superseded by §3.1 of this spec.
- The Spec 0015 §3.2 charged move recommendation rule is superseded by §3.2 of this spec.

---

## 4. Constraints

- **No new data sources.** All inputs to recommendation determination come from the existing build-time dataset (move energy generation, move power, move energy cost, move type, Pokémon types, Pokémon base Attack, Pokémon base stamina and defense). No additional APIs, files, or external resources are introduced.
- **No displayed statistics.** Values used in computation — energy generation, power, Attack stat, STAB flag — must not appear in the rendered output. Recommendation remains a visual signal only.
- **Deterministic.** Given a fixed dataset, recommendation output must be identical across all builds and environments.
- **Build-time only.** All recommendation logic executes at parse or build time. No computation occurs in the browser.
- **Static-only.** The application remains a fully static Next.js export.
- **No new infrastructure.** Deployment pipeline, hosting, and data sources are unchanged.
- **No text labels.** No text explaining the recommendation signal appears in the move section.
- **No ranking or ordering.** The factor ordering governs the algorithm; it must not be surfaced in the UI.

---

## 5. Non-Goals

- PvP move recommendations.
- Numeric move statistics or Attack stat values in the UI.
- Explanation of why a move is recommended or what role identity means.
- STAB highlighting as a separate visual signal on move items (STAB affects determination only).
- Rankings, tiers, or ordered lists of moves.
- Player-specific moveset or team context.
- Changes to the visual recommendation layer, Elite italic signal, move list structure, or group labels from Iterations 13–15.
- Changes to the card header, stat bars, evolution chain, image, URL behavior, or search behavior.
- Any feature not explicitly stated in section 3.

---

## 6. Acceptance Criteria

### Quick move recommendation — STAB

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-01 | A Pokémon with a STAB quick move and a non-STAB quick move, where the non-STAB move has marginally higher energy generation, receives `data-is-recommended="true"` on the STAB move. | Identify a Pokémon in the live dataset with at least one STAB quick move (energy X) and at least one non-STAB quick move (energy Y, where Y > X but the gap falls within the range described in §3.1 Factor 1 — small enough that a player would not notice a meaningful difference in charged move frequency). Render the Pokémon; confirm the STAB move carries `data-is-recommended="true"`. If no such Pokémon exists in the live dataset, introduce a test fixture. |
| AC-02 | A Pokémon with a non-STAB quick move that has substantially higher energy generation than all STAB alternatives receives `data-is-recommended="true"` on the non-STAB move (energy generation wins when the gap is large). | Identify a Pokémon in the live dataset, or introduce a test fixture, where the highest-energy non-STAB quick move has substantially greater energy generation than all STAB alternatives — a gap large enough that the STAB damage contribution does not compensate. Confirm the non-STAB move carries `data-is-recommended="true"`. |
| AC-03 | When all quick moves in a pool are STAB, exactly one is still recommended and the recommendation is not affected by the absence of a non-STAB alternative. | Render a Pokémon whose full quick move pool consists entirely of STAB moves; confirm exactly one carries `data-is-recommended="true"`. |
| AC-04 | When no quick move in the pool is STAB (all are off-type), the quick move with the highest energy generation is recommended, consistent with prior behavior. | Render a Pokémon whose full quick move pool consists entirely of non-STAB moves; confirm the move with the highest energy generation carries `data-is-recommended="true"`. If no such Pokémon exists in the live dataset, introduce a test fixture. |

### Quick move recommendation — role identity

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-05 | A high-Attack Pokémon whose entire quick move pool consists of STAB moves, where a primary-type STAB move and a secondary-type STAB move have equal or comparable energy generation, receives `data-is-recommended="true"` on the primary-type move. | Identify a Pokémon with base Attack substantially above the dataset mean whose quick move pool contains both a primary-type STAB move and a secondary-type STAB move with equal or comparable energy generation — isolating Factor 2 by ensuring Factor 1 cannot resolve the comparison. Rayquaza (Dragon/Flying, high Attack) is a candidate from the live dataset: Dragon Tail (Dragon, primary STAB, energy 8) and Air Slash (Flying, secondary STAB, energy 8) have equal energy, so Factor 1 does not differentiate them; Factor 2 should select Dragon Tail. Confirm the primary-type move carries `data-is-recommended="true"`. If no suitable live-dataset case exists, introduce a test fixture. |
| AC-06 | A Pokémon with average or low base Attack does not have role identity applied: a non-primary-type quick move with substantially higher energy generation is recommended over a primary-type STAB alternative. | Identify a Pokémon with base Attack at or below the dataset mean that has at least one non-primary-type quick move with substantially higher energy generation than its primary-type STAB quick moves — a gap large enough that, per §3.1 Factor 1, energy generation wins. Confirm the non-primary-type move carries `data-is-recommended="true"`. This verifies that role identity is not applied outside the high-Attack category. If no such Pokémon exists in the live dataset, introduce a test fixture. |

### Charged move recommendation — role identity

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-07 | A high-Attack Pokémon with both a primary-type STAB charged move and a secondary-type STAB charged move of comparable energy cost and comparable power receives `data-is-recommended="true"` on the primary-type move. | Identify a Pokémon with base Attack substantially above the dataset mean, with at least one charged move matching its primary type (primary-type STAB) and at least one charged move matching its secondary type (secondary-type STAB), where energy cost and power do not yield a clear winner on Factors 1 and 2. Confirm the primary-type move carries `data-is-recommended="true"`. If no such Pokémon exists in the live dataset, introduce a test fixture. |
| AC-08 | Role identity does not override Factor 1: a high-Attack fragile Pokémon with a primary-type STAB charged move at very high energy cost and a non-primary-type lower-cost alternative has the lower-cost move recommended. | Identify or construct a test fixture representing a low-survivability, high-Attack Pokémon whose primary-type STAB charged move has energy cost ≥ 75 and whose non-primary-type charged move has energy cost ≤ 50. Confirm the lower-cost move carries `data-is-recommended="true"`. |

### Preserved spec 0015 charged move criteria

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-09 | All Spec 0015 acceptance criteria for charged move recommendation (AC-02 through AC-09 from Spec 0015) continue to pass. | Run the full test suite for Spec 0015 charged move recommendation; confirm no regressions. |

### Recommendation completeness and determinism

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-10 | Every Pokémon with a non-empty quick move pool has exactly one quick move carrying `data-is-recommended="true"`. | Render a representative sample of at least ten Pokémon from the live dataset; confirm exactly one `move-item` inside each `quick-moves-group` carries `data-is-recommended="true"`. |
| AC-11 | Recommendation output for both quick and charged moves is identical across two independent builds from the same dataset. | Run `next build` twice without modifying the dataset; confirm `data-is-recommended` attributes are identical in both outputs for all Pokémon. |

### No text label or statistic in UI

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-12 | No text label communicating STAB, role identity, primary type, Attack stat, or any derived value appears inside `move-section` as a result of this iteration. | Inspect all text nodes inside `move-section` across several rendered Pokémon; confirm none contain text introduced by this iteration's recommendation logic. |

### Iteration 14–15 visual layer — no regression

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-13 | All Iteration 14 and 15 acceptance criteria for visual emphasis, data attributes, Elite italic, combined signals, and visual hierarchy continue to pass. | Run the full test suite and manual QA checklist from Iterations 14 and 15; confirm no regressions. |

### Build and static export

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-14 | Running `next build` produces a static export with no server-dependent artefacts. | Run `next build`; confirm `out/` contains only static files. |

---

## 7. Risks

- **Definition of "high base Attack."** The spec requires identifying Pokémon whose base Attack is substantially above the dataset mean. The developer must choose a threshold and document it. The threshold should be stable enough that role identity applies to recognisable type-specialized attackers (e.g. Absol, Rampardos, Haxorus, Machamp) and not to average or defensive Pokémon. If the chosen threshold produces counterintuitive inclusions or exclusions for well-known cases, the developer must raise a spec revision before shipping.

- **Definition of "not substantially lower energy generation" for quick moves.** The developer must determine when a STAB quick move's energy generation deficit is small enough that the STAB bonus compensates, and when it is too large. This requires a judgment on the practical exchange rate between energy generation and STAB damage output. The developer must document the criterion applied and verify it produces correct results for Absol (Snarl recommended over Psycho Cut) and for cases where a non-STAB move genuinely dominates on energy generation. If the threshold is unclear from the data, raise a spec revision.

- **Quick move STAB introduces a new computation path.** The current implementation (`applyRecommended`) uses a single sort key (`_stat` for energy generation). Introducing STAB and role identity for quick moves requires that the quick move path knows the Pokémon's types and Attack stat at parse time — the same context already passed to `applyChargedRecommended`. The developer must extend the quick move call site consistently with the charged move approach, ensuring no circular dependency or double-pass of the full dataset.

- **Role identity for charged moves interacting with existing Factor 3.** The spec extends Factor 3 by adding role identity after STAB. The developer must ensure that role identity is evaluated only when STAB does not already yield a clear winner — not as an override of the existing stab_power × 1.2 comparison. The test for AC-07 verifies the additive case; the developer must also verify the non-override case.

- **Regression in quick move tiebreaker tests.** Existing tests that verify the alphabetical tiebreaker for quick moves were written without STAB context — both moves have the same energy and neither was explicitly typed as STAB or non-STAB. Introducing STAB into quick move recommendation may cause those tests to pass for a different reason (STAB wins before the tiebreaker) or to break if the moves are now unintentionally STAB or non-STAB for the test Pokémon. The developer must review all existing quick move recommendation tests and update any whose fixture data no longer isolates the factor being tested.

- **Absol case verification.** Absol (Dark, Attack 246) has Snarl (Dark, energy 13) and Psycho Cut (Psychic, energy 7). Under the current spec 0015 implementation, Snarl already wins on energy generation — there is no regression risk from the Absol case specifically. However, the developer should confirm this as a smoke test after implementation, since the Absol case is the motivating example. If dataset updates change Absol's move pool or energy values, the developer must reconfirm before shipping.

- **Dataset changes between iterations.** If the dataset is refreshed between iterations, energy generation values or move pools may change for any Pokémon. Any recommendation changes due to dataset updates — as distinct from algorithm changes — are expected and acceptable.

---

## 8. Future Considerations

The following are explicitly deferred and must not influence this iteration:

- PvP recommendation distinctions.
- Displaying the factors or values used to compute recommendation.
- STAB highlighting as a separate visual signal on move items.
- Raid boss type effectiveness (recommending moves super-effective against common bosses).
- Weather boost consideration.
- Shadow Pokémon damage bonus.
- Role identity for non-Quick-or-Charged move contexts.
- Accessibility improvements to style-only signals.
- Animated transitions, interactive filtering, or player-specific moveset overlays.
- Dark mode or system-level theme adaptation.
