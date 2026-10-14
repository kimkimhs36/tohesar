# TOHEŞAR — GENESIS 02

Scene 01–03 / **0–48%**, continued in the original independent `genesis-01/` directory. Same branch, same artifact, no production deployment.

```sh
npm ci
npm run dev
npm run build
```

## Experience

- **0–12% / Fold.** Unequal titanium folios, satin hairline finish, polished perimeter, translucent memory films. A still portrait composition in ivory, sky and peach light.
- **12–23% / Opening.** Position and normal morph targets open the outer shell. Its opening direction keeps the shell in front of the inner film instead of intersecting it.
- **23–30% / Separation and passage.** Five films become a corridor. A staged dolly crosses the exterior; the existing visual record becomes visible ahead.
- **30–37% / Fragments.** Seven UV crops of the existing YOKOHAMA visual study separate at different depths.
- **37–43% / Anamorphosis.** Fragment transforms settle by 40%. From 40–43%, **only the camera moves**. At 43% their perspective projections reconstruct one image while their depths still span 3.6 world units. This is not a flat image fading over the scene.
- **43–48% / Revelation.** A short held viewpoint lets the image register. Layers then converge into a quiet editorial plane and existing journal metadata appears. No Scene 04 or Journal UI is built.

One Three.js WebGL2 canvas + native scroll + Vite + DOM type. Scroll maps the entire local document to 0–48%, then stops. Mobile has its own composition. Rendering is on demand; settling is time-based, DPR capped at 1.65. Reduced motion provides the first and final compositions as two static scroll states. WebGL failure/context loss shows the captured poster.

## Sources

Top art direction: the supplied *TOHEŞAR — THE NEXT GENERATION HOMEPAGE.docx*, especially Scene 01–03 and quality gates.

See `provenance.json`. The official wordmark and `/assets/yokohama-portrait.webp` are byte-for-byte copies. The image is from the existing `/journal/yokohama/` publication, **AI-assisted visual fiction, not documentary photography**. Its title, year (2026), imagined setting and categories come from that page. This distinction remains visible in the experience. No new brand history, photograph, project or publication date was invented.

All code, geometry and texture effects extend Genesis 01. V2/V3 scene/design code was not reused. Main, WORLD, SYMBOL, HISTORY, JOURNAL, original assets and deployment configuration remain untouched.

## Review and verification

```sh
npx playwright install chromium
# Keep the dev server running on port 5173:
node scripts/review.cjs
WIDTH=1440 HEIGHT=1000 LABEL=desktop FRAMES=0,.30,.43,.48 node scripts/review.cjs
WIDTH=844 HEIGHT=390 LABEL=landscape FRAMES=0,.43,.48 node scripts/review.cjs
node scripts/integration.cjs
```

Review frames: `?p=0`, `?p=.23`, `?p=.30`, `?p=.37`, `?p=.40`, `?p=.43`, `?p=.48`. The query freezes progress. `window.__genesis.seek(p)` is active only in this review mode; `state` exposes actual camera, morph and projection measurements. Normal visits use native scroll.

`captures/g02-mobile-review.json`, `g02-desktop-review.json`, `g02-landscape-review.json`, `g02-transition-review.json` and `g02-integration.json` hold the latest review. `g02-review.json` is an intermediate checkpoint.

Verified: native 0–48% scrolling and reverse traversal, camera-only optical alignment with nonzero physical depth, reduced-motion access to both endpoints, absence of horizontal overflow at 390×844, and simulated context-loss poster. No JavaScript errors were observed. Production build passes; Vite reports a 516.8 kB minified chunk advisory (132.4 kB gzip). Genesis 01 baselines are preserved in `captures/genesis-01-baseline/`. Older `mobile-*`, `render-report.json`, `interaction-report.json` and `scripts/capture.cjs` / `verify.cjs` document the earlier milestone; use the GENESIS 02 commands above for the current timeline.

Chromium uses software WebGL. **Physical iPhone Safari, thermal behavior, touch latency and device FPS are unverified.** Playwright WebKit was downloaded but cannot run in this host: required GTK/GLES and related system libraries are missing, and `sudo` is unavailable. Do not present Chromium emulation as a Safari test. Context restoration after loss still needs physical-device testing.

## Next developer

Start with real iPhone portrait: slow/fast/reverse scroll, toolbar resize, background/foreground, context loss, and 3–5 minutes of repeated playback. Compare 0/23/30/37/43/48 to the saved captures. Continue art-direction refinement only within Scene 01–03 until approved. The final editorial plane is the spatial handoff for a later Scene 04; expanding or deploying is a separate task.
