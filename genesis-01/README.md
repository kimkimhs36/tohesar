# TOHEŞAR — NEXT GENERATION / GENESIS 01

Independent, unpublished Scene 01–02 prototype. Run from this directory:

```sh
npm ci
npm run dev
npm run build
```

A new procedural **folded folio**: two unequal pressed titanium surfaces, polished cut edges and five translucent registration films. No existing V2/V3 design, mesh, scene or animation code was used. Ivory, pale sky and peach light describe the surface; there is no bloom, grain or chromatic aberration. The study title is not a new brand slogan.

## Scope and timeline

One persistent Three.js WebGL2 canvas, native scroll, plain DOM, Vite. The complete local scroll span maps to **0–30% of the proposed homepage**, then stops. There are no later scenes.

- 0–12%: folded exterior, portrait crop, restrained stillness.
- 12–17%: camera approaches.
- 17–23%: position and normal morph targets open both folios.
- 23–27%: five film geometries separate into depth.
- 27–30%: camera crosses the outer shell into the films.

All positions derive from the same reversible progress value. Rendering stops after scroll settles and pauses while hidden. DPR capped at 1.65. Reduced motion retains the static composition. WebGL creation/context failure shows a captured still. Recovery requests a new render; real device recovery remains unverified.

Direct inspection frames: `?p=0`, `?p=.23`, `?p=.30`. These freeze the study progress and are for review only. `window.__genesis.state` exposes camera/morph/render statistics.

## Verification

```sh
npx playwright install chromium
# With npm run dev on port 5173:
node scripts/capture.cjs
node scripts/verify.cjs
```

`captures/` contains mobile 390×844 and desktop 1440×1000 screenshots plus raw reports. Chromium uses software WebGL; screenshots are **not iPhone Safari certification or device performance measurements**. No 60fps, thermal, Safari toolbar, or iOS GPU memory claim is made. Real iPhone portrait is the next gate. Film artwork is intentionally abstract and contains no invented journal entries or history.

## Provenance / preservation

- Art direction: user-supplied *TOHEŞAR — THE NEXT GENERATION HOMEPAGE.docx*, Executive Summary, recommended MEMORY ALLOY direction, Scene 01/02, quality gates and handoff.
- `public/assets/wordmark.svg`: byte-for-byte copy of repository `/assets/wordmark.svg`. CSS darkens its display; its paths and source remain unchanged.
- Geometry, film registration textures, lights and timeline: newly authored procedural study. No external model, generated photograph or invented official archive content.
- `public/assets/poster.png`: screenshot of this new renderer, used only for fallback.
- All changes confined to `genesis-01/`. Main homepage, V2/V3, WORLD, SYMBOL, HISTORY, JOURNAL and original assets are untouched. No deployment configuration or production publish was performed.

## Handoff

Run on a physical iPhone Safari in portrait, check slow/fast/reverse scroll and 3–5 minutes of heat/performance, then refine material depth and the 23–30% framing. Confirm artistic approval before expanding scope. Add approved photographic fragments only after source/provenance approval; do not invent brand history. Do not build Scene 03, Journal, gateways or footer as part of this milestone.
