# Spec 0007 – Pokémon Evolution Chain and Shareable URLs

**Status:** Complete  
**Iteration:** 7  
**Author:** Architect agent  
**Date:** 2026-05-12

---

## 1. Goal

Expose each Pokémon's position in its evolution chain — what it evolves from and what it evolves into — as interactive links on the card. Clicking an evolution link immediately selects that Pokémon. Additionally, reflect the selected Pokémon in the page URL as a query parameter so that the page state can be bookmarked and shared; loading the URL with that parameter restores the selection.

---

## 2. Context / Background

The card introduced in earlier iterations shows name, type, and stat profile for a single selected Pokémon but provides no relationship context. A user cannot tell whether a Pokémon is a base form, a mid-stage, or a final evolution, and cannot navigate the chain without returning to the autocomplete. Separately, selection state is held only in React state, making it impossible to link someone directly to a specific Pokémon's card. This iteration addresses both gaps without introducing any runtime dependencies.

The raw dataset fetched by `scripts/fetch-pokemon.ts` contains an `evolutions` array on each entry. Each element carries an `id` field (uppercase identifier, e.g. `"IVYSAUR"`) that maps to the `id` field on another entry in the same dataset. There is no explicit reverse-pointer field; `evolvesFrom` must be derived at build time by inverting the forward evolution map. Evolution data is already present in the existing `public/data/pokemon.json` file; no re-fetch or new data file is required.

---

## 3. Functional Behavior

### 3.1 Build-time evolution chain derivation

- At build time, a reverse evolution map is constructed from the raw dataset: for every entry whose `evolutions` array is non-empty, each target `id` in that array is mapped to the English name of the source entry.
- A Pokémon's `evolvesFrom` is derived by de-duplicating all source English names that list it as an evolution target, then taking the single resulting name, or `null` if none exists. The raw dataset contains Pokémon with multiple form entries that share the same English name and list the same target (e.g. two form variants of Dunsparce both list Dudunsparce); after de-duplication by English name these always resolve to one unique name. If de-duplication were ever to yield more than one distinct English name — which does not occur in the current dataset — the behavior is implementation-defined.
- A Pokémon's `evolvesTo` is the list of English names for all entries that appear in its own `evolutions` array, in dataset order (the order the elements appear in the source `evolutions` array). The list may contain zero, one, or multiple entries (e.g. Eevee has eight evolution targets).
- Resolution from raw `id` to English name uses the same `names.English` extraction already present in `parsePokemonData`.
- If a target `id` cannot be resolved to any entry in the dataset (e.g. the target is absent from the dataset), that target is silently omitted; it does not cause a build error.
- The derived evolution data is embedded in `PokemonEntry` and available at runtime without any network request.

### 3.2 Evolution chain display on the card

- When a Pokémon has a non-null `evolvesFrom`, the card displays a labeled section showing the name of the predecessor as an interactive element.
- When a Pokémon has one or more entries in `evolvesTo`, the card displays a labeled section showing each successor name as an interactive element.
- When `evolvesFrom` is `null` and `evolvesTo` is empty, no evolution section is shown.
- Each interactive element is a clickable chip or link (MUI component). Clicking it selects the corresponding Pokémon exactly as if the user had searched for and selected it via the autocomplete.
- The evolution section is placed within the content section of the card (below the type-colored title section), visually separated from the stat profile. Whether the evolution section appears above or below the stat profile within the content section is implementation-defined.
- The evolution section must not visually compete with the Pokémon name or the type color treatment.
- Labels distinguish the two directions (predecessor vs. successors) clearly; the exact label text is left to the implementation, provided the distinction is unambiguous.

### 3.3 URL-based selection state

- The selected Pokémon name is reflected in the page URL as the query parameter `pokemon` (e.g. `?pokemon=Bulbasaur`).
- When the user selects a Pokémon — whether through the autocomplete or by clicking an evolution link — the URL is updated to `?pokemon=<selected-name>` using a history replace (not a push), so the browser back button is not polluted.
- When the page loads with a `?pokemon=<name>` query parameter and that name matches an entry in the catalog, the corresponding Pokémon is immediately selected and its card is shown.
- If the `?pokemon=` value does not match any entry in the catalog, no Pokémon is selected and the parameter is silently ignored.
- When no Pokémon is selected (including after an invalid `?pokemon=` value), the URL carries no `pokemon` parameter.
- The URL update must not cause a full page reload. It uses the Next.js client-side router.

### 3.4 Retained behaviors

- The two-section card layout (type-colored title section, content section) is preserved.
- The type surface treatment from Iteration 4 is unchanged.
- The stat profile from Iteration 6 (dataset-anchored bars) is unchanged and remains in the content section.
- The autocomplete search remains the primary navigation mechanism; the evolution links are supplementary.
- No card is shown when no Pokémon is selected.
- The full card is visible on a 375 px wide viewport without horizontal scrolling.

---

## 4. Constraints

- **Static-only.** The application remains a fully static Next.js export (`next build` outputs to `out/`). No server-side rendering at request time, no API routes, no middleware.
- **No runtime network requests.** Evolution data is derived at build time and embedded in the static output. The browser makes no outbound requests when a Pokémon is selected or when an evolution link is clicked.
- **No new data sources.** All evolution data is derived from the existing `public/data/pokemon.json` file. No additional API calls or data files are introduced.
- **No re-fetch required.** The existing dataset already contains the `evolutions` field; the fetch script is not modified.
- **MUI only.** All new UI components (evolution chips, links) must use MUI. No other component libraries are introduced.
- **Client-side router only.** URL updates use Next.js `useRouter` with `router.replace`; no server redirects.
- **Suspense boundary required.** Because `useSearchParams` requires a Suspense boundary in static exports, the component reading search params must be wrapped appropriately.
- **Mobile-first.** The primary design target is a 375 px wide viewport. Multi-target evolution lists (e.g. eight Eevee evolutions) must not overflow horizontally; they may wrap.
- **History replace, not push.** Selecting a Pokémon replaces the current history entry so the back button is not affected.
- **No persistence beyond URL.** No localStorage, cookies, or other storage mechanisms are introduced.
- **No new infrastructure or cost.** Deployment pipeline, hosting, and data sources remain unchanged.

---

## 5. Non-Goals

- Displaying the full evolution tree beyond immediate predecessors and successors (no grandparent/grandchild stages).
- Mega evolutions, Gigantamax forms, or regional variants.
- Evolution requirements (candy cost, items, quests).
- Named URL routes per Pokémon (e.g. `/pokemon/bulbasaur`); query parameters are sufficient.
- Canonical URL canonicalization or `<link rel="canonical">` tags.
- Browser history navigation (back/forward button behavior beyond preserving normal browser behavior).
- Animation on evolution link click.
- Dark mode or theme switching.
- Accessibility enhancements beyond what MUI provides by default.
- Any feature not explicitly stated in section 3.

---

## 6. Acceptance Criteria

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-01 | Each `PokemonEntry` in the catalog carries an `evolvesFrom` field (string or null) and an `evolvesTo` field (array of strings). | Inspect the TypeScript `PokemonEntry` interface; confirm both fields are present with the correct types. |
| AC-02 | A base-stage Pokémon (e.g. Bulbasaur) has `evolvesFrom: null` and `evolvesTo` containing exactly its direct evolution (e.g. `["Ivysaur"]`). | Select Bulbasaur; confirm `evolvesFrom` is null and `evolvesTo` is `["Ivysaur"]` in the application data. |
| AC-03 | A mid-stage Pokémon (e.g. Ivysaur) has `evolvesFrom` equal to its predecessor's name (e.g. `"Bulbasaur"`) and `evolvesTo` containing its successor (e.g. `["Venusaur"]`). | Select Ivysaur; confirm both fields reflect the correct chain. |
| AC-04 | A final-stage Pokémon with no further evolutions (e.g. Venusaur) has `evolvesFrom` set to its predecessor (e.g. `"Ivysaur"`) and `evolvesTo` as an empty array. | Select Venusaur; confirm `evolvesTo` is empty and `evolvesFrom` is `"Ivysaur"`. |
| AC-05 | A Pokémon with multiple evolution targets (e.g. Eevee) has `evolvesTo` containing all its direct successors. | Select Eevee; confirm `evolvesTo` lists all its Eeveelutions present in the dataset. |
| AC-06 | A standalone Pokémon with no evolution chain has `evolvesFrom: null` and `evolvesTo: []`. | Identify a Pokémon with no evolutions; select it; confirm `evolvesFrom` is null and `evolvesTo` is an empty array. |
| AC-07 | The card for a mid-stage Pokémon displays both a "previous evolution" section and a "next evolution" section. | Select Ivysaur; confirm the card shows Bulbasaur as predecessor and Venusaur as successor in two visually distinct sections. |
| AC-08 | The card for a base-stage Pokémon with evolutions displays only the "next evolution" section; no "previous evolution" section is shown. | Select Bulbasaur; confirm only the "evolves to" section appears on the card. |
| AC-09 | The card for a final-stage Pokémon displays only the "previous evolution" section; no "next evolution" section is shown. | Select Venusaur; confirm only the "evolves from" section appears on the card. |
| AC-10 | The card for a Pokémon with no evolution chain shows no evolution section at all. | Select a standalone Pokémon; confirm no evolution section appears on the card. |
| AC-11 | Clicking an evolution link selects the corresponding Pokémon and updates the card. | On Ivysaur's card, click the Bulbasaur evolution link; confirm the card now shows Bulbasaur. |
| AC-12 | Clicking an evolution link updates the URL to `?pokemon=<target-name>`. | After clicking a Venusaur evolution link from Ivysaur, confirm the URL becomes `?pokemon=Venusaur`. |
| AC-13 | The multi-target evolution list (e.g. Eevee's eight successors) wraps onto multiple lines rather than overflowing horizontally on a 375 px viewport. | Select Eevee at 375 px viewport width; confirm all eight evolution chips are rendered and wrap within the card width without any chip being clipped or cut off. |
| AC-14 | Selecting a Pokémon via the autocomplete updates the URL to `?pokemon=<selected-name>`. | Search for and select Charizard; confirm the URL becomes `?pokemon=Charizard`. |
| AC-15 | Loading the page with `?pokemon=Bulbasaur` immediately shows Bulbasaur's card without user interaction. | Navigate directly to the page URL with `?pokemon=Bulbasaur`; confirm Bulbasaur's card is rendered on arrival. |
| AC-16 | Loading the page with an unrecognized `?pokemon=` value shows no card, does not throw an error, and removes the invalid parameter from the URL. | Navigate to `?pokemon=UnknownXYZ`; confirm the page loads cleanly with no card shown and the URL no longer contains the `pokemon` parameter. |
| AC-17 | Selecting a new Pokémon from an existing selection replaces the URL rather than pushing a new history entry. | Select one Pokémon; then select a second; confirm the browser history has not grown by two entries (clicking back from the second selection goes beyond the first). |
| AC-18 | The stat profile bars from Iteration 6 remain visible and correctly scaled on the card when evolution data is also shown. | Select a Pokémon with a full evolution chain; confirm Attack, Defense, and Stamina bars are present and correctly proportioned alongside the evolution section. |
| AC-19 | The type-colored title section is unchanged. | Select Bulbasaur (Grass/Poison); confirm the title section background still reflects the type color treatment from Iteration 4. |
| AC-20 | The full card produces no horizontal scrollbar on a 375 px viewport when a multi-target evolution list is present. | Select Eevee at 375 px; open DevTools; confirm the document body and card container report no horizontal scroll width beyond the viewport. |
| AC-21 | Running `next build` produces a static export with no server-dependent artefacts. | Run `next build`; confirm `out/` contains only static files and no API or server routes. |
| AC-22 | The browser makes no outbound network requests when navigating the evolution chain. | Open DevTools Network tab; click multiple evolution links; confirm zero requests to any external host. |
| AC-23 | Clearing the autocomplete selection removes the `pokemon` parameter from the URL. | Select a Pokémon so `?pokemon=<name>` appears in the URL; clear the autocomplete input; confirm the URL no longer contains the `pokemon` parameter and no card is shown. |

---

## 7. Risks

- **`useSearchParams` and static export.** Next.js requires a `Suspense` boundary around any component that calls `useSearchParams` in a statically exported app. Missing this causes a build error or hydration warning. The implementation must include the boundary.
- **Eevee overflow.** Eevee has eight evolution targets. On a 375 px viewport, eight chips must wrap without causing layout issues. The implementation must account for this.
- **Case sensitivity in URL parameter.** Pokémon names are mixed-case (e.g. `"Mr. Mime"`). URL decoding must match the exact name in the catalog. The implementation must ensure the parameter value is compared against catalog names without unintended case transformation.
- **Special characters in names.** Some Pokémon names contain punctuation (e.g. `"Mr. Mime"`, `"Farfetch'd"`). URL encoding is handled automatically by the browser and `encodeURIComponent`; the implementation must not double-encode.
- **Dataset coverage gaps.** Some evolution targets in the raw API data may not be present as entries in the dataset (e.g. forms or regional variants excluded by the existing parser). These must be silently omitted without breaking the build or the display.
- **Duplicate form entries sharing an evolution target.** The raw dataset contains Pokémon represented by multiple form entries with the same English name (e.g. two Dunsparce form entries both listing Dudunsparce as a target). The reverse lookup must de-duplicate by English name before assigning `evolvesFrom` to avoid producing multiple identical chips or a miscount of predecessor entries.

---

## 8. Future Considerations

The following are explicitly deferred and must not influence the implementation of this iteration:

- Full evolution tree display (multiple stages simultaneously).
- Named routes per Pokémon (`/pokemon/[name]`) as an alternative to query parameters.
- Sharing metadata (Open Graph, Twitter cards) populated from the selected Pokémon.
- Mega or Gigantamax evolution display.
- Evolution condition display (candy, items, quests).
- Comparison mode for multiple Pokémon.
