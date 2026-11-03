# TOHEŞAR 029 — Living Icons: prototype and release notes

A quiet screen-perimeter easter egg. Five hand-authored, transparent-background vector miniatures: Porsche 911 Turbo 930, Ferrari F40, Lamborghini Countach, Alfa Romeo Giulia, Jaguar E-Type. They are recognizable illustrated miniatures, not cut-outs of licensed photographs or documentary-accurate vehicle diagrams. Do not describe them as original photographs.

## Behavior
- Uses one fixed overlay and an invisible rounded SVG path, remeasured for viewport changes and iOS safe-area insets.
- Runs occasionally after a short dwell, then pauses; the cover opening stays visually undisturbed until the visitor scrolls past it.
- The current car turns corners, morphs by short silhouette crossfade at travel checkpoints, and responds to tapping by changing model.
- Respects reduced-motion and Save-Data, pauses in hidden tabs, cancels on pagehide, and resumes after BFCache pageshow.
- No navigation interception, history manipulation, service worker, global animation loop while dormant, or overlay covering the entire screen with active pointer capture.
- Runtime loaded from existing `travel.js`, so generator rebuilds retain the code. It is disabled in the standalone creative cover playground.

## Verification checklist
- SVG assets and optional JS/CSS exist in `journal/assets/`.
- All major site pages that load `travel.js` receive one miniature runner.
- Run `node --check journal/assets/border-icons029.js` and `node --check journal/assets/travel.js`.
- Run `BASE_URL=http://127.0.0.1:8000 node tests/living-icons029.cjs` with Playwright and Chromium/WebKit installed. In addition run `tests/navigation.cjs`.
- Check mobile widths 375/390/430 and tablet landscape. Verify picture positioning with real Safari.
- Confirm COVER 004, F40, Giulia, Jaguar article layouts and 028 cross-document transitions remain unchanged.
- Do not infer physical-device success from a successful Vercel or GitHub Pages build.

This is a decorative proof-of-concept and may be removed without modifying article HTML or the publishing pipeline by removing the optional loader appended to `journal/assets/travel.js`.
