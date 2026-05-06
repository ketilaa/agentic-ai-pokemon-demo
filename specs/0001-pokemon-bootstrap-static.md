# Spec 0001 – Pokémon Bootstrap: Static Next.js App on GitHub Pages

**Status:** Active  
**Iteration:** 1  
**Author:** Architect agent  
**Date:** 2026-05-06

---

## 1. Goal

Deliver a static Next.js application, hosted on GitHub Pages, whose landing page displays the total number of Pokémon available in Pokémon GO. All Pokémon data is fetched from an external API at build time. There is no server-side logic, no backend, and no runtime cost.

---

## 2. Context / Background

This is the first iteration of the agentic-ai-pokemon-demo project. The purpose is to establish the minimum viable static deployment pipeline and validate that the chosen data source is accessible, stable, and sufficient for subsequent iterations. The application must be fully functional from a CDN-hosted static file set.

---

## 3. Functional Behavior

### 3.1 Build-time data ingestion

- A build script fetches Pokémon data from `https://pokemon-go-api.github.io/pokemon-go-api/` at build time.
- The script must persist the fetched data as a local JSON file within the repository build artefacts (e.g. `public/data/pokemon.json` or equivalent), so the Next.js build can consume it without any network access.
- The script must derive the total count of distinct Pokémon entries from the fetched data.
- If the fetch fails, the build must fail. There is no fallback or stale-data path.

### 3.2 Landing page

- The application has a single page at the root path (`/`).
- The page displays the total number of Pokémon available, sourced from the data ingested at build time.
- The count is a plain integer label. No chart, table, or list of Pokémon is required.
- The page must be renderable as a static HTML file with no server-side rendering at request time.

### 3.3 Deployment

- The application is deployed to GitHub Pages on every push to `main`.
- Deployment is performed via a GitHub Actions workflow that:
  1. Runs the data-fetch script.
  2. Builds the Next.js app with static export (`output: 'export'`).
  3. Publishes the exported files to the `gh-pages` branch or GitHub Pages artifact.
- The deployed site must be accessible at the repository's GitHub Pages URL.

---

## 4. Constraints

- **No runtime data fetching.** The browser must not make any requests to `pokemon-go-api.github.io` or any other external data source.
- **No server-side rendering.** Next.js must be configured with `output: 'export'`. No API routes, server components that fetch at request time, or middleware are permitted.
- **No backend.** There is no database, cache layer, serverless function, or cloud service beyond GitHub Pages.
- **No authentication or user accounts.**
- **No paid infrastructure.** GitHub Pages and GitHub Actions free tier are the only runtime environments.
- **Data source is read-only at runtime.** The application never writes to or modifies the upstream API.
- **Single page.** The application has exactly one route in this iteration.

---

## 5. Non-Goals

- Displaying individual Pokémon details, names, or images.
- Filtering, searching, or sorting Pokémon.
- Pagination or infinite scroll.
- Responsive or mobile-optimised styling beyond basic readability.
- Dark mode or theme switching.
- Caching or incremental static regeneration (ISR).
- Internationalisation or localisation.
- Analytics or error tracking.
- Custom domain configuration.
- Any feature not explicitly stated in section 3.

---

## 6. Acceptance Criteria

The following criteria must all pass before this iteration is considered complete. Each criterion is independently verifiable.

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-01 | The repository contains a build script that fetches Pokémon data from the specified API and writes it to a local JSON file. | Run the script in isolation; confirm the JSON file is created and contains Pokémon entries. |
| AC-02 | The Next.js app is configured with `output: 'export'`. | Inspect `next.config.*`; confirm `output` is set to `'export'`. |
| AC-03 | Running `next build` (after the data script) produces a static export directory (`out/`) with no server-dependent artefacts. | Run `next build` locally; confirm `out/` contains only static files. |
| AC-04 | The landing page (`out/index.html`) contains the total Pokémon count as a visible integer. | Open `out/index.html` in a browser with no network access; confirm the count is visible. |
| AC-05 | The rendered page makes no outbound requests to any external API. | Serve `out/` locally; open browser DevTools Network tab; reload the page; confirm zero requests to `pokemon-go-api.github.io` or any non-local host. |
| AC-06 | If the data-fetch script is run when the API is unreachable (or returns a non-200 response), the script exits with a non-zero status code. | Mock or block the URL; run the script; confirm non-zero exit. |
| AC-07 | The GitHub Actions workflow runs on push to `main`, executes the data-fetch script, builds the app, and publishes to GitHub Pages without manual intervention. | Push a commit to `main`; confirm the workflow completes successfully and the site is updated. |
| AC-08 | The deployed GitHub Pages site is publicly accessible and displays the Pokémon count without requiring authentication. | Visit the GitHub Pages URL in an incognito browser window; confirm the count is visible. |

---

## 7. Risks

- **API availability.** `pokemon-go-api.github.io` is a community-maintained project. If it is removed or restructured, the build pipeline will break. This risk is accepted for iteration 1; mitigation is deferred.
- **GitHub Actions free tier limits.** If build frequency is high, free-tier minutes may be exhausted. This is not expected to be an issue given the scope of this iteration.

---

## 8. Future Considerations

The following are explicitly deferred and must not influence the implementation of this iteration:

- Displaying Pokémon lists, images, or details.
- Scheduled or automated data refresh (e.g. cron-triggered rebuilds).
- Custom domain or HTTPS configuration beyond GitHub Pages defaults.
- Progressive Web App (PWA) capabilities.
