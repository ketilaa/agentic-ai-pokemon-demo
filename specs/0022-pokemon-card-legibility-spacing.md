# Spec 0022 – Pokémon Card Legibility and Spacing

**Status:** Complete  
**Iteration:** 22  
**Author:** Architect agent  
**Branch:** `iteration-22-pokemon-card-legibility-spacing`

---

## 1. Context

The current card renders at a compressed density suited to displaying many entries simultaneously,
but at the expense of readability and touch usability. Move items are too small to tap reliably on
mobile, tier badges are difficult to read at normal viewing distance, and section separations are
insufficient for users to quickly orient within the card.

This iteration applies targeted sizing and spacing adjustments only. No data, logic, roles, tiers,
recommendations, colors, or new UI elements are introduced.

All changes are confined to `src/components/pokemon-card.tsx`.

---

## 2. Non-Goals

- No data changes.
- No logic changes (filtering, role assignment, recommendation selection).
- No new UI elements or labels.
- No color or typography family changes.
- No changes outside `src/components/pokemon-card.tsx`.

---

## 3. Specification

MUI spacing unit = 8 px throughout. All `sx` spacing values use MUI theme units.

### 3.1 Move items

Move items must present a minimum perceived height of **36 px** to meet mobile touch affordance
expectations.

| Property | Before | After |
|----------|--------|-------|
| `px` | `0.75` (6 px) | `1.25` (10 px) |
| `py` | `0.25` (2 px) | `1.25` (10 px) |
| `fontSize` | `'0.7rem'` | `'0.75rem'` |

Rationale: at `0.75rem` with line-height 1.4, content height ≈ 16.8 px. With `py: 1.25` (10 px ×
2 = 20 px), total height ≈ **36.8 px**, placing the element within the 36–44 px target range.
Padding is increased before font size per the iteration constraint.

Italic text (`isElite: true`) inherits these dimensions and must not be reduced below surrounding
move item font size. No additional change is required; italic is a style variant of the same font
and size.

Each `MoveItem` element must carry a `data-min-height="36"` attribute so tests can verify that the
minimum height requirement has been encoded.

### 3.2 Tier badges

Tier badges (both attacker and defender) must be legible at normal viewing distance. The letter
already satisfies the "not rely on color alone" requirement (text is the primary identifier).

| Property | Before | After |
|----------|--------|-------|
| `width` | `16` (px) | `20` (px) |
| `height` | `16` (px) | `20` (px) |
| `fontSize` | `'0.55rem'` | `'0.65rem'` |
| `borderRadius` | `'3px'` | `'4px'` |

Color and opacity of badge backgrounds are unchanged.

Each tier badge element must carry `data-testid="tier-badge"` and `data-badge-size="20"` attributes.

### 3.3 Role label font size

Role labels ("Rock attacker", "Defender", etc.) are increased to match move item font size.

| Property | Before | After |
|----------|--------|-------|
| `fontSize` | `'0.6rem'` | `'0.75rem'` |

Applies to both attacker role labels and the "Defender" label.

### 3.4 Role block separation

`PveRolesSection` gap controls separation between role blocks. Each role block must read as a
distinct visual unit.

| Property | Before | After |
|----------|--------|-------|
| `PveRolesSection` `gap` | `0.75` (6 px) | `1.5` (12 px) |
| `role-block` internal `gap` | `0.5` (4 px) | `0.75` (6 px) |

### 3.5 Inter-section vertical spacing

Sections are separated by `mt` on the opening element of each section:

| Section element | Before | After |
|-----------------|--------|-------|
| `PveRolesSection` `mt` | `1` (8 px) | `2` (16 px) |
| `MoveSection` `mt` | `1.5` (12 px) | `2.5` (20 px) |
| Evolution `Box` `mt` | `1.5` (12 px) | `2.5` (20 px) |

`PveRolesSection` `mb` is removed (was `0.25`); spacing below is now owned entirely by the
consuming section's `mt`.

### 3.6 Card content padding

The content section (`data-testid="card-content-section"`) vertical padding is increased to give
the card interior more breathing room.

| Property | Before | After |
|----------|--------|-------|
| `py` | `1.5` (12 px) | `2` (16 px) |

`px` (horizontal padding) is unchanged at `2` (16 px).

### 3.7 Move group label font size

"Quick moves" and "Charged moves" section labels are increased for consistency with role labels.

| Property | Before | After |
|----------|--------|-------|
| `fontSize` | `'0.6rem'` | `'0.7rem'` |

### 3.8 Responsive behaviour

No explicit breakpoint logic is added. The existing `maxWidth: 480` and `mx: 'auto'` constraints
remain. The spacing increases defined in §3.1–§3.7 alone are sufficient to eliminate the
"compressed mobile" appearance on 320–375 px viewports, as the card fills available width and
the increased internal spacing scales proportionally.

---

## 4. Acceptance Criteria

### Move items

| ID | Criterion | Testable |
|----|-----------|---------|
| AC-01 | Every `data-testid="move-item"` element has `data-min-height="36"`. | automated |
| AC-02 | Elite move items (`data-is-elite="true"`) have `data-min-height="36"`, confirming they share the same sizing. | automated |

### Tier badges

| ID | Criterion | Testable |
|----|-----------|---------|
| AC-03 | Every attacker `role-block` contains exactly one element with `data-testid="tier-badge"` and `data-badge-size="20"`. | automated |
| AC-04 | The defender `role-block` contains exactly one element with `data-testid="tier-badge"` and `data-badge-size="20"`. | automated |
| AC-05 | No `data-testid="tier-badge"` element has `data-badge-size` set to a value other than `"20"`. | automated |

### Structure and rendering

| ID | Criterion | Testable |
|----|-----------|---------|
| AC-06 | The card renders without error for all three cases: fallback (no attacker roles), single attacker role, dual attacker roles. | automated |
| AC-07 | `pve-roles-section` is present in all three cases above. | automated |
| AC-08 | All role blocks retain `data-role`, `data-role-type` (attacker only), and `data-tier` attributes unchanged. | automated |
| AC-09 | Move items retain `data-move-name`, `data-move-type`, `data-is-elite`, and `data-is-recommended` attributes unchanged. | automated |

### No-regression

| ID | Criterion | Testable |
|----|-----------|---------|
| AC-10 | Quick moves group (`data-testid="quick-moves-group"`) and charged moves group (`data-testid="charged-moves-group"`) remain present when moves exist. | automated |
| AC-11 | Evolution chips (`evolves-from-section`, `evolves-to-section`) remain present when evolution data exists. | automated |
| AC-12 | Stat bars (`data-testid="stat-bar-atk"`, `data-testid="stat-bar-def"`, `data-testid="stat-bar-sta"`) retain their `data-stat-value` and `data-stat-pct` attributes. | automated |

---

## 5. Test Plan

### Existing tests

All existing tests in `tests/components/pokemon-card.test.tsx` must continue to pass without
modification. The spacing changes do not alter element identity, structure, or semantic data
attributes (except adding new ones per §3.1–§3.2).

### New tests for spec 0022

Add `describe('PokemonCard – legibility and spacing (spec 0022)')` in
`tests/components/pokemon-card.test.tsx` covering AC-01 through AC-12 using the existing
fixture pattern (`DUAL_ROLES`, `SINGLE_ROLE`, `TYRANITAR_QUICK`, `TYRANITAR_CHARGED`).

If these constants are currently defined inside the spec 0020 `describe` block, hoist them
to module scope (above all `describe` calls) so they are accessible to both the spec 0020
and spec 0022 describe blocks. Do not duplicate the definitions.

No live dataset tests are required. The data attributes are structural, not data-dependent.

---

## 6. Spec update requirements

No prior spec requires update. The changes in this spec are additive (new data attributes) or
visual-only (sizing values within existing elements).
