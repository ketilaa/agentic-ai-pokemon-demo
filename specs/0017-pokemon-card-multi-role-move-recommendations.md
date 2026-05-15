# Spec 0017 – Pokémon Card Multi-Role Move Recommendations

**Status:** Revised  
**Iteration:** 17  
**Author:** Architect agent  
**Date:** 2026-05-15

---

## 1. Goal

Replace the current single-recommendation model — one recommended Quick move and one recommended Charged move per Pokémon — with a per-role model that reflects how Pokémon with more than one viable PvE attacker role are actually used in gym and raid battles. A Pokémon used as both a Rock attacker and a Dark attacker should surface both movesets, not suppress one in favour of the other.

---

## 2. Context / Background

Iterations 14–16 progressively refined move recommendations toward practical PvE accuracy:

- Iteration 14 introduced recommendation emphasis (one Quick, one Charged per Pokémon).
- Iteration 15 added survivability, energy efficiency, STAB, and base power factors for Charged moves.
- Iteration 16 added STAB and role-identity factors for Quick moves.

These iterations all share a structural assumption: **one recommendation per move type per Pokémon**. This assumption is correct for Pokémon with a single PvE attacker role — Absol, for example, functions exclusively as a Dark attacker; a single Quick and Charged recommendation correctly represents how it is used.

The assumption breaks down for Pokémon with two genuinely distinct PvE attacker roles. Tyranitar is the canonical example. Tyranitar is both a top-tier Rock attacker (Smack Down / Stone Edge) and a top-tier Dark attacker (Bite / Crunch) in gym and raid battles. Neither role is marginal or situational: both are fielded by players regularly, for different raid bosses. Under the current model, the recommendation algorithm compares Smack Down, Bite, and other Quick moves in a single pool and selects one winner. The result collapses two distinct, valid movesets into one, misrepresenting the Pokémon's practical value and giving players incomplete information.

The fix is a role-aware recommendation model:

1. Identify the set of viable PvE attacker roles for each Pokémon.
2. For each viable role, independently select the best Quick move and the best Charged move.
3. All moves recommended for any viable role receive recommendation emphasis.

Single-role Pokémon are not exempt from this change. A Pokémon with exactly one viable role has its recommendations restricted to type-T moves — non-type moves in its pool are excluded from recommendation consideration. In cases where the spec 0016 full-pool algorithm would have recommended a non-STAB move (because its energy generation or power advantage exceeded the STAB threshold), spec 0017 produces a different result. This is intentional: a Pokémon fielded for a specific type role should have its recommended moves serve that role, not moves that score marginally higher on a single isolated stat.

---

## 3. Functional Behavior

### 3.1 Viable PvE Attacker Role

A **viable PvE attacker role** is defined for a Pokémon type T when all three conditions are met:

1. **Type ownership.** T is one of the Pokémon's own types (primary or secondary). This ensures the Pokémon benefits from STAB for moves of type T.
2. **Quick move coverage.** The Pokémon's quick move pool contains at least one move of type T.
3. **Charged move coverage.** The Pokémon's charged move pool contains at least one move of type T.

A Pokémon whose two types both satisfy all three conditions has two viable roles. A Pokémon where exactly one type satisfies all three conditions has one viable role. A Pokémon where no type satisfies all three conditions has no viable roles and falls back to the generalist behavior described in §3.3.

Whether a Pokémon has high or low Attack, is fragile, or has a large or small move pool does not affect role determination. Role determination is a structural question — does the pool support this type in both move slots — not a quality question. The quality of each role's best moveset is evaluated during per-role recommendation in §3.2.

### 3.2 Per-Role Move Recommendation

For each viable role R (defined by type T):

**Recommended Quick move for role R**

Apply the spec 0016 §3.1 recommendation logic to the subset of the Pokémon's quick move pool that consists of moves of type T.

Within a same-type pool, all moves are STAB for the role by definition. Factor 1 (STAB vs. non-STAB) does not differentiate candidates — all are STAB. Factor 2 (role identity) does not differentiate candidates — all are the same type. Factor 3 (energy generation) is therefore the primary differentiator, followed by the alphabetical tiebreaker. The factors apply correctly and naturally to the restricted pool without modification.

When the role's Quick move pool contains exactly one move, that move is recommended for this role regardless of its energy generation value.

**Recommended Charged move for role R**

Apply the spec 0016 §3.2 recommendation logic to the subset of the Pokémon's charged move pool that consists of moves of type T.

Within a same-type pool, all moves are STAB for the role by definition. Factor 3 STAB (the stab_power × 1.2 comparison) does not differentiate candidates. Factor 3 role identity does not differentiate candidates. Factors 1 (survivability feasibility), 2 (energy efficiency), and 4 (base power) apply normally. The factors apply correctly and naturally to the restricted pool without modification.

When the role's Charged move pool contains exactly one move, that move is recommended for this role regardless of its energy cost or the Pokémon's survivability.

**Result**

Each viable role yields at most one recommended Quick move and at most one recommended Charged move. A move recommended for any viable role has `isRecommended: true`. A move not recommended for any viable role has `isRecommended: false`.

A move may appear in a Quick pool that covers multiple viable roles only if it is of a type matching multiple of the Pokémon's own types — which is impossible in the current dataset (each move has exactly one type). In practice, each move belongs to at most one role's pool, so each move either receives `isRecommended: true` (selected as the best move in the pool of exactly one viable role) or `isRecommended: false` (not selected by any role). No role information is attached to `isRecommended`; the flag indicates selection, not role membership.

### 3.3 Fallback: No Viable Roles

When no type satisfies all three conditions in §3.1 — for example, a Pokémon whose STAB type moves exist only for Quick moves but not Charged moves, or a Pokémon with no STAB moves at all in one slot — the single-pool recommendation from spec 0016 §§3.1–3.2 applies to the full Quick and Charged pools respectively. Exactly one Quick move and exactly one Charged move are recommended (subject to the existing edge cases: empty pool yields no recommendation; single-move pool recommends that move).

This fallback ensures every Pokémon with a non-empty move pool receives at least one Quick and one Charged recommendation.

### 3.4 Visual Layer Changes

The existing visual recommendation emphasis from spec 0014 — bold/high-contrast move name text, `data-is-recommended` attribute — is applied to every move with `isRecommended: true`. There is no change to the emphasis style itself.

The constraint from spec 0016 §3.3 — "at most one Quick move and at most one Charged move receive recommendation emphasis per Pokémon" — is superseded. The new constraint is:

**At most one Quick move and at most one Charged move receive recommendation emphasis per viable role per Pokémon.**

For a single-role Pokémon this remains one Quick and one Charged. For a two-role Pokémon this is at most two Quick and at most two Charged.

The `data-is-recommended` attribute semantics are unchanged: `"true"` on recommended move items, `"false"` on non-recommended move items. Multiple move items in the same group may carry `data-is-recommended="true"` when the Pokémon has multiple viable roles.

No label, badge, role name, type name, or explanatory text is added to any move item as a result of this iteration. The recommendation signal remains purely visual.

Elite status (italic move name) is orthogonal to recommendation and is unchanged. An elite move may or may not be recommended; a non-elite move may or may not be recommended.

### 3.5 Preserved Behaviors

All functional behavior from Iterations 13–16 is preserved, except that:

- The spec 0016 §3.3 constraint "at most one Quick move and at most one Charged move receive recommendation emphasis per Pokémon" is superseded by §3.4 of this spec.
- All spec 0016 per-move recommendation logic (§§3.1–3.2) continues to apply unchanged within each role's restricted pool.
- For any Pokémon with one or more viable roles (§3.1), the per-role algorithm in §3.2 replaces the spec 0016 full-pool algorithm. Non-type moves — moves whose type does not match any viable role's type — are excluded from recommendation consideration. This applies to both single-role and multi-role Pokémon. Only the §3.3 fallback path uses the full unrestricted move pool.

---

## 4. Constraints

- **No new data sources.** Role determination and per-role recommendation use only the existing build-time dataset: move type, move energy generation, move power, move energy cost, Pokémon types, Pokémon base stats. No additional APIs, files, or external resources are introduced.
- **No displayed statistics.** Type identifiers, role names, energy values, power values, or any computed quantities must not appear in the rendered output. Recommendation remains a visual signal only.
- **Deterministic.** Given a fixed dataset, role determination and recommendation output must be identical across all builds and environments.
- **Build-time only.** All role determination and recommendation logic executes at parse or build time. No computation occurs in the browser.
- **Static-only.** The application remains a fully static Next.js export.
- **No new infrastructure.** Deployment pipeline, hosting, and data sources are unchanged.
- **No text labels.** No text such as "Rock role", "attacker", "STAB role", or any role-communicating language appears anywhere in the move section.
- **No ranking or ordering of roles.** Roles must not be surfaced as ordered or ranked in the UI.

---

## 5. Non-Goals

- PvP role recommendations.
- Roles defined by raid boss type matchup (super-effective offense) rather than Pokémon typing.
- Displaying the role, type, or any factor used to compute recommendation.
- A visual distinction between moves recommended for different roles (all emphasis is identical).
- Role filtering or per-role moveset comparison as interactive features.
- Changes to the move list structure, group labels, deduplication logic, or placement from Iteration 13.
- Changes to the card header, stat bars, evolution chain, image, URL behavior, or search behavior.
- Any feature not explicitly stated in section 3.

---

## 6. Acceptance Criteria

### Role determination — multi-role Pokémon

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-01 | A Pokémon that has STAB quick moves and STAB charged moves for both of its types has two viable roles identified. | Identify a Pokémon in the live dataset that (a) has two types, (b) has at least one quick move of each type, and (c) has at least one charged move of each type. Tyranitar (Rock/Dark) is the primary live-dataset candidate: Smack Down (Rock quick), Bite or Snarl (Dark quick), Stone Edge (Rock charged), Crunch (Dark charged). Render the Pokémon; confirm that exactly two Quick moves carry `data-is-recommended="true"` (one Rock-type, one Dark-type) and exactly two Charged moves carry `data-is-recommended="true"` (one Rock-type, one Dark-type). |
| AC-02 | A Pokémon that has STAB quick and charged moves for only one of its types has one viable role and produces exactly one recommended Quick move and one recommended Charged move. | Identify a Pokémon whose secondary type has no matching quick moves or no matching charged moves in its pool. Absol (Dark/no secondary) has a single type — it trivially qualifies. Identify at least one dual-type Pokémon where one type lacks move coverage in either slot. Render the Pokémon; confirm exactly one `move-item` in each group carries `data-is-recommended="true"`. If no suitable dual-type live-dataset Pokémon exists, introduce a test fixture. |
| AC-03 | A Pokémon where neither type has both a quick move and a charged move of that type (no viable role) falls back to single-pool recommendation and produces exactly one recommended Quick move and one recommended Charged move. | Introduce a test fixture representing a dual-type Pokémon whose quick moves cover only one type and whose charged moves cover only the other type (no single type spans both slots). Render the fixture; confirm exactly one `move-item` in each group carries `data-is-recommended="true"`. |

### Per-role recommendation — quick moves

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-04 | For each viable role, the recommended Quick move for that role is the move with the highest energy generation among quick moves of the role's type. | For the Tyranitar Rock role, confirm the recommended Rock-type Quick move is the move with the highest energy generation among all Rock-type Quick moves in Tyranitar's pool. Repeat for the Dark role. If multiple Rock-type or Dark-type Quick moves exist, verify the highest-energy one is recommended. Alphabetical tiebreaker applies when energy values are equal. |
| AC-05 | The Quick move recommended for role R is always of type matching R's type. | For all Pokémon with multiple viable roles, confirm that each recommended Quick move's `typeId` matches one of the Pokémon's own type identifiers, and that no two recommended Quick moves share the same `typeId`. |

### Per-role recommendation — charged moves

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-06 | For each viable role, the recommended Charged move for that role is selected by applying the spec 0016 §3.2 factor ordering (survivability feasibility → energy efficiency → base power → alphabetical tiebreaker) within the charged moves of that role's type. | For the Tyranitar Rock role, if multiple Rock-type charged moves exist (e.g. Stone Edge and Rock Slide), confirm the recommended one reflects the factor ordering: the lower-cost move is preferred over a higher-cost move for a fragile Pokémon; the higher-power move is preferred otherwise. |
| AC-07 | Survivability feasibility applies per role: a fragile Pokémon with a high-cost charged move and a lower-cost alternative of the same type has the lower-cost alternative recommended for that role. | Identify or construct a test fixture where a low-survivability Pokémon has two charged moves of the same STAB type, one with energy cost ≥ 75 and one with energy cost ≤ 50. Confirm the lower-cost move carries `data-is-recommended="true"` for that role. |
| AC-08 | The Charged move recommended for role R is always of type matching R's type. | For all Pokémon with multiple viable roles, confirm that each recommended Charged move's `typeId` matches one of the Pokémon's own type identifiers, and that no two recommended Charged moves share the same `typeId`. |

### Single-role Pokémon — no artificial extra recommendations

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-09 | A single-role Pokémon has exactly one Quick move and exactly one Charged move carrying `data-is-recommended="true"`, both of the Pokémon's viable role type. | Identify at least five single-role Pokémon from the live dataset. Render each; confirm exactly one `move-item` in each group carries `data-is-recommended="true"`. Confirm that the recommended Quick move has the highest energy generation among all Quick moves of the viable role's type in the pool, and that the recommended Charged move is selected by the spec 0016 §3.2 factor ordering applied to Charged moves of that type only. Where the spec 0016 full-pool algorithm would have recommended a non-type move (e.g. a non-STAB Quick move with higher energy generation), the spec 0017 result will differ — this divergence is expected and must not be treated as a regression. If no live-dataset single-role Pokémon has a non-type move in its pool that would have won under spec 0016, introduce a test fixture demonstrating the divergence. |

### Completeness and determinism

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-10 | Every Pokémon with a non-empty Quick move pool has at least one Quick move carrying `data-is-recommended="true"`. | Render a representative sample of at least ten Pokémon; confirm no `quick-moves-group` has zero `data-is-recommended="true"` items. |
| AC-11 | Every Pokémon with a non-empty Charged move pool has at least one Charged move carrying `data-is-recommended="true"`. | Render a representative sample of at least ten Pokémon; confirm no `charged-moves-group` has zero `data-is-recommended="true"` items. |
| AC-12 | Recommendation output is identical across two independent builds from the same dataset. | Run `next build` twice without modifying the dataset; confirm all `data-is-recommended` attributes are identical in both outputs. |

### No text label or statistic in UI

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-13 | No text label communicating role, type, STAB, energy cost, power, or any derived value appears inside `move-section` as a result of this iteration. | Inspect all text nodes inside `move-section` across several rendered Pokémon; confirm none contain text introduced by this iteration's recommendation logic. |

### Iteration 14–16 visual layer — no regression

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-14 | All Iteration 14, 15, and 16 acceptance criteria for visual emphasis, data attributes, Elite italic, combined signals, and visual hierarchy continue to pass for Pokémon whose recommendation output is unchanged by this iteration (single-role Pokémon). | Run the full test suite; confirm no regressions on single-role Pokémon. |

### Build and static export

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-15 | Running `next build` produces a static export with no server-dependent artefacts. | Run `next build`; confirm `out/` contains only static files. |

---

## 7. Risks

- **Behavioral change for single-role Pokémon.** The per-role algorithm restricts recommendations to type-T moves for all Pokémon with viable roles, including single-role ones. Any single-role Pokémon whose spec 0016 recommendation was a non-STAB move (because the non-STAB move's energy or power advantage exceeded the STAB threshold) will produce a different recommendation under spec 0017. The developer must identify such Pokémon in the live dataset, confirm the change is intentional for each case, and update any test that asserts a specific non-STAB move is recommended for a single-role Pokémon.

- **`isRecommended` semantics change.** The current model guarantees at most one `true` per group. Under this spec, multiple moves in the same group can have `isRecommended: true`. Any code, test, or component that asserts `exactly one recommended move per group` must be updated. The developer must audit all test assertions and component logic that depend on the "at most one" invariant before shipping.

- **MoveEntry interface stability.** `isRecommended: boolean` remains sufficient under this spec — a move is either recommended for some role or it is not. The developer must not add role or type information to `MoveEntry` unless a spec revision explicitly requires it. Adding unrequested fields would exceed the implementation mandate.

- **Tyranitar move pool verification.** The spec uses Tyranitar as the primary live-dataset candidate for AC-01. The developer must confirm Tyranitar's actual move pool in the dataset before writing tests: specifically, that Smack Down or another Rock-type Quick move exists alongside a Dark-type Quick move, and that Stone Edge or another Rock-type Charged move exists alongside Crunch. If Tyranitar's pool has changed in the dataset, the developer must identify an alternative live-dataset candidate or construct a fixture and raise a spec note.

- **Fallback interaction with spec 0016 role identity.** The spec 0016 §3.2 role-identity factor (primary-type preference within a comparable charged move comparison) is retained unchanged and applies within fallback single-pool recommendation. In the per-role path, role identity and STAB factors naturally do not differentiate candidates within a same-type pool. The developer must ensure the fallback path and the per-role path use the same underlying sort function without a conditional branch that accidentally skips role identity in the fallback case.

- **Move pool subsets that produce no viable role for one slot.** It is possible for a Pokémon to have a STAB quick move but no STAB charged move of the same type, or vice versa. In this case that type does not yield a viable role and the fallback applies. The developer must ensure this case is handled by the role determination step before move selection and does not cause an empty recommendation list.

- **Interaction with existing test fixtures.** Many existing test fixtures were written without type-matching move pools (e.g. a Fire Pokémon with a Normal-type charged move). These do not need to change for existing tests to pass, because the fallback behavior matches the prior full-pool behavior for Pokémon with no viable roles. The developer should verify that no existing test unexpectedly gains a multi-role path by inadvertently satisfying role viability conditions.

- **Performance of multi-pass sort.** For most Pokémon the move pool is small (2–6 moves per slot). Running separate sort passes per role adds negligible cost. If the dataset ever expands significantly, this may warrant review, but no optimization is needed in this iteration.

---

## 8. Future Considerations

The following are explicitly deferred and must not influence this iteration:

- Role labels, type indicators, or any visual distinction between moves recommended for different roles.
- Interactive role filtering or per-role moveset comparison.
- Roles defined by raid boss type matchup (super-effective offense).
- PvP role distinction (Great League, Ultra League, Master League).
- Weather boost or Shadow Pokémon bonus consideration per role.
- Move sets with more than two viable roles (currently impossible given dual typing, but relevant if the dataset introduces alternate forms with different type combinations).
- Accessibility improvements to style-only recommendation signals.
- Animated transitions, dark mode, or player-specific moveset overlays.
