# TOHEŞAR — Astra production candidate 001

Independent static publication. Open `index.html` through any HTTP server. No build, package installation, framework, external font request, WebGL or third-party runtime required.

## Local review

From repository root: `python -m http.server 8765`, then visit `http://localhost:8765/publication/`.
Run `python scripts/test_publication.py` with Python Playwright and Chromium installed. Override `PUBLICATION_BASE_URL` for a deployed preview. Screenshots are written to `docs/astra-production-001/`.

## Preservation

All pre-existing tracked files, workflows, domain configuration and legacy routes remain untouched. New files live in `publication/`, `docs/astra-production-001/`, and the dedicated test script. No merge or production deployment is authorized. An eventual homepage switch must be separately reviewed; this candidate deliberately does not change the root homepage. Legacy links use the existing production destinations.

## Editorial / assets

- `wordmark.svg`, `cedilla-icon.svg`: exact copies of original repository assets, geometry unchanged.
- `audi.webp`: Dhiva Krishna, Audi S5 Sunset, https://unsplash.com/photos/GRV4ypBKgxE — Unsplash License. Original image photo-1504215680853-026ed2a45def. Downloaded 2026-10-28; converted to WebP. Composition cropped by CSS.
- `cover.webp`: Campbell, High Roller, https://unsplash.com/photos/3ZUsNJhi_Ik — Unsplash License. Original image photo-1503376780353-7e6692767b70. Downloaded 2026-10-28; converted to WebP. Composition cropped by CSS.
- `porsche-911-1600.webp`: Calreyn88, https://commons.wikimedia.org/wiki/File:1973_Porsche_911_Carrera_RSR_4.jpg — CC0 1.0, existing repository derivative.
- `f40-1600.webp`: MrWalkr, https://commons.wikimedia.org/wiki/File:1991_Ferrari_F40_Red.jpg — CC BY-SA 4.0, existing WebP derivative. This image derivative retains CC BY-SA 4.0; no claim of exclusive ownership.
- `miniatures.webp`: newly generated transparent image sheet, OpenAI image generation, 2026-10-28. Original 1536×1024 PNG retained in generation workspace. Original brief: six individually separated professional airbrush illustrations of Ferrari 360 Modena, Jaguar XK X150, Aston Martin DBS, first-generation Audi R8, Kia Stinger, second-generation Chevrolet Volt. No third-party clothing artwork supplied. Rendered as six CSS sprite image layers, not CSS-drawn vehicles. Selected layers respond to touch; the sheet is not also used as a visible background.
- The full original 50-car list was unavailable. Selection is exclusively from the user-provided candidates. No ranking is asserted.
- Editorial essays are AI-assisted visual interpretations, not road tests or reporting. All dates in the news section are source publication dates. Two Porsche links and their page titles were checked directly on 2026-10-28. This is a dated editorial selection, not a live news service.

## Implementation

Eight static HTML routes. Native scrolling; one scroll-event requestAnimationFrame for the hero only; no perpetual loop. CSS transition to reduced wordmark prominence and cedilla navigation. Native dialogs with Escape dismissal and focus return. Browser-local saving, Web Share / clipboard fallback, static search, photo enlargement, glossary explanation, related reading. Source and license links appear on pages.

## Review limits / next art pass

The commissioned silver-car/Japanese-evening cover is still an opportunity; this candidate uses an authentic warm-light Audi photograph, not a fabricated shoot. The four-image gallery is intentionally small. Illustration recognisability needs specialist correction, especially Ferrari lamp shapes, Jaguar fascia and wheels; the artwork is openly identified as an AI-assisted study. A final commissioned illustration pass should increase variation in viewpoint and scale. More deeply reported stories and a verified complete personal collection are future editorial inputs. English is used for this candidate, following the supplied brief; a Korean editorial edition is not implemented.

Chromium renders tested at 320, 390, 1024 and 1440 widths. No physical iPhone/iPad, Safari, VoiceOver, field Core Web Vitals or thermal measurements. Playwright WebKit executable unavailable. Reduced-motion behavior is CSS/media-query based and tested in Chromium. Full homepage payload is approximately 1 MB after all lazy images load; critical cover approximately 290 KB. No formal Lighthouse score claimed.
