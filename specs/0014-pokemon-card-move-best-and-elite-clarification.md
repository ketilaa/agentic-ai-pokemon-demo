# Spec 0014 – Pokémon Card Move Best and Elite Clarification

**Status:** Draft  
**Iteration:** 14  
**Author:** Architect agent  
**Date:** 2026-05-13

---

## 1. Goal

Extend the move list introduced in Iteration 13 with two layered signals: a subtle visual emphasis identifying at most one recommended Quick move and one recommended Charged move per Pokémon, and an italic-only convention marking Elite moves as rare. Players should understand what is special and what is good without being told why.

---

## 2. Context / Background

Iteration 13 established named move lists with type color as a supporting signal. Elite moves were introduced as a concept — visually distinguished from regular moves — but the form of that distinction was deliberately left unspecified. The spec required only that it be subtle, non-numeric, and non-explanatory.

Two gaps remain that reduce practical value:

**Best moves.** A player who sees ten moves on the card cannot immediately identify which one to prioritize. Pokémon GO has an established intuition that certain quick moves generate energy efficiently and certain charged moves deal the most damage. Communicating this — without numbers, explanations, or labels — helps players act on the information without requiring external research.

**Elite move form.** The Iteration 13 spec permitted the developer to choose any subtle visual cue for elite status. Italic text is the typographic convention for denoting rarity or distinction — it is legible, universally understood, and requires no iconography. Locking this choice to italic-only removes ambiguity, prevents implementation drift, and keeps the visual vocabulary lean.

This iteration amends the elite distinction from "any subtle visual cue" to "italic move name only", and introduces a recommended move signal. Both changes build on the existing move section structure and data; no new data sources or infrastructure are required.

---

## 3. Functional Behavior

### 3.1 Recommended Quick move

- At most one quick move per Pokémon is designated as recommended.
- The recommended quick move is the move with the strongest energy-generation attribute among the Pokémon's quick move pool, as determined from the existing build-time move dataset.
- When the quick move pool contains exactly one move, that move is recommended.
- When the quick move pool is empty, no quick move is recommended.
- When multiple moves are tied on the energy-generation attribute, the developer must apply a stable tiebreaker (such as alphabetical order by move name) so that recommendation is deterministic across builds.
- The recommended status of a move is a property of the build-time dataset, not of player state. All players see the same recommendation for a given Pokémon.

### 3.2 Recommended Charged move

- At most one charged move per Pokémon is designated as recommended.
- The recommended charged move is the move with the highest base power attribute among the Pokémon's charged move pool, as determined from the existing build-time move dataset.
- When the charged move pool contains exactly one move, that move is recommended.
- When the charged move pool is empty, no charged move is recommended.
- When multiple moves are tied on the base power attribute, the developer must apply a stable tiebreaker (such as alphabetical order by move name).
- Elite status does not affect recommendation eligibility. A move may be recommended regardless of whether it is Elite.

### 3.3 Recommended move visual emphasis

- The recommended move item within each group is visually emphasized relative to the non-recommended items in the same group.
- The emphasis must be achieved through visual properties of the move name text — such as increased weight, increased contrast, or a subtle outline — and must not include any label, badge, icon, tooltip, or explanatory text.
- The emphasis must be visually stronger than the type color signal (i.e. a player scanning the list should notice the emphasis before noticing the type color of any individual item).
- The emphasis must be visually weaker than the card header type treatment (i.e. no single move should dominate the card).
- A recommended move item carries `data-is-recommended="true"`. All other move items carry `data-is-recommended="false"`.
- Emphasis is applied within each group independently: the recommended Quick move and the recommended Charged move each receive the emphasis, and no other items in their respective groups do.

### 3.4 Elite move indication

- A move that originates from an elite collection (`eliteQuickMoves` or `eliteCinematicMoves`) is indicated by rendering the move name in italic style.
- Italic rendering is the sole visual indicator of Elite status. No icon, badge, marker, border, background, tooltip, or legend may be used to communicate Elite status.
- No inline label, heading, or legend accompanies or reinforces the italic indicator.
- Elite status is visually subordinate to the recommended emphasis. When scanning the list, the recommended emphasis should be more immediately noticeable than the italic distinction.
- Each elite move item carries `data-is-elite="true"`. Non-elite move items carry `data-is-elite="false"`. These data attributes are unchanged from Iteration 13.

### 3.5 Combined signals — Elite and Recommended

- A move may be Elite but not recommended: its name appears in italic, without the recommended emphasis. This is the common case for legacy Elite TM moves.
- A move may be recommended but not Elite: its name receives the recommended emphasis, without italic. This is the common case for current-era moves.
- A move may be both Elite and recommended: its name appears in italic and receives the recommended emphasis. Both signals coexist visually. Neither signal may obscure or overpower the move name itself.
- A move may be neither Elite nor recommended: it receives no special visual treatment beyond type color.
- No combination of signals may cause a move name to become illegible or visually dominant over the card header.

### 3.6 Visual hierarchy

The four visual layers in the move section, ordered from highest to lowest prominence:

1. **Move names** — the primary readable element; always legible and unobscured.
2. **Recommended emphasis** — directs attention within each group to the strategically strongest option.
3. **Type color** — a supporting orientation cue applicable to all moves.
4. **Elite italics** — provides rarity context; least prominent of the four layers.

No signal in a lower layer may visually outrank a signal in a higher layer.

### 3.7 Preserved behaviors from Iteration 13

All functional behavior specified in Spec 0013 remains unchanged:

- Move data sourcing from `quickMoves`, `eliteQuickMoves`, `cinematicMoves`, `eliteCinematicMoves` (§3.1).
- Deduplication: a move in both regular and elite collections appears once with `data-is-elite="true"` (§3.1).
- Omission of unresolvable move identifiers with a build-time warning (§3.1).
- Quick moves group: union of regular and elite quick moves, one item per unique move (§3.2).
- Charged moves group: union of regular and elite charged moves, one item per unique move (§3.3).
- Move item data attributes: `data-move-name`, `data-move-type`, `data-is-elite` (§3.4).
- Type color derived from `TYPE_COLORS` registry; no type label on move items (§3.4).
- No numeric move statistics anywhere in the move section (§3.4).
- Group labels: "Quick moves" and "Charged moves", present only when the corresponding group is present (§3.6).
- Move section placement inside `card-content-section`, below stat bars (§3.7).
- Absence of `move-type-section` element (§3.7, Iteration 12 retirement).
- All structural behaviors from Iterations 5–11 (§3.8).

---

## 4. Constraints

- **No new data sources.** Recommendation determination uses only existing build-time move attributes (energy generation, base power). No additional APIs, files, or external resources are introduced.
- **No displayed statistics.** The energy-generation and base power values used internally for recommendation must not appear in the rendered output. The recommendation signal is visual, not numeric.
- **Italic-only Elite indicator.** No element, class, attribute, icon, or badge — other than italic styling of the move name — may communicate Elite status to the player.
- **No explanatory text.** No label, legend, note, or tooltip may explain what the emphasis or italic means. The signals communicate meaning through their visual character alone.
- **Static-only.** The application remains a fully static Next.js export. No API routes, server-side rendering at request time, or middleware is introduced.
- **Type colors from registry only.** No type color may be hardcoded outside the `TYPE_COLORS` registry.
- **Compact on mobile.** The move section must remain scannable at 375 px viewport width. Combined emphasis and italic styling must not cause horizontal overflow.
- **Content neutrality preserved.** No type-derived background color may be introduced into `card-content-section`.
- **No interaction.** Move items remain non-interactive. Recommended and Elite signals must be visible without interaction.
- **No icons or badges.** No icons, sprites, or graphical symbols are introduced for recommended or Elite status.

---

## 5. Non-Goals

- Displaying move statistics (damage, energy, cooldown, DPS, EPS, TDO, or any derived value).
- Explaining why a move is recommended.
- Explaining what Elite means or how Elite status is obtained.
- Distinguishing PvP recommended moves from PvE recommended moves.
- Recommending more than one move per group.
- Player-specific current moveset or move selection.
- Highlighting moves by type effectiveness or STAB.
- Animated or interactive move emphasis.
- Legends, tooltips, or on-card explanatory notes for either signal.
- Changes to the evolution chain, stat bars, card image, or card header.
- Changes to URL behavior, selection state, or search behavior.
- Accessibility improvements to color-only or style-only signals.
- Any feature not explicitly stated in section 3.

---

## 6. Acceptance Criteria

### Recommended move — data attributes

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-01 | Each move item in `quick-moves-group` carries `data-is-recommended="true"` or `data-is-recommended="false"`. | Render a Pokémon with at least one quick move; confirm every `move-item` inside `quick-moves-group` has a `data-is-recommended` attribute with value `"true"` or `"false"`. |
| AC-02 | Exactly one move item in `quick-moves-group` carries `data-is-recommended="true"` when the quick move pool is non-empty. | Render a Pokémon with multiple quick moves; confirm exactly one `move-item` inside `quick-moves-group` has `data-is-recommended="true"`. |
| AC-03 | When `quick-moves-group` is absent (Pokémon has no quick moves), no move item with `data-is-recommended="true"` is present inside `move-section`. | Render a Pokémon with an empty quick move pool; confirm no element with `data-is-recommended="true"` is present inside `move-section` in the quick moves position. |
| AC-04 | Each move item in `charged-moves-group` carries `data-is-recommended="true"` or `data-is-recommended="false"`. | Render a Pokémon with at least one charged move; confirm every `move-item` inside `charged-moves-group` has a `data-is-recommended` attribute. |
| AC-05 | Exactly one move item in `charged-moves-group` carries `data-is-recommended="true"` when the charged move pool is non-empty. | Render a Pokémon with multiple charged moves; confirm exactly one `move-item` inside `charged-moves-group` has `data-is-recommended="true"`. |
| AC-06 | When `charged-moves-group` is absent, no move item with `data-is-recommended="true"` is present in the charged position. | Render a Pokémon with an empty charged move pool; confirm no element with `data-is-recommended="true"` is present inside `move-section` in the charged moves position. |

### Recommended move — visual emphasis

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-07 | The move item with `data-is-recommended="true"` inside `quick-moves-group` is visually distinct from non-recommended items in the same group. | Render a Pokémon with multiple quick moves; confirm the recommended item is visually distinguishable without interaction. (Manual QA) |
| AC-08 | The move item with `data-is-recommended="true"` inside `charged-moves-group` is visually distinct from non-recommended items in the same group. | Render a Pokémon with multiple charged moves; confirm the recommended item is visually distinguishable without interaction. (Manual QA) |
| AC-09 | The recommended emphasis contains no label, badge, icon, or explanatory text. | Inspect the DOM subtree of any `data-is-recommended="true"` item; confirm no text content other than the move name is present, and no child element carrying an aria-label or title for the emphasis exists. |
| AC-10 | The recommended emphasis is visually more prominent than the type color signal but less prominent than the card header type treatment. | Render a Pokémon; compare the visual weight of the recommended move name against the type color of any non-recommended move and against the card header. Confirm the hierarchy: header > recommended emphasis > type color. (Manual QA) |

### Elite indication — italic only

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-11 | A move item with `data-is-elite="true"` renders its move name in italic style. | Render a Pokémon known to have an Elite move; confirm the move name text inside that `move-item` has italic styling applied. |
| AC-12 | A move item with `data-is-elite="false"` does not render its move name in italic style. | Render a Pokémon; confirm that `move-item` elements with `data-is-elite="false"` do not have italic styling on the move name text. |
| AC-13 | No icon, badge, border, background, or additional element other than italic styling appears on any Elite move item to communicate Elite status. | Inspect the DOM subtree of each `data-is-elite="true"` item; confirm no child element representing an icon, badge, or decorative indicator is present. |
| AC-14 | No legend, label, or tooltip appears anywhere in the card to explain the italic indicator. | Render a Pokémon with Elite moves; confirm no element with text content explaining Elite status is present in the DOM. |

### Combined signals

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-15 | A move that is both Elite and recommended carries `data-is-elite="true"` and `data-is-recommended="true"`. | If a Pokémon's dataset contains a move that qualifies as both (top energy-generator or highest-power and Elite), confirm both attributes are set to `"true"` on the same `move-item`. |
| AC-16 | A move that is both Elite and recommended renders its name in italic with the recommended emphasis applied; neither signal obscures the move name. | Render such a Pokémon; confirm the move name is legible, italicized, and visually emphasized. (Manual QA) |
| AC-17 | The Elite italic signal is less visually prominent than the recommended emphasis signal. | Render a Pokémon with an Elite non-recommended move and a non-Elite recommended move; confirm the recommended move draws the eye before the Elite move. (Manual QA) |

### Preserved Iteration 13 behaviors

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-18 | All Iteration 13 acceptance criteria (AC-01 through AC-30 from Spec 0013) continue to pass. | Run the full test suite and manual QA checklist from Spec 0013; confirm no regressions. |

### Text and mechanics prohibition

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-19 | No numeric move statistic (damage, energy, cooldown, duration, or derived value) appears inside `move-section`. | Inspect all text nodes inside `move-section`; confirm none contain numeric content corresponding to a move statistic. |
| AC-20 | No text explaining the recommended emphasis or the Elite italic appears anywhere on the card. | Search all rendered text nodes on the card; confirm no substring matches phrases such as "best", "recommended", "Elite", "Elite TM", "energy", "damage", or equivalent explanatory language. |

### Visual hierarchy (Manual QA)

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-21 | Move names remain the dominant readable element in the move section; no signal in a lower hierarchy layer outranks the move names. | Render a Pokémon with multiple Elite moves, recommended moves, and varied types; confirm move names are the primary text focus. (Manual QA) |
| AC-22 | The move section does not overflow the card at 375 px viewport width, including with italic and emphasis styling applied. | Render a Pokémon with a large move pool at 375 px; confirm no horizontal overflow and all move names remain readable. (Manual QA) |

### Build and static export

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-23 | Running `next build` produces a static export with no server-dependent artefacts. | Run `next build`; confirm `out/` contains only static files. |

---

## 7. Risks

- **Move attribute availability for recommendation.** Determining the recommended quick move requires an energy-generation attribute per move, and the recommended charged move requires a base power attribute. The developer must verify that these attributes are present in the existing build-time move dataset. If either attribute is absent for any move, a fallback strategy (such as treating absent values as zero, or falling back to alphabetical order) must be defined and applied consistently.

- **Energy-generation semantics.** Quick move energy generation may be represented as a net energy delta per use rather than per second. The spec does not prescribe the exact attribute name — the developer must identify the correct attribute and document the interpretation. If the attribute behaves unexpectedly for a subset of moves (e.g. moves that drain energy rather than generate it), the developer must raise a spec revision before building.

- **Recommendation stability across dataset versions.** If the dataset changes between builds (e.g. a move's power value is corrected), the recommended move for a Pokémon may change. This is expected and acceptable — the card reflects the current dataset. No caching or pinning of recommendation state is required.

- **Elite italic legibility in combination.** Italic styling combined with recommended emphasis (e.g. bold italic) must remain legible at small text sizes and on all background color themes used by the card. The developer should verify legibility for at least one dark-primary and one light-primary Pokémon type.

- **Italic styling on non-Latin move names.** If any move name in the dataset contains non-Latin characters or ligatures, italic rendering may differ visually from the Latin case. The developer should verify that italic is applied consistently and legibly across the full move name set.

- **Tiebreaker determinism.** If two moves have equal energy-generation or base power values, the tiebreaker must produce the same result across all builds and environments. The developer must use a stable sort on a consistent attribute (e.g. move identifier string or resolved move name) and document the tiebreaker used.

- **Single-move pools.** When a Pokémon has only one quick move or one charged move, that move is trivially recommended. The emphasis styling must still be applied in this case — absence of other moves does not make the recommendation meaningless.

---

## 8. Future Considerations

The following are explicitly deferred and must not influence this iteration:

- Displaying the energy or power values used to determine recommendation.
- PvP versus PvE recommendation distinctions (e.g. Great League vs. Master League rankings).
- STAB-adjusted recommendation (recommending a move that is super-effective against this Pokémon's own type coverage).
- Explanation of why a move is recommended or what Elite means.
- Player-specific current moveset vs. full possible move pool.
- Toggling or filtering moves by recommendation or Elite status.
- Accessibility improvements to style-only signals (italic, emphasis).
- Animated transitions when emphasis is applied.
- Changes to URL behavior, selection state, or search behavior.
- Dark mode or system-level theme adaptation.
