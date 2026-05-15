# Spec 0020 – Pokémon Card Role-Anchored Tier Presentation

**Status:** In Progress  
**Iteration:** 20  
**Author:** Architect agent  
**Date:** 2026-05-15

---

## 1. Goal

Eliminate the visual ambiguity that arises from displaying tier badges separately from their roles. After iterations 18 and 19, the card has two independent role-communication sections: a compact badge row (spec 0018's `role-tier-section`) and a grouped moveset area (spec 0019's `role-moveset-section`). A player reading the card must mentally link badges in one row to labelled groups further down. This spec consolidates both into a single **role block** per role, where the label, tier, and (for attacker roles) recommended moves form one visual unit. The defender role is presented with equal structural clarity — a labelled block with a tier — without implying that it has a recommended moveset.

---

## 2. Context / Background

Iteration 18 introduced per-role tier badges in a compact, unlabelled row. Iteration 19 introduced role-labelled moveset groups, but only for Pokémon with two or more viable attacker roles. Single-role Pokémon gained no label; their tier badge remained detached from any textual anchor. For multi-role Pokémon, the tier badge row and the moveset groups are correctly ordered but exist in two separate sections with no direct visual connection. For the defender role, the badge conveys a tier but gives no indication of what role it represents.

The consolidated role block design was the logical conclusion suggested by spec 0019's §8 ("Tier badge co-location inside each role-moveset-group header" — explicitly deferred). This iteration delivers it.

---

## 3. Functional Behavior

### 3.1 Role Block Section

A new section — the **`pve-roles-section`** — replaces both the `role-tier-section` from spec 0018 and the `role-moveset-section` from spec 0019. It is rendered for every Pokémon with valid stats (i.e. for every Pokémon that receives a `defenderTier`). Its placement in the card is identical to the former `role-tier-section`: below the stat bars, above the standard move groups.

The section contains one **role block** per rendered role, in document order:

1. One attacker role block per entry in `attackerRoles` (ordered by the `attackerRoles` array order, primary type first per spec 0018 §3.5).
2. Exactly one defender role block.

If `attackerRoles` is empty (fallback Pokémon), the section contains only the defender role block.

### 3.2 Attacker Role Block

Each attacker role block corresponds to one entry in `attackerRoles`. It contains, in document order:

1. **Role label** — text in the format `"[TypeId] attacker"` (e.g. `"Rock attacker"`, `"Dark attacker"`). This is the same label format introduced in spec 0019 §3.3.
2. **Tier badge** — the tier letter (S, A, B, or C) rendered with the role type's color from `TYPE_COLORS` as its background accent, following the visual treatment established in spec 0018 §3.6. The badge is co-located with the role label as a single unit.
3. **Recommended Quick move** for this role — the single Quick move with `isRecommended: true` and `typeId` matching this role's `typeId`. Rendered using the same move item element as established in spec 0013 and spec 0014 (`data-testid="move-item"`, `data-move-type`, `data-is-elite`, `data-is-recommended`).
4. **Recommended Charged move** for this role — the single Charged move with `isRecommended: true` and `typeId` matching this role's `typeId`. Same move item element as above.

If a role has no matching recommended Quick or Charged move (invariant violation in the domain layer), the component renders only the moves that are available. This case is not tested; the domain layer is responsible for ensuring one of each per role.

### 3.3 Defender Role Block

The defender role block contains:

1. **Role label** — the text `"Defender"`.
2. **Tier badge** — the tier letter rendered with a neutral color (not drawn from `TYPE_COLORS`), following the visual treatment established in spec 0018 §3.6 for the defender item.

No move items are rendered inside the defender role block. The UI must not imply that the defender role has a recommended moveset equivalent in status to attacker role movesets.

### 3.4 Standard Move Group Filtering

For Pokémon with **one or more** viable attacker roles (`attackerRoles.length >= 1`), the `quick-moves-group` and `charged-moves-group` display only non-recommended moves (moves with `isRecommended: false`). Recommended moves are exclusively rendered inside their corresponding attacker role blocks and must not appear in the standard groups.

This supersedes spec 0019 §3.2, which applied the filter only when `attackerRoles.length >= 2`. The scope of the filter is now extended to single-role Pokémon.

If, after filtering, a standard group would contain zero move items, that group is not rendered. This behavior is unchanged from spec 0019 §3.2.

For **fallback Pokémon** (`attackerRoles.length === 0`), no filtering occurs. `quick-moves-group` and `charged-moves-group` display all moves including recommended ones, exactly as in spec 0017 §3.3.

### 3.5 Domain Model

No changes to `PokemonEntry`, `MoveEntry`, `AttackerRoleTier`, `TierLabel`, or any domain interface. The component derives all role block content from the existing fields established in specs 0017 and 0018: `attackerRoles[i].typeId`, `attackerRoles[i].tier`, `defenderTier`, `quickMoves[j].isRecommended + typeId`, `chargedMoves[k].isRecommended + typeId`.

### 3.6 Data Attributes

| Element | Data attribute | Value |
|---------|---------------|-------|
| `pve-roles-section` | `data-testid` | `"pve-roles-section"` |
| attacker role block | `data-testid` | `"role-block"` |
| attacker role block | `data-role` | `"attacker"` |
| attacker role block | `data-role-type` | the `typeId` string (e.g. `"Rock"`) |
| attacker role block | `data-tier` | the tier letter (e.g. `"S"`) |
| defender role block | `data-testid` | `"role-block"` |
| defender role block | `data-role` | `"defender"` |
| defender role block | `data-tier` | the tier letter |

Move items within role blocks carry all existing move-item data attributes (`data-testid="move-item"`, `data-move-name`, `data-move-type`, `data-is-elite`, `data-is-recommended`) unchanged from spec 0013 and spec 0014.

### 3.7 Superseded Elements

The following elements from prior specs are retired by this spec:

| Retired element | Defined in | Replacement |
|----------------|-----------|-------------|
| `role-tier-section` (container) | Spec 0018 §3.6 | `pve-roles-section` |
| Attacker badge (`data-role="attacker"`, `data-type-id`, `data-tier` on standalone badge elements) | Spec 0018 §3.6 | Attacker role block in `pve-roles-section` carrying `data-role="attacker"`, `data-role-type`, `data-tier` |
| Defender badge (`data-role="defender"`, `data-tier` on standalone badge element) | Spec 0018 §3.6 | Defender role block in `pve-roles-section` carrying `data-role="defender"`, `data-tier` |
| `role-moveset-section` (container) | Spec 0019 §3.2 | `pve-roles-section` |
| `role-moveset-group` (per-role group) | Spec 0019 §3.3 | Attacker role block in `pve-roles-section` |
| Single-role no-label rule | Spec 0019 §3.5 | Superseded — single-role Pokémon now receive an attacker role block with a label |
| Multi-role-only filter trigger (`>= 2`) | Spec 0019 §3.2 | Superseded — filter now triggers for `>= 1` |

The developer must remove the `RoleTierSection` and `RoleMovesetSection` sub-components and replace them with a unified sub-component implementing the `pve-roles-section`. Tests covering the retired elements (spec 0018 AC-15–AC-20 component tests; spec 0019 AC-01–AC-03, AC-07, AC-08, AC-13, AC-14, AC-16–AC-19 component tests) must be updated to reflect the new structure.

### 3.8 Type Name and Role Text Constraints

The constraint from spec 0017 §4 ("No text such as 'Rock role', 'attacker'… appears anywhere in the move section") is superseded in the scope of attacker role block labels within `pve-roles-section`. This supersession extends spec 0019 §3.7's scope from multi-role to all Pokémon with at least one attacker role.

The text "Defender" introduces a new role label for the defender block. The constraint from spec 0018 §3.6 ("No text such as 'Attacker', 'Defender', 'tier', or any explanation of the tier system appears anywhere on the card") is **superseded in the narrow scope of the `pve-roles-section`**. The labels "Defender", "[TypeId] attacker" within `pve-roles-section` are structural role identifiers, not explanatory text. All other spec 0018 §3.6 constraints (no numeric stats, no tier explanations outside the badge letters, no legends) remain in force.

---

## 4. Constraints

- **No new data sources.** All role block content derives from fields established in specs 0017 and 0018.
- **No displayed statistics.** No numeric values appear in any role block or tier badge.
- **No legends or explanatory text.** No tooltip, footnote, or explanation of tier meaning is added anywhere on the card.
- **No interaction.** Role blocks are not collapsible, filterable, or togglable.
- **No tier without a role label.** No tier badge or tier indicator may appear on the card outside a role block that carries an explicit role label.
- **No overall tier.** No element communicates a combined or overall quality score.
- **Defender block carries no moves.** No move item may appear inside the defender role block.
- **Build-time only.** All rendering logic executes from static props. No browser-side computation.
- **Static export.** Application remains a fully static Next.js export.
- **No PvP content.** Role blocks communicate PvE gym/raid roles only.

---

## 5. Non-Goals

- Defender move recommendations (any iteration).
- Tier explanations, legends, or tooltips.
- Interactive role filtering or per-role moveset comparison.
- Animated transitions between role blocks.
- A third attacker role (not possible with dual typing in the current dataset).
- PvP role differentiation.
- Changes to how tiers are calculated (spec 0018 domain logic is unchanged).
- Changes to how recommended moves are selected (spec 0017 domain logic is unchanged).
- Changes to the card header, stat bars, evolution chain, image, URL, or search behavior.
- Any feature not explicitly stated in section 3.

---

## 6. Acceptance Criteria

### `pve-roles-section` — structural presence

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-01 | `pve-roles-section` renders inside `card-content-section` for any Pokémon with valid stats. | Render a Pokémon with attacker roles and a Pokémon with no attacker roles; assert `pve-roles-section` is present in both. |
| AC-02 | `pve-roles-section` does not render inside `card-header`. | Render any Pokémon; assert `queryByTestId('pve-roles-section')` within `card-header` is null. |
| AC-03 | `pve-roles-section` appears after `stat-bar-sta` and before `move-section` in document order. | Render a Pokémon with moves; collect `[data-testid]` nodes in `card-content-section`; assert `pve-roles-section` index is greater than `stat-bar-sta` and less than `move-section`. |

### Role block count and ordering

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-04 | A Pokémon with two attacker roles renders exactly three `role-block` elements: two attacker and one defender. | Render Tyranitar (Rock/Dark); query all `role-block` elements; assert count is 3, first two have `data-role="attacker"`, last has `data-role="defender"`. |
| AC-05 | A Pokémon with one attacker role renders exactly two `role-block` elements: one attacker and one defender. | Render a single-role fixture; assert count is 2, first has `data-role="attacker"`, second has `data-role="defender"`. |
| AC-06 | A Pokémon with no attacker roles (fallback) renders exactly one `role-block` element with `data-role="defender"`. | Render a fallback fixture (`attackerRoles: []`); assert count is 1, has `data-role="defender"`. |
| AC-07 | Attacker role blocks appear before the defender role block in document order. | Render Tyranitar; collect `role-block` elements in DOM order; assert the last one is the defender. |
| AC-08 | Attacker role blocks appear in primary-type-first order. | Render Tyranitar; assert first `role-block` has `data-role-type="Rock"`, second has `data-role-type="Dark"`. |

### Attacker role block content

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-09 | Each attacker role block contains a `"[TypeId] attacker"` label. | Render Tyranitar; within the Rock block, assert `"Rock attacker"` is present; within the Dark block, assert `"Dark attacker"`. |
| AC-10 | Each attacker role block contains a tier badge with its `data-tier` matching the `attackerRoles` tier for that role. | Render Tyranitar with Rock=S and Dark=A roles; assert Rock block has `data-tier="S"`, Dark block has `data-tier="A"`. |
| AC-11 | Each attacker role block contains exactly two move items, both `data-is-recommended="true"`: the Quick move first, the Charged move second. | Render Tyranitar; within each attacker block, query all `move-item` elements; assert count is 2, both recommended, first has `data-move-type` matching `data-role-type`, second has `data-move-type` matching `data-role-type`. |
| AC-12 | An elite recommended move inside an attacker role block retains `data-is-elite="true"` and italic styling. | Use a fixture with an elite recommended move for an attacker role; assert the move item inside the block carries `data-is-elite="true"` and `fontStyle: 'italic'`. |

### Defender role block content

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-13 | The defender role block contains the text `"Defender"`. | Render any Pokémon; within the defender block, assert `"Defender"` text is present. |
| AC-14 | The defender role block contains a tier badge with `data-tier` matching `defenderTier`. | Render a Pokémon with `defenderTier="B"`; assert defender block has `data-tier="B"`. |
| AC-15 | The defender role block contains no `move-item` elements. | Render any Pokémon; within the defender block, assert `queryAllByTestId('move-item')` returns an empty array. |

### Tier anchoring — no floating tiers

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-16 | No element carrying a tier indicator (`data-tier`) exists outside `pve-roles-section`. | Render any Pokémon; query all `[data-tier]` elements; assert all are descendants of `pve-roles-section`. |
| AC-17 | The retired `role-tier-section` element is absent. | Render any Pokémon; assert `queryByTestId('role-tier-section')` is null. |
| AC-18 | The retired `role-moveset-section` element is absent. | Render any Pokémon; assert `queryByTestId('role-moveset-section')` is null. |

### Standard group filtering — extended to single-role Pokémon

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-19 | For a single-role Pokémon, `quick-moves-group` contains no `data-is-recommended="true"` move items. | Render a single-role fixture with at least one non-recommended quick move; assert `quick-moves-group` exists and all its move items have `data-is-recommended="false"`. |
| AC-20 | For a single-role Pokémon, `charged-moves-group` contains no `data-is-recommended="true"` move items. | Render a single-role fixture with at least one non-recommended charged move; assert `charged-moves-group` exists and all its move items have `data-is-recommended="false"`. |
| AC-21 | For a fallback Pokémon, `quick-moves-group` contains the recommended move (no filtering applied). | Render a fallback fixture; assert `quick-moves-group` contains the move with `data-is-recommended="true"`. |
| AC-22 | For a fallback Pokémon, `charged-moves-group` contains the recommended move (no filtering applied). | Render a fallback fixture; assert `charged-moves-group` contains the move with `data-is-recommended="true"`. |

### No role label for defender, no move in defender block

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-23 | No text matching `"[TypeId] attacker"` format appears inside the defender role block. | Render any Pokémon; within the defender block, assert `queryByText(/attacker/)` is null. |
| AC-24 | The word `"Defender"` does not appear inside any attacker role block. | Render any Pokémon; within each attacker block, assert `queryByText('Defender')` is null. |

### Live-dataset validation

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-25 | Every Pokémon in the live dataset that produces a `defenderTier` has a `pve-roles-section` when rendered. | Parse live dataset; for a representative set of at least ten Pokémon spanning fallback, single-role, and multi-role categories, assert `pve-roles-section` is present. |
| AC-26 | Tyranitar's `pve-roles-section` contains three role blocks: Rock attacker (S), Dark attacker (A or S), Defender. | Parse live dataset; find Tyranitar; assert `attackerRoles.length === 2` and `attackerRoles[0].typeId === 'Rock'` and `attackerRoles[1].typeId === 'Dark'`; render the card and assert three role blocks with the correct data attributes. |

### Build and static export

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-27 | Running `next build` produces a static export with no server-dependent artefacts. | Run `next build`; confirm `out/` contains only static files; spot-check Tyranitar's rendered HTML for `data-testid="pve-roles-section"` and absence of `data-testid="role-tier-section"`. |

---

## 7. Risks

- **Large test surface requiring updates.** This spec retires `role-tier-section`, `role-moveset-section`, and `role-moveset-group` and supersedes behavior from both spec 0018 and spec 0019. The developer must update or remove the following test blocks: spec 0018 component tests (AC-15 to AC-20 plus ordering test), spec 0019 component tests (AC-01 through AC-03, AC-07, AC-08, AC-13, AC-14, AC-16 through AC-19). Failing to update these will produce false failures on retired elements. The developer must audit the full test file before beginning implementation.

- **Single-role filter change breaks spec 0019 AC-18/AC-19.** These tests assert that a single-role Pokémon's `quick-moves-group` and `charged-moves-group` contain the recommended move. Under spec 0020, recommended moves for single-role Pokémon are now inside the attacker role block; the standard groups are filtered. AC-18 and AC-19 become incorrect specifications for the new behavior and must be replaced with AC-19 and AC-20 from this spec.

- **`data-type-id` vs `data-role-type` attribute rename.** The spec 0018 standalone badge used `data-type-id`; this spec uses `data-role-type` for consistency with spec 0019. Any test querying `[data-type-id]` on the role tier section must be updated to `[data-role-type]` on `role-block` elements.

- **"Defender" label introduces new text on card.** Spec 0018 §3.6 explicitly prohibited "Defender" as a text label. Spec 0020 §3.8 supersedes that constraint. The developer must verify no existing test asserts the absence of the word "Defender" and update such tests if found.

- **Spec 0018 AC-19 role-tier text check.** Spec 0018's test `'AC-19: role-tier section contains no explanatory text labels'` asserts the content of `role-tier-section` contains no `attacker`, `defender`, `tier`, `best`, or `role` text. Since `role-tier-section` is retired, this test must be removed rather than updated. The developer must not create an equivalent test asserting `pve-roles-section` has no such text — `pve-roles-section` intentionally contains "attacker" and "Defender" labels.

- **Spec 0014 AC-02 / AC-05 single-recommended-per-group invariant.** These tests assert exactly one `data-is-recommended="true"` move item in the quick and charged groups respectively. Their fixtures use no `attackerRoles` (defaults to `[]`), placing them on the fallback path where no filtering occurs. They remain valid. The developer must not modify these tests.

- **Empty standard groups for all-recommended single-role Pokémon.** If a single-role Pokémon has exactly one Quick and one Charged move and both are recommended, both standard groups will be empty and not rendered. The developer must verify this case is handled without rendering empty group elements.

---

## 8. Future Considerations

The following are explicitly deferred:

- Defender move recommendation (any iteration).
- Tier context tooltips or expanded explanations on interaction.
- Per-role type color applied to the entire role block background (beyond the tier badge).
- Visual differentiation via icons (type icons, role icons) rather than text labels.
- Accessibility improvements (`aria-label` on role blocks for screen reader navigation).
- Animated role block transitions.
- A third attacker role (not possible with dual typing in the current dataset).
- PvP role blocks (Great League, Ultra League, Master League).
