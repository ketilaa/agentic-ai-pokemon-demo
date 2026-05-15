# Spec 0018 – Pokémon Card Role-Based PvE Tiers

**Status:** Complete  
**Iteration:** 18  
**Author:** Architect agent  
**Date:** 2026-05-15

---

## 1. Goal

Introduce per-role tier labels (S, A, B, C) for PvE attacker roles and the gym defender role, so that each Pokémon card communicates at a glance whether this Pokémon is a strong, viable, or marginal investment for each role — without exposing numeric stats, without ranking Pokémon against each other, and without implying a single "overall quality" judgement.

---

## 2. Context / Background

Iterations 14–17 built a move recommendation system that identifies which moves to use for each PvE role. Iteration 17 introduced multi-role awareness: a Pokémon can simultaneously be a Rock attacker and a Dark attacker, and both roles get independent move recommendations. The card now communicates *how* to use a Pokémon in each role but not *how strong* it is in that role relative to others.

Two practical questions a player asks are not yet answered by the card:

1. Is this Pokémon worth power-ups and rare candies for raids as a given type attacker?
2. Is this Pokémon worth placing in a gym for defense?

These questions have different answers:
- A Pokémon with high base Attack and viable STAB moves can be an outstanding raider but a poor gym defender (e.g. a fast-but-fragile glass cannon).
- A Pokémon with high Defense and Stamina can be a strong gym defender but a weak attacker (e.g. Blissey, Attack=129, Defense=169, Stamina=496).

A tier label communicates the answer compactly and honestly. It is relative to the dataset — S means outstanding among the Pokémon that play this role, not "objectively powerful" in an absolute sense. Different roles are tiered independently, so no single overall tier is implied.

---

## 3. Functional Behavior

### 3.1 Role Model

Two PvE role types are introduced:

**Attacker role**: Corresponds exactly to the viable PvE attacker roles defined in spec 0017 §3.1. A Pokémon has an attacker role for type T if and only if it has at least one quick move of type T and at least one charged move of type T and T is one of the Pokémon's own types (STAB ownership). Each attacker role is tiered independently of all other attacker roles for the same Pokémon and independently of all other Pokémon's roles.

**Defender role**: All Pokémon with valid base stats receive a defender tier. The defender role evaluates gym-holding power. It is a single role with a single tier per Pokémon — there is no per-type breakdown for defense.

### 3.2 Tier Labels

Four tiers are used in descending order of strength:

| Label | Meaning |
|-------|---------|
| S | Outstanding. Top-tier choice for this role in the current dataset. A player should prioritise investment in this Pokémon for this role. |
| A | Strong. Commonly recommended for this role. A solid investment, though the S-tier options are marginally better. |
| B | Viable. Functional for this role but outclassed by A and S Pokémon when the player has access to them. |
| C | Marginal. Technically possesses the role but is substantially weaker in it than the dataset average. |

Every Pokémon with a role receives exactly one tier label for that role. No Pokémon receives more than one tier per role. No "overall" or "combined" tier is computed or displayed.

### 3.3 Attacker Role Tier Determination

For each viable attacker role for type T in the dataset, all Pokémon sharing that role form the **type-T attacker pool**. The Pokémon is tiered relative to all members of that pool.

**Primary factor — base Attack**: Base Attack is the dominant determinant of raid DPS in Pokémon GO. Within the type-T attacker pool, a Pokémon with higher base Attack delivers more damage per second and is a stronger attacker. Base Attack is the primary sort key for tier assignment.

**Secondary factor — survivability adjustment (optional)**: A Pokémon that meets the fragility criterion from spec 0015 (low Defense + Stamina relative to the dataset mean) has reduced sustained raid effectiveness because it faints before firing as many charged moves as a more durable attacker with similar Attack. The developer may apply a survivability penalty to reduce a fragile Pokémon's effective standing in the type-T attacker pool. Applying the penalty is at the developer's discretion. The developer must document whether a survivability penalty is applied and, if so, how it is computed.

**Tier boundary approach**: Tier boundaries are relative to each type-T attacker pool. The developer must choose thresholds and document them. Thresholds must produce results consistent with community expectations for prominent Pokémon — for example:
- Rampardos (Rock, Attack=295) should achieve S tier as a Rock attacker.
- Tyranitar (Rock, Attack=251; Dark, Attack=251) should achieve S or A tier in both its Rock and Dark attacker roles.
- Machamp (Fighting, Attack=234) should achieve S or A tier as a Fighting attacker.

Thresholds must be deterministic and identical across all builds from the same dataset.

**Small-pool handling**: A type's attacker pool may contain very few Pokémon. When the pool is too small to distribute Pokémon meaningfully across all four tier labels, the developer must apply the following rule uniformly: a pool of 1 member receives only S; a pool of 2 members receives only S and A; a pool of 3 members receives only S, A, and B; a pool of 4 or more members receives all four tiers. The handling must be documented and applied consistently across all types.

### 3.4 Defender Role Tier Determination

All Pokémon with valid base stats receive a defender tier. The full dataset is the population.

**Primary factor — Defense + Stamina sum**: This composite reflects both damage mitigation (Defense) and staying power (Stamina) in gym encounters. Higher total indicates stronger gym-holding ability.

**Tier boundary approach**: Tier boundaries are relative to the full dataset. The developer must choose thresholds and document them. Thresholds must produce results consistent with community expectations — for example:
- Blissey (Defense=169, Stamina=496, sum=665) should achieve S tier.
- Chansey (Defense=128, Stamina=487, sum=615) should achieve S tier.
- Snorlax (Defense=169, Stamina=330, sum=499) should achieve S or A tier.
- Caterpie (Defense=55, Stamina=128, sum=183) and Rattata (Defense=70, Stamina=102, sum=172) should achieve C tier.

The developer must verify that the fragility boundary from spec 0015 — which defines Pokémon with low Defense + Stamina as unsuitable for sustained PvE — is consistent with C-tier classification. A Pokémon that is "fragile" per spec 0015 must not appear in B tier or above as a defender; its defender tier must be C.

Thresholds must be deterministic and identical across all builds from the same dataset.

### 3.5 Data Model

The following additions are made to the domain model:

```typescript
export type TierLabel = 'S' | 'A' | 'B' | 'C';

export interface AttackerRoleTier {
  readonly typeId: string;  // type identifier — matches a type in the Pokémon's viable attacker roles
  readonly tier: TierLabel;
}
```

`PokemonEntry` gains two new fields:

- `attackerRoles: readonly AttackerRoleTier[]` — one entry per viable attacker role (spec 0017 §3.1), ordered by the Pokémon's type order (primary type first). Empty array if the Pokémon has no viable attacker roles.
- `defenderTier: TierLabel` — always present for any Pokémon with valid stats.

`MoveEntry` is unchanged. `isRecommended` remains the only recommendation signal on moves. No tier information is added to `MoveEntry`.

`TierLabel` and `AttackerRoleTier` are exported from the domain module for use by components.

### 3.6 Visual Presentation

**Placement**: Role tier labels are displayed in a new section of the card. This section — referred to as the **role-tier section** — is placed below the stat bars and above the move section. It has no header or label.

**Attacker role tier items**: Each entry in `attackerRoles` is rendered as a compact badge-like item. The item uses the role type's color from `TYPE_COLORS` as its background or accent color, providing implicit role identification without text. The tier label (S, A, B, or C) is the sole text content of the item.

**Defender tier item**: The defender tier is rendered as a single item. Its visual treatment is distinct from attacker role items: it uses a neutral color (not drawn from `TYPE_COLORS`) so that it is not confused with a type-specific attacker tier. The tier label (S, A, B, or C) is the sole text content of the item.

**Visual weight**: The role-tier section is visually subordinate to the stat bars and type badges. Font size and spacing must not compete with core identity elements.

**No legend or explanatory text**: No text such as "Attacker", "Defender", "S = best", "tier", or any explanation of the tier system appears anywhere on the card as a result of this iteration.

**No overall tier**: The role-tier section displays only per-role items. No element communicates an overall quality score or ranking.

**Data attributes**: Each rendered tier item must carry the following data attributes for testing:
- Attacker role item: `data-role="attacker"`, `data-type-id="<typeId>"`, `data-tier="<S|A|B|C>"`
- Defender item: `data-role="defender"`, `data-tier="<S|A|B|C>"`

**Empty attacker roles**: When a Pokémon has no viable attacker roles (`attackerRoles` is empty), no attacker tier items are rendered. The defender tier item is always rendered.

### 3.7 Preserved Behaviors

All behavior from Iterations 13–17 is preserved without change. The role-tier section is a new addition to the card. No existing card element is modified.

---

## 4. Constraints

- **No new data sources.** All tier computation uses only the existing build-time dataset: base Attack, base Defense, base Stamina, Pokémon types, move types, move energy, move power. No additional APIs, files, or external resources are introduced.
- **No displayed statistics.** Attack, Defense, Stamina, move power, energy cost, or any derived numeric value must not appear in the rendered role-tier section.
- **Deterministic.** Given a fixed dataset, tier assignment must be identical across all builds and environments.
- **Build-time only.** All tier computation executes at parse or build time. No computation occurs in the browser.
- **Static-only.** The application remains a fully static Next.js export.
- **No new infrastructure.** Deployment pipeline, hosting, and data sources are unchanged.
- **No numeric thresholds in UI.** The exact numeric thresholds used for tier boundaries must not appear anywhere in the rendered output.
- **No PvP tiers.** This iteration applies only to PvE gym and raid context.

---

## 5. Non-Goals

- Global ranking or comparison of Pokémon to each other.
- A tier for "generalist" attacker roles: Pokémon with no viable STAB role of any type (spec 0017 fallback path) receive no attacker tier.
- Numeric tier scores or point values.
- PvP tiers for any format.
- Move tier ratings (e.g., "this is an S-tier move").
- Shadow Pokémon damage bonus consideration in attacker tiering.
- Weather boost consideration in attacker tiering.
- Mega Evolution or form-specific tiers.
- Explanatory tooltips, hover cards, or modals describing the tier system.
- Changes to the move section, recommendation logic, stat bar display, evolution chain, search behavior, or URL structure.
- Any feature not explicitly stated in section 3.

---

## 6. Acceptance Criteria

### Data model

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-01 | `PokemonEntry` exposes `attackerRoles: readonly AttackerRoleTier[]` and `defenderTier: TierLabel`. | Read a parsed `PokemonEntry`; confirm both fields are present. |
| AC-02 | `attackerRoles` contains one entry per viable attacker role (matching spec 0017 §3.1 viability conditions), each with a `typeId` matching one of the Pokémon's own types and a `tier` of `'S' | 'A' | 'B' | 'C'`. | Parse Tyranitar (Rock/Dark dual-role); confirm `attackerRoles` has exactly two entries, one with `typeId='Rock'` and one with `typeId='Dark'`. |
| AC-03 | A Pokémon with no viable attacker roles (spec 0017 fallback path) has an empty `attackerRoles` array. | Introduce a test fixture representing a Pokémon with no type-matching STAB moves in both slots simultaneously; confirm `attackerRoles.length === 0`. |
| AC-04 | `defenderTier` is always a member of `'S' | 'A' | 'B' | 'C'`. | Check `defenderTier` for a representative sample of at least ten Pokémon; confirm all values are valid tier labels. |
| AC-23 | `attackerRoles` is ordered by the Pokémon's type order: primary type first, secondary type second. | Parse Tyranitar (primary=Rock, secondary=Dark); confirm `attackerRoles[0].typeId === 'Rock'` and `attackerRoles[1].typeId === 'Dark'`. |

### Attacker tier — relative ranking

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-05 | Rampardos (Rock, Attack=295) achieves S tier as a Rock attacker. | Parse the full live dataset; find Rampardos; confirm `attackerRoles.find(r => r.typeId === 'Rock')?.tier === 'S'`. |
| AC-06 | Tyranitar achieves S or A tier in both its Rock and Dark attacker roles. | Parse the full live dataset; find Tyranitar; confirm `attackerRoles.find(r => r.typeId === 'Rock')?.tier` is `'S'` or `'A'`, and the same for `typeId === 'Dark'`. |
| AC-07 | A Pokémon with the same viable attacker role type but substantially lower base Attack than S-tier members achieves B or C tier in that role. | Identify a Pokémon in the live dataset that has a viable Rock attacker role and a base Attack substantially below Rampardos and Tyranitar. Confirm its Rock attacker tier is `'B'` or `'C'`. |
| AC-08 | A multi-role Pokémon can have different tiers for different attacker roles. | Identify a Pokémon in the live dataset with two viable attacker roles where the Pokémon's standing differs meaningfully between the two type pools. Confirm `attackerRoles[0].tier !== attackerRoles[1].tier` — or document why the specific live dataset does not provide such a case and introduce a test fixture. |

### Defender tier — relative ranking

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-09 | Blissey (Defense=169, Stamina=496, sum=665) achieves S tier as a defender. | Parse the full live dataset; find Blissey; confirm `defenderTier === 'S'`. |
| AC-10 | Chansey (Defense=128, Stamina=487, sum=615) achieves S tier as a defender. | Parse the full live dataset; confirm `defenderTier === 'S'` for Chansey. |
| AC-11 | Caterpie (Defense=55, Stamina=128, sum=183) achieves C tier as a defender. | Parse the full live dataset; confirm `defenderTier === 'C'` for Caterpie. |
| AC-12 | Every Pokémon classified as fragile by spec 0015 (Defense + Stamina at or below the fragility threshold) achieves C tier — never B, A, or S — as a defender. | For all Pokémon whose Defense + Stamina falls at or below the spec 0015 fragility threshold (0.65 × dataset mean), confirm `defenderTier === 'C'`. |

### No artificial extra roles

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-13 | No Pokémon receives an attacker tier for a type it does not own. | For all Pokémon in the live dataset, confirm every `AttackerRoleTier.typeId` in `attackerRoles` matches one of the Pokémon's own types (`primaryType.name` or `secondaryType?.name`). |
| AC-14 | No Pokémon receives more than one `AttackerRoleTier` with the same `typeId`. | For all Pokémon, confirm no duplicate `typeId` values within `attackerRoles`. |

### Visual — role-tier section

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-15 | For a Pokémon with two viable attacker roles, the rendered card contains two elements with `data-role="attacker"`, one with `data-type-id` matching each role type, and one element with `data-role="defender"`. | Render Tyranitar's card; confirm two `[data-role="attacker"]` elements and one `[data-role="defender"]` element are present. |
| AC-16 | Each attacker tier element carries `data-tier` equal to the `tier` from its `AttackerRoleTier`. The defender element carries `data-tier` equal to `defenderTier`. | For Tyranitar, confirm `[data-role="attacker"][data-type-id="Rock"]`'s `data-tier` matches `attackerRoles.find(r=>r.typeId==='Rock')?.tier`, and similarly for Dark and for defender. |
| AC-17 | A Pokémon with no viable attacker roles renders no `[data-role="attacker"]` elements. | Render a Pokémon confirmed to have an empty `attackerRoles` array; confirm zero `[data-role="attacker"]` elements are present. |
| AC-18 | No text matching the tier label S, A, B, or C appears in any context outside the role-tier section that was introduced by this iteration. | Inspect the rendered card for an S or A tier Pokémon; confirm the tier letter does not appear in any heading, stat label, move name, or other pre-existing element. |

### No text labels or statistics in UI

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-19 | No text such as "Attacker", "Defender", "tier", "S = best", or any explanatory label appears in the role-tier section. | Inspect all text nodes in the role-tier section for several Pokémon; confirm no such text is present. |
| AC-20 | No numeric stat value (Attack, Defense, Stamina, or any derived value) appears in the role-tier section. | Inspect all text nodes in the role-tier section; confirm no numeric values are present. |

### Regression and build

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-21 | All acceptance criteria from Iterations 13–17 continue to pass. | Run the full test suite; confirm no regressions. |
| AC-22 | Running `next build` produces a static export with no server-dependent artefacts. | Run `next build`; confirm `out/` contains only static files. |

---

## 7. Risks

- **Tier boundary calibration.** The developer must choose numeric thresholds for both attacker and defender tiers that produce results consistent with community expectations for prominent Pokémon. If the chosen thresholds produce counterintuitive results for well-known cases (e.g. Rampardos not S-tier as a Rock attacker, or Blissey not S-tier as a defender), the developer must raise a spec revision before shipping.

- **Small attacker pool types.** Some type-T attacker pools contain fewer than four Pokémon. Distributing four tier labels across three Pokémon is not meaningful. §3.3 prescribes the rule: 1 member → S only; 2 members → S and A; 3 members → S, A, and B; 4+ members → all four tiers. The developer must implement and document this rule exactly.

- **Defender tier / fragility threshold consistency.** Spec 0015 defines fragile Pokémon as those with Defense + Stamina at or below 65% of the dataset mean. AC-12 requires that fragile Pokémon achieve C tier — never B, A, or S — as defenders. The developer must verify this constraint holds across the live dataset before shipping. If the chosen defender tier thresholds would place any fragile Pokémon in B tier or above, the thresholds must be adjusted.

- **Attacker tier for Pokémon already in spec 0017 tests.** Several test fixtures in the existing test suite set exact Attack stat values (e.g. attack=251 for Tyranitar-like fixtures). These fixtures will receive computed attacker tiers based on dataset-relative thresholds. If a fixture's attack value places it in an unexpected tier given the fixture dataset, existing tests may need to assert specific tier values. The developer must audit all multi-role test fixtures for AC compliance.

- **New exports from domain module.** `TierLabel` and `AttackerRoleTier` are new exported types. The developer must ensure they are exported from `pokemon-catalog.ts` and that no component imports them before the domain module defines them, to avoid circular dependency or runtime undefined errors.

- **Visual regression from new section.** Adding the role-tier section above the move section may shift existing move section layout or stat bar layout. The developer must verify that stat bar rendering and move section rendering are unaffected by the new section's presence.

- **PokemonEntry interface extension.** Adding `attackerRoles` and `defenderTier` to `PokemonEntry` changes the interface. Any component or test that constructs a full `PokemonEntry` object will need to include the new fields. The developer must audit all test fixtures and component mocks that use `PokemonEntry` directly.

---

## 8. Future Considerations

The following are explicitly deferred and must not influence this iteration:

- Text labels identifying "Attacker" and "Defender" role categories.
- Explanatory tooltips or legend panels describing what S/A/B/C means.
- PvP tier ratings for any league format.
- Shadow Pokémon or Mega Evolution tier variants.
- Move-level tier ratings.
- Weather-boosted tier adjustments.
- Player-level filtering (e.g. show only S-tier attackers matching a raid boss type).
- Tier change indicators (e.g. showing that a Pokémon dropped from A to B after a balance update).
- Numeric stat overlays or "why is this S-tier" breakdowns.
- Accessibility improvements to color-only tier signals.
- Dark mode or system-level theme adaptation.
