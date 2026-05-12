# Spec 0009 – Pokémon Card Image and Scaffolding Removal

**Status:** Draft  
**Iteration:** 9  
**Author:** Architect agent  
**Date:** 2026-05-12

---

## 1. Goal

Remove the placeholder UI elements introduced in Iteration 1 that were never intended to persist — a page heading and a Pokémon count display — and add the Pokémon's image to the card using the URL already present in the existing static dataset. The image must integrate quietly into the card without displacing or obscuring existing content. Image URLs from the dataset must be validated against a fixed host whitelist before reaching the browser.

---

## 2. Context / Background

Iteration 1 introduced a heading ("Pokémon GO Pokédex") and a count display ("Total Pokémon available: 1024") as build-time scaffolding to verify that data ingestion was working. Subsequent iterations have not removed them; they remain on the page despite having no purpose in the current application.

The raw dataset fetched by `scripts/fetch-pokemon.ts` contains an `assets` object on each entry. The `assets.image` field is a URL to a PNG icon hosted on `raw.githubusercontent.com`. Of the 1024 entries currently in the dataset, 939 have a non-null `assets.image` value; 85 do not. All image URLs in the current dataset share a single host.

Because image URLs originate from an external dataset, they are an untrusted input. An URL pointing to a host other than the expected one must never reach the browser. The validation must occur at build time before the URL is embedded in the static output, and the permitted host must also be declared at the framework configuration level as a second line of defence.

---

## 3. Functional Behavior

### 3.1 Scaffolding removal

- The page must not display any heading containing the text "Pokémon GO Pokédex" or any derivative of it.
- The page must not display a count of available Pokémon in any form.
- The page `<title>` metadata must not be set to "Pokémon GO Pokédex". If no application-level title is defined for this iteration, the title may be absent or set to a neutral value.
- No other content or behavior is affected by this removal.

### 3.2 Image URL extraction at build time

- Each `PokemonEntry` in the catalog carries an `imageUrl` field of type `string | null`.
- At build time, `imageUrl` is derived from the `assets.image` field of the raw dataset entry.
- Before the URL is stored, its hostname is validated against the permitted host (`raw.githubusercontent.com`). If the hostname does not match, `imageUrl` is set to `null` for that entry.
- If `assets.image` is absent, not a string, or not a valid URL, `imageUrl` is `null`.
- The validated URL is embedded in the static catalog and available to the card at render time without any runtime data request.

### 3.3 Pokémon image on the card

- When `imageUrl` is non-null, the card displays the Pokémon image.
- The image is rendered at a consistent, visually appropriate size. It must not overflow the card boundary or cause horizontal scrolling on a 375 px viewport.
- The image must not displace, overlap, or reduce the legibility of any other card element: the Pokémon name, stat profile bars, and evolution chain navigation must all remain fully visible and correctly positioned when an image is present.
- The image is decorative. It must not be presented as an interactive element (no click target, no link).

### 3.4 Missing image handling

- When `imageUrl` is null, the card renders without an image.
- No placeholder, broken-image indicator, loading spinner, or empty reserved space is shown in place of the absent image.
- The card layout when `imageUrl` is null must be functionally equivalent to the no-image state from prior iterations — no gap or visual irregularity is introduced.

### 3.5 URL host security

- The permitted image host (`raw.githubusercontent.com`) must be explicitly declared in the application's framework-level configuration for external image sources. No other external image host is permitted in that configuration.
- Build-time validation (section 3.2) and framework-level configuration together form a two-layer defence: a URL from a disallowed host is never embedded in the static output, and the framework rejects any attempt to load from an undeclared host even if a URL were to reach the render layer.

### 3.6 Preserved card content and behaviors

- All elements from prior iterations remain: Pokémon name, type-themed border, background tint, stat profile bars, and evolution chain navigation.
- URL-based selection state, evolution link navigation, and all other behaviors from Iteration 7 are unchanged.
- The type visual language from Iteration 8 is unchanged.

---

## 4. Constraints

- **Static-only.** The application remains a fully static Next.js export. No API routes, server-side rendering at request time, or middleware is introduced.
- **No new data sources.** Image URLs are derived exclusively from the existing `assets.image` field already present in `public/data/pokemon.json`. No additional fetch script changes or external APIs are introduced.
- **No re-fetch required.** The existing dataset already contains `assets.image`; the fetch script is not modified.
- **Build-time host validation.** Any image URL whose hostname is not `raw.githubusercontent.com` must be excluded at build time. The URL must never reach the static output or the browser.
- **Framework-level host declaration.** The permitted image host must be explicitly declared in the framework configuration. No other external image host may appear in that configuration.
- **Decorative image only.** The image must not be an interactive element and must not carry semantic meaning that would alter the card's accessible role.
- **No layout disruption.** The image must not displace, overflow, or obscure any existing card element on a 375 px viewport.
- **No placeholder UI.** When an image is absent, the card must not render a placeholder, empty box, or reserved space.
- **Mobile-first.** The primary design target remains a 375 px wide viewport.
- **No new infrastructure or cost.** Deployment pipeline, hosting, and data sources remain unchanged.

---

## 5. Non-Goals

- Displaying shiny or alternate-form images.
- Image caching, preloading, or lazy-loading beyond framework defaults.
- Image accessibility attributes beyond what the framework provides by default.
- Fallback images or default sprites for entries with no `assets.image`.
- Changes to the data displayed on the card beyond the image addition (no new stat fields, no descriptions, no moves).
- Animations or transitions on image load.
- Any change to the fetch script or the underlying dataset structure.
- Any feature not explicitly stated in section 3.

---

## 6. Acceptance Criteria

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-01 | The rendered page contains no heading with the text "Pokémon GO Pokédex" or any derivative. | Load the page; inspect the DOM; confirm no heading element contains that text. |
| AC-02 | The rendered page contains no count of available Pokémon (no text matching "Total Pokémon" or equivalent). | Load the page; inspect the DOM; confirm no such text is present. |
| AC-03 | The page `<title>` does not contain the string "Pokémon GO Pokédex". | Load the page; inspect `document.title` or the `<title>` element; confirm the string is absent. |
| AC-04 | Each `PokemonEntry` in the catalog carries an `imageUrl` field of type `string \| null`. | Inspect the `PokemonEntry` TypeScript interface; confirm the field is present with the correct type. |
| AC-05 | An entry whose `assets.image` is a `raw.githubusercontent.com` URL has a non-null `imageUrl` equal to that URL. | Inspect a known entry (e.g., Bulbasaur) in the parsed catalog; confirm `imageUrl` matches the source value. |
| AC-06 | An entry whose `assets.image` is absent or not a string has `imageUrl: null`. | Identify an entry with no `assets.image`; confirm `imageUrl` is `null` in the parsed catalog. |
| AC-07 | An entry whose `assets.image` URL has a hostname other than `raw.githubusercontent.com` has `imageUrl: null`. | Construct a test entry with a disallowed host URL; confirm the parser sets `imageUrl` to `null`. |
| AC-08 | When `imageUrl` is non-null, the card renders an image element visible within the card boundary. | Select a Pokémon with a known non-null `imageUrl`; confirm an image element is present inside the card. |
| AC-09 | When `imageUrl` is null, no image element or placeholder is rendered on the card. | Select a Pokémon with `imageUrl: null`; confirm no image element or placeholder is present on the card. |
| AC-10 | The image is rendered at a consistent size and does not overflow the card on a 375 px viewport. | Select several Pokémon at 375 px viewport width; confirm the image is contained within the card boundary and no horizontal scrollbar appears. |
| AC-11 | The Pokémon name, stat profile bars, and evolution chain navigation are all present and legible when an image is displayed. | Select a Pokémon with a non-null image; confirm the name, all three stat bars, and (where applicable) evolution links are visible and not obscured. |
| AC-12 | The image is not an interactive element — it has no click handler and is not focusable as a standalone target. | Select a Pokémon; confirm the image element does not respond to click as a navigation or selection action. |
| AC-13 | The permitted image host `raw.githubusercontent.com` is the only external image host declared in the framework configuration. | Inspect the framework image configuration; confirm only `raw.githubusercontent.com` is listed as a permitted remote image host. |
| AC-14 | Running `next build` produces a static export with no server-dependent artefacts. | Run `next build`; confirm `out/` contains only static files and no API or server routes. |
| AC-15 | The page renders without the "Pokémon GO Pokédex" heading or count display after a production build. | Serve the static `out/` directory; confirm neither element appears in the rendered output. |

---

## 7. Risks

- **`next/image` and static export compatibility.** Next.js's image optimization pipeline does not run in a fully static export (`output: 'export'`) without additional configuration. If the implementation uses the framework image component, it must ensure compatibility with the static export constraint. If image optimization is disabled to achieve compatibility, this must be an explicit configuration decision.
- **85 entries with no image.** Image absence is the norm for roughly 8% of the dataset. The implementation must handle null `imageUrl` gracefully and must not produce a layout irregularity for those entries.
- **URL parsing safety.** The build-time host validation must use a proper URL parser (`new URL(...)`) rather than string matching, to correctly handle edge cases such as encoded characters, subdomain spoofing (e.g., `raw.githubusercontent.com.evil.com`), or protocol-relative URLs.
- **Image dimensions.** The source images are icon-sized PNGs. Their intrinsic dimensions are small, but the implementation must set explicit rendering dimensions to prevent layout reflow and to ensure consistent presentation across all entries.
- **Regression in scaffolding-removal.** Removing the `PokemonCountDisplay` component and the heading may affect tests that assert their presence. Those tests must be updated or removed alongside the removal.

---

## 8. Future Considerations

The following are explicitly deferred and must not influence this iteration:

- Shiny or alternate-form image variants.
- Image galleries or sprite sheets.
- Loading states, image skeletons, or animated placeholders.
- Accessibility improvements to image alt text beyond framework defaults.
- Pokémon descriptions, flavor text, or move sets on the card.
- Image-based search or visual browsing.
- CDN caching or image proxy configuration.
