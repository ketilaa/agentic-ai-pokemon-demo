# Spec 0019 – Pokémon Card Role-Anchored Move Recommendations

**Status:** In Progress  
**Iteration:** 19  
**Author:** Architect agent  
**Date:** 2026-05-15

---

## 1. Goal

Reorganise the move section of the Pokémon card so that, for Pokémon with multiple viable PvE attacker roles, each recommended moveset is explicitly anchored to its corresponding role. A player looking at Tyranitar's card today sees two bold Quick moves and two bold Charged moves with no indication which pair forms the Rock moveset and which forms the Dark moveset. This iteration makes that connection unambiguous without increasing overall visual noise.

---

## 2. Context / Background

Iteration 17 introduced per-role move recommendations: a Pokémon with two viable attacker roles gets two recommended Quick moves and two recommended Charged moves, one per role per slot. Iteration 18 added a compact role-tier section — one coloured badge per attacker role, one neutral badge for the defender role — positioned between the stat bars and the move list.

The result is that the card already communicates *which roles a Pokémon has* (role-tier section) and *which moves are recommended* (bold `isRecommended` moves). What it does not communicate is the mapping from role to moveset. For a single-role Pokémon no mapping is needed. For a two-role Pokémon like Tyranitar, four bold moves appear in two groups (two Quick, two Charged) with no visible indication that Smack Down pairs with Stone Edge and Bite pairs with Crunch.

This spec adds a `role-moveset-section` above the standard move groups that lifts the recommended moves out and groups them under a small role label for each attacker role. The standard quick-moves-group and charged-moves-group remain, now showing only the non-recommended moves for context.

---

## 3. Functional Behavior

### 3.1 Trigger Condition

The `role-moveset-section` is rendered if and only if the Pokémon has **two or more viable attacker roles** (i.e. `attackerRoles.length >= 2`).

- A Pokémon with zero or one viable attacker role (including fallback Pokémon with `attackerRoles.length === 0`) does not render a `role-moveset-section`. Its move section structure and rendering are unchanged from spec 0017.

### 3.2 Role-Moveset Section Structure

When the trigger condition is met, the move section renders as follows (in document order):

1. **`role-moveset-section`** — a container holding one `role-moveset-group` per viable attacker role.
2. **`quick-moves-group`** — non-recommended Quick moves only (same element and data attributes as before; filtered to exclude recommended moves).
3. **`charged-moves-group`** — non-recommended Charged moves only (same element and data attributes as before; filtered to exclude recommended moves).

If, after filtering, `quick-moves-group` or `charged-moves-group` would contain zero move items, that group is not rendered.

### 3.3 Role-Moveset Group

Each `role-moveset-group` corresponds to exactly one viable attacker role. The groups are ordered to match the `attackerRoles` array order, which is the Pokémon's type order (primary type first) as established in spec 0018 §3.5.

Each group contains:

1. A **role label** — a small, visually subordinate text string in the format `"[TypeId] attacker"` where `[TypeId]` is the `typeId` string from `attackerRoles` (e.g. `"Rock attacker"`, `"Dark attacker"`). The label serves as an orientation aid; it is not a section heading.
2. The **recommended Quick move** for this role — the single Quick move with `isRecommended: true` whose `typeId` matches this role's `typeId`.
3. The **recommended Charged move** for this role — the single Charged move with `isRecommended: true` whose `typeId` matches this role's `typeId`.

Each move item inside a `role-moveset-group` retains all existing data attributes: `data-is-recommended="true"`, `data-is-elite`, `data-move-type`, and all visual emphasis (bold/high-contrast text, elite italic). No new data attributes are added to move items themselves.

If multiple recommended moves with the same `typeId` and move slot exist (invariant violation in the domain layer), the component renders the first one encountered in array order. This case is not tested; the domain layer is responsible for preventing it.

### 3.4 Data Attributes on Role Elements

| Element | Data attribute | Value |
|---------|---------------|-------|
| `role-moveset-section` | `data-testid` | `"role-moveset-section"` |
| `role-moveset-group` | `data-testid` | `"role-moveset-group"` |
| `role-moveset-group` | `data-role-type` | the `typeId` string (e.g. `"Rock"`) |

### 3.5 Single-Role and Fallback Pokémon (Unchanged)

For Pokémon with `attackerRoles.length === 0` (fallback) or `attackerRoles.length === 1` (single-role):

- No `role-moveset-section` is rendered.
- `quick-moves-group` and `charged-moves-group` render all moves exactly as before (spec 0013–0017).
- Recommended moves retain `data-is-recommended="true"` within their standard groups.
- No role label, role indicator, or anchoring label of any kind is shown.

### 3.6 Tier Context Integration

The role-tier section from spec 0018 is retained unchanged. Visual association between a role's tier badge and its moveset group is established through **consistent ordering**: both the role-tier badge sequence and the `role-moveset-group` sequence follow `attackerRoles` order (primary type first). No tier badge or tier label is rendered inside or adjacent to a `role-moveset-group`. Tier information remains exclusively in the role-tier section above.

### 3.7 Type Name Constraint Superseded

Spec 0004 established that type names must not appear as standalone text labels in the card. This constraint is **superseded in the narrow scope of `role-moveset-group` labels** — the `"[TypeId] attacker"` label constitutes a role orientation aid, not a type badge or type legend. All other spec 0004 type-color and type-badge constraints remain in force.

Spec 0017 §4 contains a standing constraint: "No text such as 'Rock role', 'attacker', 'STAB role', or any role-communicating language appears anywhere in the move section." **This constraint is superseded in the narrow scope of `role-moveset-group` labels for multi-role Pokémon.** All other spec 0017 §4 constraints (no statistics displayed, no legends, no interaction, no text labels outside `role-moveset-group` headers) remain in force.

### 3.8 Domain Model

No changes to `PokemonEntry`, `MoveEntry`, `AttackerRoleTier`, `TierLabel`, or any domain interface. The component derives all role-group content from the existing fields: `attackerRoles[i].typeId`, `quickMoves[j].isRecommended` + `quickMoves[j].typeId`, and `chargedMoves[k].isRecommended` + `chargedMoves[k].typeId`. No build-time logic changes.

### 3.9 Elite Indication

Elite italic (spec 0014) is orthogonal to role anchoring. A recommended elite move inside a `role-moveset-group` renders in italic, exactly as it would in the standard group. This is unchanged.

---

## 4. Constraints

- **No new data sources.** All grouping is derived from fields already present on `PokemonEntry` and its nested types.
- **No statistics or values displayed.** No energy cost, base power, tier numeric, or computed quantity appears inside any move item or role label.
- **No legends or explanatory text.** No tooltip, footnote, or explanation of the role label meaning is added.
- **No interaction.** Role groups are not collapsible, filterable, or togglable.
- **Build-time only.** All grouping logic executes at render time from static props. No browser-side computation.
- **Static export.** Application remains a fully static Next.js export.
- **No card-header or stat changes.** PokémonCard header, type badges, stat bars, and evolution chain are unaffected.
- **No PvP content.** Role labels communicate PvE gym/raid roles only.
- **At most one Quick and one Charged per role group.** The per-role recommendation guarantee from spec 0017 §3.2 means each role always contributes exactly one Quick and one Charged move to its group. The component may assume this invariant.

---

## 5. Non-Goals

- Role labels for single-role Pokémon.
- Tier badges or tier labels inside role groups.
- A role label showing a Pokémon's defender role.
- Move statistics (energy, power, DPS) anywhere in the card.
- Animated grouping transitions.
- Interactive role filtering or per-role moveset comparison.
- PvP or weather-modified role recommendations.
- Changes to how recommended moves are selected (spec 0017 domain logic is unchanged).
- Changes to the existing role-tier section (spec 0018 is unchanged).
- Any feature not explicitly stated in section 3.

---

## 6. Acceptance Criteria

### Role-moveset section — structural presence

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-01 | A Pokémon with two viable attacker roles renders a `role-moveset-section` inside `move-section`. | Render Tyranitar (Rock/Dark dual-role); query `getByTestId('role-moveset-section')`; assert it is present. |
| AC-02 | A Pokémon with one viable attacker role does not render a `role-moveset-section`. | Render Absol (single Dark role); query `queryByTestId('role-moveset-section')`; assert it is absent. |
| AC-03 | A Pokémon with no viable attacker roles (fallback) does not render a `role-moveset-section`. | Use a test fixture with `attackerRoles: []`; render the card; assert `queryByTestId('role-moveset-section')` is null. |

### Role-moveset section — group count and ordering

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-04 | `role-moveset-section` contains exactly one `role-moveset-group` per viable attacker role. | Render Tyranitar; query all `role-moveset-group` elements inside `role-moveset-section`; assert count is 2. |
| AC-05 | `role-moveset-group` elements appear in primary-type-first order, matching the `attackerRoles` array order and the role-tier badge order. | Render Tyranitar; collect `data-role-type` values from the two groups in DOM order; assert they equal `['Rock', 'Dark']` (primary type first). |

### Role labels

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-06 | Each `role-moveset-group` contains a visible text label in the format `"[TypeId] attacker"`. | Render Tyranitar; within the first `role-moveset-group` (`data-role-type="Rock"`), assert the text `"Rock attacker"` is present; within the second (`data-role-type="Dark"`), assert `"Dark attacker"` is present. |
| AC-07 | No role label appears for a single-role Pokémon. | Render Absol; assert `queryByText(/attacker/)` returns null inside `move-section`. |
| AC-08 | No role label appears for a fallback Pokémon (no viable roles). | Render the no-viable-role fixture; assert `queryByText(/attacker/)` returns null inside `move-section`. |

### Move content of role groups

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-09 | Each `role-moveset-group` contains exactly two move items with `data-is-recommended="true"`: the first (Quick) and the second (Charged). | Render Tyranitar; within the Rock group, query all move items carrying `data-is-recommended="true"`; assert count is 2; assert the first is the Quick move (rendered from `quickMoves`) and the second is the Charged move (rendered from `chargedMoves`). Repeat for the Dark group. |
| AC-10 | The Quick move item in a `role-moveset-group` has a `data-move-type` matching the group's `data-role-type`. | Render Tyranitar; within the Rock group, assert the first `data-is-recommended="true"` move item's `data-move-type` equals `"Rock"`. Within the Dark group, assert `"Dark"`. |
| AC-11 | The Charged move item in a `role-moveset-group` has a `data-move-type` matching the group's `data-role-type`. | Render Tyranitar; within the Rock group, assert the second `data-is-recommended="true"` move item's `data-move-type` equals `"Rock"`. Within the Dark group, assert `"Dark"`. |
| AC-12 | An elite recommended move inside a `role-moveset-group` retains the elite italic indication. | Use a test fixture with an elite recommended move for a multi-role Pokémon; render the card; assert the move item inside the `role-moveset-group` carries both `data-is-elite="true"` and `data-is-recommended="true"`. |

### Standard groups for multi-role Pokémon

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-13 | For a multi-role Pokémon, `quick-moves-group` contains no move item with `data-is-recommended="true"`. | Render Tyranitar; query all move items inside `quick-moves-group`; assert none carry `data-is-recommended="true"`. |
| AC-14 | For a multi-role Pokémon, `charged-moves-group` contains no move item with `data-is-recommended="true"`. | Render Tyranitar; query all move items inside `charged-moves-group`; assert none carry `data-is-recommended="true"`. |
| AC-15 | For a multi-role Pokémon, a move that appears in a `role-moveset-group` does not also appear in `quick-moves-group` or `charged-moves-group` (no duplication). | Render Tyranitar; collect move names inside all `role-moveset-group` elements; assert none of those names appear inside `quick-moves-group` or `charged-moves-group`. |
| AC-16 | For a multi-role Pokémon, if all Quick moves are recommended (no non-recommended Quick moves remain), `quick-moves-group` is not rendered. | Use a test fixture with exactly two Quick moves, each recommended for a different role; render the card; assert `queryByTestId('quick-moves-group')` is null. |
| AC-17 | For a multi-role Pokémon, if all Charged moves are recommended (no non-recommended Charged moves remain), `charged-moves-group` is not rendered. | Use a test fixture with exactly two Charged moves, each recommended for a different role; render the card; assert `queryByTestId('charged-moves-group')` is null. |

### Single-role Pokémon — no regression

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-18 | For a single-role Pokémon, `quick-moves-group` continues to contain all Quick moves including the recommended one. | Render Absol; assert `quick-moves-group` contains the recommended Quick move with `data-is-recommended="true"`. |
| AC-19 | For a single-role Pokémon, `charged-moves-group` continues to contain all Charged moves including the recommended one. | Render Absol; assert `charged-moves-group` contains the recommended Charged move with `data-is-recommended="true"`. |

### Live-dataset validation

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-20 | Tyranitar's role-moveset-section in the live dataset contains a Rock group and a Dark group, in that order. | Parse live dataset; find Tyranitar; assert `attackerRoles[0].typeId === 'Rock'` and `attackerRoles[1].typeId === 'Dark'`; render card and assert two `role-moveset-group` elements in order. |
| AC-21 | For every Pokémon in the live dataset with `attackerRoles.length >= 2`, each role-moveset-group contains exactly one Quick and one Charged move item. | Parse live dataset; for every Pokémon with two or more attacker roles, render the card and assert each group has exactly one Quick and one Charged recommended move. |
| AC-22 | For every Pokémon in the live dataset with `attackerRoles.length <= 1`, `role-moveset-section` is absent. | Parse live dataset; for every Pokémon with zero or one attacker roles, render the card and assert `role-moveset-section` is absent. |

### Build and static export

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-23 | Running `next build` produces a static export with no server-dependent artefacts, with all role-moveset-section markup present for multi-role Pokémon. | Run `next build`; confirm `out/` contains only static files; spot-check Tyranitar's rendered HTML for `data-testid="role-moveset-section"`. |

---

## 7. Risks

- **Move-item deduplication between role groups and standard groups.** For multi-role Pokémon, recommended moves are rendered only in `role-moveset-section` and must not appear in `quick-moves-group` or `charged-moves-group`. The component must filter the standard groups to exclude moves with `isRecommended: true` when `attackerRoles.length >= 2`. A mistake here could cause duplicate move display (AC-15) or broken assertion on existing tests that check move counts in standard groups.

- **Regression on single-role and fallback paths.** The filter that removes recommended moves from standard groups must be conditional on `attackerRoles.length >= 2`. If applied unconditionally, single-role and fallback Pokémon would lose their recommended moves from standard groups, breaking AC-18, AC-19, and all spec 0014–0017 regression tests.

- **Tyranitar live-dataset verification.** AC-20 requires `attackerRoles[0].typeId === 'Rock'` (primary type first). The developer must verify this in the live dataset output before writing the test. If Tyranitar's primary type is Dark rather than Rock in the dataset, the expected order in AC-20 must be adjusted to match the data.

- **Empty standard groups.** When all moves in a category are recommended for roles, the standard group becomes empty and must not be rendered (AC-16, AC-17). The developer must guard against rendering an empty group element — both for visual correctness and to avoid breaking any test that asserts group presence.

- **`data-type-id` source for role group label.** The `typeId` field on `AttackerRoleTier` is the type's identifier string (e.g. `"Rock"`, `"Dark"`). This string is used directly in the role label format `"[TypeId] attacker"`. The component does not need to look up a separate display name; `typeId` is already in the expected display form (capitalised noun). The developer must not introduce a separate type-name lookup or label mapping.

- **AC-12 elite fixture.** The live dataset may not contain a multi-role Pokémon with an elite recommended move. If no live-data anchor is available, the developer must construct a synthetic test fixture to cover this case.

- **Spec 0017 AC-13 constraint.** Spec 0017 AC-13 asserts that no text label communicating role, type, STAB, energy cost, power, or any derived value appears inside `move-section`. Spec 0019 §3.7 explicitly supersedes this constraint for role-moveset-group labels. Spec 0017 AC-13 was not implemented as a standalone automated test in the current test suite; the developer does not need to remove or modify any existing test for this reason. The developer must not introduce a new test asserting the absence of role labels in `move-section` for multi-role Pokémon.

- **Spec 0004 regression test scope.** The spec 0004 regression tests assert that no type name appears as standalone text in the card (e.g. `queryByText('Rock')` is null). Those tests use fixtures without a `role-moveset-section` and will not false-fail under spec 0019. The developer must not extend those tests to multi-role Pokémon fixtures without accounting for the `"[TypeId] attacker"` labels introduced in §3.3.

---

## 8. Future Considerations

The following are explicitly deferred:

- Role labels inside the role-tier section (badges already serve that function).
- Tier badge co-location inside each `role-moveset-group` header.
- Interactive collapse/expand per role group.
- A third attacker role (not possible with dual typing in the current dataset).
- PvP moveset grouping under league labels.
- Accessibility improvements (e.g. `aria-label` on role groups for screen reader navigation).
- Visual differentiation between role groups via type color (beyond label text).
