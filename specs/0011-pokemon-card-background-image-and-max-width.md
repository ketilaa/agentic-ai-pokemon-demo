# Spec 0011 – Pokémon Card Background Image and Responsive Width

**Status:** Draft  
**Iteration:** 11  
**Author:** Architect agent  
**Date:** 2026-05-13

---

## 1. Goal

Reposition the Pokémon image from a discrete media zone above the card header into a background layer that fills the card surface, giving it presence and depth without competing with the card's structural content. Simultaneously, introduce a responsive maximum card width so the card retains composed, card-like proportions on wider viewports while remaining full-width on mobile.

---

## 2. Context / Background

Iteration 9 introduced the Pokémon image as a dedicated media zone: a centered 80×80 px element rendered as a sibling above the card header. This established the image as a visible element, but its treatment as a standalone floating object creates a compositional disconnect — the image sits apart from the card structure rather than within it.

Iteration 10 restructured the card into explicit regions (container, header, content) and preserved the media zone as a sibling preceding the header. The image occupies structural space in the normal content flow and functions as an isolated display block: a foreground object that demands its own visual position.

This iteration dissolves the media zone. The image is integrated as a background layer behind the header and content, filling the card surface rather than occupying a slot in the flow. This lets the image contribute character and identity without claiming space or drawing focus. The header and content remain structurally and visually in front of the image at all times.

The card currently has no maximum width constraint. On viewports wider than the content column, the card can expand without bound, losing its card-like proportion and visual balance. A responsive maximum width caps this expansion while preserving full-width behavior on mobile.

---

## 3. Functional Behavior

### 3.1 Background image layer

- When `imageUrl` is non-null, the Pokémon image is rendered as a background layer within the card. The image must cover the full card surface area.
- The image must scale with the card dimensions, maintaining full coverage as the card width varies.
- The background image is positioned beneath the header and content regions. Both regions must appear visually in front of the background image.
- The card container carries the attribute `data-background-image-url` set to the active image URL when an image is present, and set to an empty string when no image is present.
- When `imageUrl` is null, no image, placeholder, or empty reserved space is rendered. The card renders identically to a card without an image in prior iterations.
- The background image is decorative and non-interactive. It must not be reachable via keyboard focus as a standalone element, and must not respond to click as a navigation or selection action.

### 3.2 Media zone retirement

- The dedicated media zone introduced in Iteration 9 — a sibling region above `card-header` containing a standalone image element — is retired. No such region must be present in the rendered card after this iteration.
- An image element rendered as a discrete sibling preceding `card-header` in the DOM must not be present. The image is no longer a foreground element in the normal content flow.

### 3.3 Image softening and foreground dominance

- The background image must be visually attenuated so that the header and content regions remain the primary visual focus.
- The header's typed background treatment (primary type color) must remain visually distinct even when the background image contains contrasting or saturated colors. The header must not dissolve into the background.
- The content region must remain visually calm and readable regardless of the underlying image.
- The background image treatment must be restrained: no heavy overlays, dramatic filters, vignette effects, or spotlight effects. The card must remain calm and composed.

### 3.4 Responsive maximum card width

- The card must have a defined maximum width. On viewports wider than this maximum, the card must not expand beyond it.
- On viewports at or below 375 px, the card must occupy the full available width without horizontal overflow.
- The maximum width must be finite and must produce a visually composed, card-like proportion on desktop viewport widths (≥768 px).
- The card container carries the attribute `data-max-width` set to the configured maximum width value as a positive integer number of pixels.

### 3.5 Preserved behaviors

All structural and behavioral properties from prior iterations remain unchanged:

- Card structure: `card-header`, `card-content-section`, `evolution-section`, stat bars (Iterations 5–10)
- Header type identity: `data-header-tint-color`, `data-header-tint-opacity` in range (0.15, 0.5) (Iteration 10)
- Card container tint retirement: `data-tint-opacity={0}` (Iteration 10)
- Content neutrality: `data-content-tint-opacity={0}` (Iteration 10)
- Primary type border and secondary type accent: `data-border-primary-color`, `data-border-secondary-color`, `data-border-primary-sides`, `data-border-secondary-sides` (Iteration 8)
- Image URL sourcing and build-time host validation (Iteration 9)
- URL-based selection state and evolution link navigation (Iteration 7)

---

## 4. Constraints

- **Static-only.** The application remains a fully static Next.js export. No API routes, server-side rendering at request time, or middleware is introduced.
- **No new data sources.** Image URLs come exclusively from the existing `imageUrl` field in each `PokemonEntry`. No changes to data ingestion, image sourcing, URL validation, or framework image host configuration.
- **Background layer only.** The image must be rendered as a background layer filling the card surface. It must not appear as a standalone floating element, as a centered foreground object, or in a dedicated media zone separate from the card surface.
- **Foreground content must remain dominant.** The header and content regions must be visually in front of the background image at all times and under all image content.
- **Restrained treatment.** No heavy overlays, dramatic filters, vignette effects, or spotlight effects. The image must feel integral and calm — present but not assertive.
- **Non-interactive image.** The background image must not be focusable, clickable, or reachable via keyboard as a standalone target.
- **Mobile-first.** At 375 px viewport width, the card must not overflow horizontally.
- **No new infrastructure or cost.** Deployment pipeline, hosting, and data sources remain unchanged.

---

## 5. Non-Goals

- Image galleries or multiple images per Pokémon entry.
- Interactive image behavior (zoom, pan, hover effects on the image).
- Changes to which Pokémon have images or how images are sourced or validated.
- Animations or transitions on the image beyond framework defaults.
- Image loading states, skeletons, or progressive enhancement.
- Per-type image blending or type-color compositing of the background image.
- Changes to header or content semantics, attributes, or visual treatment defined in Spec 0010.
- Accessibility enhancements to image description or contrast beyond framework defaults.
- Dark mode or system-level theme switching.
- Changes to URL behavior, selection state, or search behavior (Iterations 2, 7).
- Any feature not explicitly stated in section 3.

---

## 6. Acceptance Criteria

### Background image layer

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-01 | When `imageUrl` is non-null, `data-background-image-url` on the card container equals the Pokémon's image URL. | Render a Pokémon with a known non-null `imageUrl`; inspect `data-background-image-url` on `pokemon-card`; confirm it equals the expected URL. |
| AC-02 | When `imageUrl` is null, `data-background-image-url` on the card container is an empty string. | Render a Pokémon with `imageUrl: null`; inspect `data-background-image-url` on `pokemon-card`; confirm it is `""`. |
| AC-03 | No standalone image element exists as a sibling preceding `card-header` in the DOM. | Render a Pokémon with a non-null `imageUrl`; inspect the card DOM; confirm no image element is rendered as a direct sibling preceding `card-header`. |
| AC-04 | When `imageUrl` is null, no image element, placeholder, or reserved space is rendered in the card. | Render a Pokémon with `imageUrl: null`; inspect the card DOM; confirm no image element or empty reserved zone is present. |
| AC-05 | The background image element is non-interactive: it carries `aria-hidden="true"` and does not receive keyboard focus as a standalone target. | Render a Pokémon with a non-null `imageUrl`; confirm the element rendering the image has `aria-hidden="true"` and no interactive role. |

### Header and content dominance

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-06 | The card header is present and contains the Pokémon name when a background image is displayed. | Render a Pokémon with a non-null `imageUrl`; confirm `card-header` is present and contains the Pokémon name. |
| AC-07 | The card content section is present and contains all three stat bars when a background image is displayed. | Render a Pokémon with a non-null `imageUrl`; confirm `card-content-section` is present and contains `stat-bar-atk`, `stat-bar-def`, and `stat-bar-sta`. |
| AC-08 | The header type identity attributes are present and valid when a background image is displayed. | Render a Pokémon with a non-null `imageUrl`; inspect `data-header-tint-opacity` on `card-header`; confirm the value is greater than `0.15` and less than `0.5`. |
| AC-09 | The Pokémon name, stat bars, and evolution navigation are legible when a background image is present. (Manual QA) | Render a representative set of Pokémon with non-null images; confirm the name, stat bars, and evolution links are readable against the background. |
| AC-10 | The background image is visually attenuated so the header and content remain the dominant visual elements. (Manual QA) | Render a Pokémon with a vivid or detailed sprite; confirm the image reads as background material rather than as a focal point or foreground object. |

### Responsive maximum width

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-11 | The card container carries `data-max-width` with a finite positive integer value. | Render any Pokémon; inspect `data-max-width` on `pokemon-card`; confirm the value is a positive integer. |
| AC-12 | At 375 px viewport width, the card fits within the viewport without horizontal overflow. | Render the card at 375 px viewport width; confirm no horizontal scrollbar appears and the card is fully contained. |
| AC-13 | On a viewport wider than 768 px, the card does not expand beyond the configured maximum width. (Manual QA) | Open the app on a desktop viewport; confirm the card stops widening at a composed, card-like proportion. |

### Build and static export

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-14 | Running `next build` produces a static export with no server-dependent artefacts. | Run `next build`; confirm `out/` contains only static files. |

---

## 7. Risks

- **Background image legibility against the typed header.** The header's type-color tint (opacity 0.15–0.5) is an alpha-blended surface. When the background image beneath it contains saturated or contrasting colors, the tint may lose perceptibility. The implementation must ensure the header reads clearly as a typed region regardless of image content — for all 18 standard type colors and across the range of Pokémon sprites in the dataset.

- **Icon-scale source images used as full-card backgrounds.** The source images are small-format PNG icons with transparent backgrounds, designed for display at 80×80 px. When scaled up to fill a card-sized surface, they may appear blurry, pixelated, or compositionally weak. The implementation must choose a rendering strategy that handles the scale mismatch gracefully — the image should read as an ambient background element, not as an enlarged icon.

- **Content legibility over the background.** The content region carries no type-derived tint. When the background image extends beneath stat bars and evolution chips, contrasting image content may impair readability. The implementation must provide adequate visual separation between the background layer and the foreground content in the content region, without introducing type-derived color treatment that would violate the neutrality constraint from Spec 0010.

- **Media zone testid migration.** The `data-testid="pokemon-image"` element on the standalone foreground image (established in Spec 0009, preserved in Spec 0010) must not appear as a standalone sibling preceding `card-header` after this iteration. Existing tests that assert on `pokemon-image` as a foreground element must be updated. Tests that assert `pokemon-image` is absent when `imageUrl` is null remain valid only if the image is no longer rendered as a standalone DOM element at all; they must be reviewed to ensure they continue to reflect correct behavior under the new background rendering approach.

- **Transparent image backgrounds and card surface.** The source PNG icons have transparent backgrounds. When rendered as a background layer filling the card, the transparent areas of the image will reveal the underlying card surface (white or light neutral). This may produce an unintended appearance if the card surface color and the image composition interact poorly. The implementation must consider whether the transparent background of the sprite interacts acceptably with the card surface at the expected scale.

- **Maximum width and card centering.** A maximum width alone does not center the card — it must be combined with appropriate alignment to avoid the card anchoring to one side of a wide viewport. The implementation must ensure the card is centered or otherwise compositionally balanced on wide screens.

---

## 8. Future Considerations

The following are explicitly deferred and must not influence this iteration:

- Per-type image tinting or blending of the background image with the primary type color.
- Alternate form or shiny variant images.
- Image loading states, progressive reveal, or lazy-loading beyond framework defaults.
- Interactive image behavior (hover zoom, click-to-expand, pan).
- Accessibility improvements to background image description beyond framework defaults.
- Changes to the evolution chain, stat bar display, or any content within `card-content-section`.
- Typography-based type identity signals (Spec 0010 future consideration).
- Dark mode or system-level theme adaptation.
- Any change to URL behavior, selection state, or search behavior (Iterations 2, 7).
