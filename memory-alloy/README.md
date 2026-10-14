# TOHEŞAR — MEMORY ALLOY / FOLDED RECORD

**Status:** Stage 02 isolated art-direction proof; **not a released homepage**.

- Entry point: `/memory-alloy/`
- Files: `index.html`, `style.css`, `sculpture.js`
- Source: original procedural WebGL2 folded titanium + milky film sculpture. No stock car, no symbol geometry, no generative placeholder portfolio.
- Brands and links: original approved wordmark file `/assets/wordmark-hd.png` is used as a mask; routes to JOURNAL, WORLD, SYMBOL and HISTORY without modifying any of them.
- Scroll range: the entire isolated demo maps to **0–30%** of the future homepage. Native page scroll runs through two continuous phases, with reversible camera/procedural mesh changes.
- Core parts: stable-topology **outer folio**, separately opening **wing**, and three rear **memory films**. Five tessellated surfaces are dynamically updated; no permanent geometry destruction.
- Performance: capped DPR, conditional geometry updates, intersection/visibility pausing, WebGL context-loss fallback, reduced-motion alternative, keyboard-accessible index.

## Preview locally

Serve the **repository root** (not this directory) with any static HTTP server and navigate to `/memory-alloy/`. For example: `python -m http.server 8000` from the repository root. This preserves relative paths to existing brand assets.

## Quality status / 2026-10-14

- [x] Valid JavaScript syntax (`node --check`).
- [x] 390×844 layout test, DOM scroll 0→100%, menu and fallback logic verified in Chromium.
- [x] Existing brand mark's proportions preserved, not regenerated as a font.
- [ ] GPU WebGL2 screenshot + material/geometry critique. The restricted local Chromium environment denied WebGL contexts; **no successful 3D screenshot was claimed**.
- [ ] Physical iPhone Safari forward/reverse scroll, memory/heat/context-loss test.
- [ ] User aesthetic approval.

**Do not merge into `main` before physical-device rendering + visual approval.**