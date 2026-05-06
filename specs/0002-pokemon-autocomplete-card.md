# Spec 0002 – Pokémon Autocomplete: Search and Card Display

**Status:** Active  
**Iteration:** 2  
**Author:** Architect agent  
**Date:** 2026-05-06

---

## 1. Goal

Enhance the existing static landing page with a mobile-first autocomplete input that allows users to search for a Pokémon by English name. When a name is selected, a card displaying that name is shown below the input. All data is sourced from the existing build-time dataset. The application remains fully static with no runtime network requests.

---

## 2. Context / Background

Iteration 1 established a static Next.js application that displays the total Pokémon count sourced from a build-time JSON dataset. The data is already available in the build artefacts. This iteration introduces minimal interactivity — a search-and-display flow — as a UX enhancement on top of that foundation. No new data sources, backend components, or cost-bearing infrastructure are introduced.

---

## 3. Functional Behavior

### 3.1 Autocomplete input

- The landing page displays an autocomplete input field at the top of its main content area.
- The input lists Pokémon names in English only, drawn from the existing build-time dataset.
- As the user types, the input filters and suggests matching Pokémon names.
- The user can select one Pokémon name from the suggestions.
- Only one name can be selected at a time.
- All filtering and matching occurs client-side using data embedded in the page or bundle at build time. No network request is made when the user interacts with the input.

### 3.2 Pokémon card

- When a Pokémon name is selected, a card appears below the autocomplete input.
- The card displays the selected Pokémon's name.
- The card displays no other Pokémon data (no images, stats, types, or descriptions).
- If no Pokémon is selected, no card is shown.
- If the user clears the input or selects a different Pokémon, the card updates to reflect the current selection.

### 3.3 Layout and styling

- The layout is mobile-first: the primary design target is a small-screen viewport.
- All UI components are from the Material UI (MUI) component library.
- Default MUI styling is used. No custom themes, colour overrides, or custom CSS are applied.
- No animations are introduced beyond those provided by MUI components by default.

### 3.4 Data sourcing

- Pokémon names presented in the autocomplete are derived solely from the dataset produced by the existing build-time data ingestion script (Spec 0001, section 3.1).
- No additional API calls, data files, or data sources are introduced.
- The dataset is consumed at build time and embedded in the application output.

---

## 4. Constraints

- **Static-only.** The application remains a fully static export. No API routes, server components that fetch at request time, middleware, or backend services are introduced.
- **No runtime network requests.** The browser must not make any outbound requests for Pokémon data. All data required by the autocomplete and card must be present in the static build output.
- **No new data sources.** Pokémon names are sourced exclusively from the existing build-time dataset. No additional external API or file is introduced.
- **MUI only.** All UI components must come from the Material UI library. No other component libraries are introduced.
- **No custom styling.** No custom themes, CSS overrides, or inline styles beyond MUI defaults are applied.
- **English names only.** The autocomplete presents only English Pokémon names.
- **In-memory state only.** The selected Pokémon name is held in component state. It is not persisted to local storage, session storage, URL parameters, or any other mechanism.
- **No new infrastructure or cost.** The deployment pipeline, hosting, and data sources remain unchanged from Iteration 1.

---

## 5. Non-Goals

- Displaying Pokémon images, types, stats, or any data beyond the name.
- Multi-select or comparison of multiple Pokémon.
- Search history, favourites, or any persistent user preferences.
- Keyboard shortcut navigation beyond what MUI provides by default.
- Accessibility enhancements beyond what MUI provides by default.
- Custom animations, transitions, or visual effects.
- Dark mode or theme switching.
- Pokémon names in any language other than English.
- Pagination or virtualisation of the autocomplete list.
- Fuzzy matching or phonetic search; matching behaviour is as provided by MUI.
- Any changes to the build-time data ingestion script or the underlying dataset.
- Any changes to the GitHub Actions deployment workflow.
- Any feature not explicitly stated in section 3.

---

## 6. Acceptance Criteria

The following criteria must all pass before this iteration is considered complete. Each criterion is independently verifiable.

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-01 | The landing page contains an autocomplete input field at the top of the main content area. | Load the page; confirm the input is visible above all other content. |
| AC-02 | The autocomplete input presents only English Pokémon names from the existing build-time dataset. | Inspect the page source or bundle; confirm names match those in the build-time JSON. |
| AC-03 | Typing a partial name filters the autocomplete suggestions to names containing that string. | Type a partial name; confirm only matching names appear in the dropdown. |
| AC-04 | Selecting a Pokémon name from the autocomplete displays a card below the input showing that name. | Select a name; confirm a card appears with the correct name and no other content. |
| AC-05 | No card is shown when no Pokémon is selected. | Load the page without selecting a name; confirm no card is visible. |
| AC-06 | Selecting a different Pokémon updates the card to show the newly selected name. | Select one name, then select a different name; confirm the card reflects the second selection. |
| AC-07 | The page makes no outbound network requests to any external host when the user interacts with the autocomplete or card. | Open browser DevTools Network tab; interact with the autocomplete and card; confirm zero requests to any external host. |
| AC-08 | All UI components on the page are from the Material UI library. No custom themes or custom CSS are applied. | Inspect rendered markup and styles; confirm MUI component classes and default theme only. |
| AC-09 | The layout is functional and legible on a 375 px wide viewport (mobile baseline). | Open the page in a browser at 375 px width; confirm the input and card are usable without horizontal scrolling. |
| AC-10 | Running `next build` (after the existing data-fetch script) produces a static export with no server-dependent artefacts. | Run `next build`; confirm `out/` contains only static files and no API or server routes. |

---

## 7. Risks

- **Autocomplete performance on large datasets.** The Pokémon dataset may be large enough to cause perceptible lag when filtering client-side. If this occurs, the implementation should defer optimisation to a future iteration rather than introducing architectural complexity. This risk is accepted for Iteration 2.
- **MUI bundle size.** Adding MUI increases the JavaScript bundle delivered to the client. This is accepted given the static hosting model; no additional cost is incurred.

---

## 8. Future Considerations

The following are explicitly deferred and must not influence the implementation of this iteration:

- Displaying Pokémon images, types, evolutions, or any detail beyond the name.
- Persistent state (URL parameters, local storage, favourites).
- Accessibility enhancements beyond MUI defaults.
- Custom theming or branded visual design.
- Scheduled or triggered data refreshes.
- Server-side filtering or search.
