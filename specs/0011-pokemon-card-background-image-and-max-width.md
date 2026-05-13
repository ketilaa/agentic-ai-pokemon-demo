# Spec 0011 – Pokémon Card Header Image and Responsive Width

**Status:** Complete  
**Iteration:** 11  
**Author:** Architect agent  
**Date:** 2026-05-13

---

## 1. Goal

Move the Pokémon image into the card header so that it functions as an identity aid — helping users immediately recognise the Pokémon alongside the name and type-based treatment, rather than appearing as a detached decorative element. Simultaneously, introduce a responsive maximum card width so the card retains composed, card-like proportions on wider viewports while remaining full-width on mobile.

---

## 2. Context / Background

Iteration 9 introduced the Pokémon image as a dedicated media zone: a centered element rendered as a standalone sibling above the card header. This established the image as visible, but placed it outside the card's structural identity zone. The media zone communicates nothing about the Pokémon beyond appearance; it is compositionally disconnected from the name and type treatment that together form the identity signal.

Iteration 10 restructured the card into a typed header region (identity) and a neutral content region (capability). The media zone was preserved as a sibling preceding the header — still structurally separate, still outside the identity zone.

This iteration dissolves the media zone and relocates the image into the header. The header is already the card's identity surface: it carries the primary type color and the Pokémon name. Adding the image to the header unifies these three signals — type color, name, and likeness — in a single zone. The image's purpose is recognition: it helps users who do not reliably recall Pokémon names identify the Pokémon immediately. This purpose is best served by proximity to the name, not by placement above or outside the card's structural regions.

The image is an aid to recognition. It is not a decorative statement, a focal point, or a background treatment. The name remains the authoritative identity signal; the type color remains the strongest visual expression; the image supports both without competing with either.

The card currently has no maximum width constraint. On viewports wider than the content column, the card can expand without bound, losing its card-like proportion and visual balance. A responsive maximum width caps this expansion while preserving full-width behavior on mobile.

---

## 3. Functional Behavior

### 3.1 Image as identity element in the card header

- The Pokémon image is an identity aid. Its role is to support recognition of the Pokémon, especially for users who do not reliably recall Pokémon names.
- When `imageUrl` is non-null, the image is rendered inside the card header region (`card-header`), alongside the Pokémon name.
- The entire image must be visible. No cropping of the image is permitted. The image may be scaled proportionally to fit the available space in the header.
- The image must be visually subordinate to the Pokémon name. It must not dominate the header, obscure the name, or reduce name legibility.
- The image element carries `data-testid="pokemon-image"` and `data-image-crop="none"` to confirm the no-cropping constraint.
- The image is decorative and non-interactive. It must not be reachable via keyboard focus as a standalone element, and must not respond to click as a navigation or selection action.
- When `imageUrl` is null, no image element, placeholder, or reserved space is rendered in the header. The header renders with name and type background only, as in prior iterations.

### 3.2 Media zone retirement

- The dedicated media zone introduced in Iteration 9 — a standalone sibling region above `card-header` containing an image element — is retired. No such region must be present in the rendered card after this iteration.
- An image element rendered as a discrete sibling preceding `card-header` in the DOM must not be present.

### 3.3 Header integrity

- The card header remains the authoritative identity surface. It carries three identity signals: the primary type color, the Pokémon name, and (when available) the Pokémon image.
- The primary type color remains the strongest visual signal in the header. The header's type-based background treatment must remain perceptible and must not be diluted or obscured by the image.
- The Pokémon name must remain the first readable element in the header. Type identity must be inferable from the header surface alone — a user looking only at the header must be able to perceive the type treatment, regardless of whether they focus on the name or the image.
- The image treatment must be restrained: no masking, artistic framing, decorative effects, or visual effects applied to the image. The image must appear as a clean, proportionally scaled representation.

### 3.4 Content neutrality

- The content region (`card-content-section`) carries no image — neither a foreground image element nor any image-derived treatment.
- The image, when present, must not appear anywhere outside the card header. It must not appear in the content region, above the card, or outside the card container.
- The content region remains visually neutral as established in Iteration 10.

### 3.5 Responsive maximum card width

- The card must have a defined maximum width. On viewports wider than this maximum, the card must not expand beyond it.
- On viewports at or below 375 px, the card must occupy the full available width without horizontal overflow.
- The maximum width must be finite and must produce a visually composed, card-like proportion on desktop viewport widths (≥768 px).
- The card container carries the attribute `data-max-width` set to the configured maximum width value as a positive integer number of pixels.

### 3.6 Preserved behaviors

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
- **Image inside the header only.** When present, the image must be rendered inside `card-header`. It must not appear above the card, outside the card container, or inside the content region.
- **No image cropping.** The entire image must be visible. Proportional scaling to fit the header is permitted; cropping is not.
- **Name primacy.** The Pokémon name must remain the dominant text element in the header. The image must not obscure, overlap, or reduce the legibility of the name.
- **Type color primacy.** The primary type color remains the strongest visual signal in the header. The image must not dilute or compete with the type-based background treatment.
- **Non-interactive image.** The image must not be focusable, clickable, or reachable via keyboard as a standalone target.
- **Content region is image-free.** No image element or image-derived treatment may appear in `card-content-section`.
- **No decorative effects.** No masking, artistic framing, vignette, overlay, filter, or ornamental effect may be applied to the image.
- **Mobile-first.** At 375 px viewport width, the card must not overflow horizontally.
- **No new infrastructure or cost.** Deployment pipeline, hosting, and data sources remain unchanged.

---

## 5. Non-Goals

- Image galleries or multiple images per Pokémon entry.
- Interactive image behavior (zoom, pan, hover effects on the image).
- Changes to which Pokémon have images or how images are sourced or validated.
- Animations or transitions on the image beyond framework defaults.
- Image loading states, skeletons, or progressive enhancement.
- Image rendered as a card-level background layer (filling the full card surface behind header and content).
- Image cropping, masking, or artistic framing.
- Per-type image blending or type-color compositing.
- Changes to header or content semantics, attributes, or tint values defined in Spec 0010.
- Accessibility enhancements to image description or contrast beyond framework defaults.
- Dark mode or system-level theme switching.
- Changes to URL behavior, selection state, or search behavior (Iterations 2, 7).
- Any feature not explicitly stated in section 3.

---

## 6. Acceptance Criteria

### Image in the card header

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-01 | When `imageUrl` is non-null, the image element with `data-testid="pokemon-image"` is present and is a descendant of `card-header`. | Render a Pokémon with a known non-null `imageUrl`; confirm `pokemon-image` exists and is nested inside `card-header`. |
| AC-02 | When `imageUrl` is non-null, no image element is present inside `card-content-section`. | Render a Pokémon with a non-null `imageUrl`; confirm no image element exists inside `card-content-section`. |
| AC-03 | No image element is rendered as a standalone sibling preceding `card-header` in the DOM. | Render a Pokémon with a non-null `imageUrl`; inspect the card DOM; confirm no image element is a direct sibling preceding `card-header`. |
| AC-04 | When `imageUrl` is null, no image element or placeholder is present anywhere on the card. | Render a Pokémon with `imageUrl: null`; confirm no image element or empty reserved zone is present in the card. |
| AC-05 | The image element carries `aria-hidden="true"` and `data-image-crop="none"`. | Render a Pokémon with a non-null `imageUrl`; confirm `pokemon-image` has `aria-hidden="true"` and `data-image-crop="none"`. |

### Header integrity

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-06 | The card header is present and contains the Pokémon name when an image is displayed. | Render a Pokémon with a non-null `imageUrl`; confirm `card-header` is present and contains the Pokémon name text. |
| AC-07 | The card content section is present and contains all three stat bars and, for a mid-stage Pokémon, the evolution chain navigation, when an image is displayed. | Render a mid-stage Pokémon with a non-null `imageUrl`; confirm `card-content-section` contains `stat-bar-atk`, `stat-bar-def`, `stat-bar-sta`, `evolves-from-section`, and `evolves-to-section`. |
| AC-08 | The header type identity attributes are present and valid when an image is displayed. | Render a Pokémon with a non-null `imageUrl`; inspect `data-header-tint-opacity` on `card-header`; confirm the value is greater than `0.15` and less than `0.5`. |
| AC-09 | The Pokémon name is the first readable element in the header and remains legible when an image is present. (Manual QA) | Render a representative set of Pokémon with non-null images; confirm the name is immediately readable and is not obscured by the image. |
| AC-10 | The type-based header background treatment is visually perceptible when an image is present; type identity is inferable from the header surface alone. (Manual QA) | Render Pokémon of varied types with non-null images; confirm the header tint reads clearly and the type treatment is not obscured or overwhelmed by the image. |

### Content neutrality

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-11 | The content region carries no type-derived tint and no image element. | Render a Pokémon with a non-null `imageUrl`; confirm `data-content-tint-opacity` on `card-content-section` is `0` and no image element is present inside it. |

### Responsive maximum width

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-12 | The card container carries `data-max-width` with a finite positive integer value. | Render any Pokémon; inspect `data-max-width` on `pokemon-card`; confirm the value is a positive integer. |
| AC-13 | At 375 px viewport width, the card fits within the viewport without horizontal overflow. | Render the card at 375 px viewport width; confirm no horizontal scrollbar appears and the card is fully contained. |
| AC-14 | On a viewport wider than 768 px, the card does not expand beyond the configured maximum width. (Manual QA) | Open the app on a desktop viewport; confirm the card stops widening at a composed, card-like proportion. |

### Build and static export

| # | Criterion | How to verify |
|---|-----------|---------------|
| AC-15 | Running `next build` produces a static export with no server-dependent artefacts. | Run `next build`; confirm `out/` contains only static files. |

---

## 7. Risks

- **Spec 0010 AC-19 inversion.** Spec 0010 AC-19 asserts that `pokemon-image` is present on the card and is *not* nested inside `card-header`. This iteration inverts that constraint: the image must now be *inside* `card-header` (AC-01). The existing test for Spec 0010 AC-19 will fail after this iteration and must be updated to reflect the new placement. It must not be left as a false-passing or silently-skipped test.

- **Header composition with image and name.** The header must accommodate both the Pokémon name and the image within the same region. Depending on how they are arranged, the header may become visually crowded, or the image may overshadow the name. The implementation must ensure the name reads first and the image does not push the name into an illegible or secondary position. The header's vertical or horizontal dimensions may need adjustment, but must not produce layout overflow at 375 px.

- **Transparent PNG sprites in the typed header.** The source images are PNG icons with transparent backgrounds. When placed inside the typed header (which carries a color tint), the transparent areas of the sprite will show the header background tint through. This interaction may produce a clean or an inconsistent appearance depending on the sprite. The implementation must consider whether transparent-background sprites integrate acceptably with the header's color treatment without requiring additional masking or effects (which are prohibited by the constraints).

- **Name legibility alongside the image.** The image appears in the same region as the Pokémon name. If the image is positioned near or overlapping the name, it may reduce contrast or readability. This risk is highest for sprites with light-colored areas near the name placement. The implementation must ensure adequate spatial or visual separation between the name text and the image.

- **Header tint perceptibility with a sprite present.** The image occupies area within the header that would otherwise show only the type tint. If the sprite is visually busy or saturated, it may compete with the tint for visual presence. The type treatment must remain perceptible across the full range of Pokémon sprites in the dataset, not only for Pokémon with subdued or small sprites.

- **Image absence does not create a visual gap.** When `imageUrl` is null, the header must render cleanly with name and type tint only. If the header layout reserves space for the image even when null, a gap or asymmetry will appear. The implementation must ensure no reserved space is introduced.

- **Maximum width and card centering.** A maximum width alone does not center the card — it must be combined with appropriate alignment to avoid the card anchoring to one side of a wide viewport. The implementation must ensure the card is centered or otherwise compositionally balanced on wide screens.

---

## 8. Future Considerations

The following are explicitly deferred and must not influence this iteration:

- Pokémon image rendered as a card-level background layer (filling the full card surface area behind header and content).
- Per-type image tinting or blending of the image with the primary type color.
- Alternate form or shiny variant images.
- Image loading states, progressive reveal, or lazy-loading beyond framework defaults.
- Interactive image behavior (hover zoom, click-to-expand, pan).
- Image cropping, masking, or artistic framing as a future design option.
- Accessibility improvements to image description or alt text beyond framework defaults.
- Changes to the evolution chain, stat bar display, or any content within `card-content-section`.
- Typography-based type identity signals (Spec 0010 future consideration).
- Dark mode or system-level theme adaptation.
- Any change to URL behavior, selection state, or search behavior (Iterations 2, 7).
