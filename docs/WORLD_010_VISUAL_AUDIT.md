# TOHEŞAR — WORLD CONTINUITY 010 / Visual audit

Exact BEFORE: `500672342c158929b0e278a7cb1fb976a88781d6`, untouched detached worktree on port 8001. AFTER is the new world-continuity branch, port 8000. Real Chromium and Playwright WebKit 26.5 renders, device scale 1, fonts and images decoded; same six viewport dimensions for each version. Phone/tablet labels are viewport descriptions, not hardware tests.

## Diagnosis and accepted changes

The cover's wide layout used `100svh`, a photograph capped at 77% of stage height, and an independently positioned right column. On expanding browser space it could underuse the visible height; that is a code diagnosis, not a reproduced physical-toolbar measurement. The Journal entrance faded completely during the middle phase. Resize was the only lifecycle geometry update. Switching reduced motion on left animated inline positions behind.

010 uses `100dvh` only in wide cover layout with a stable `120svh` scroll distance. The final photograph is 56% wide, up to 84% high, with an 8% top margin; original focus, image transform and initial 60% composition remain. Right typography grows modestly, not a replacement cover. Journal remains visible with a 44px-high touch target. Orientation, visualViewport, font and pageshow refresh geometry. Reduced motion clears animated inline styles. iPhone photography, wordmark mask, original cedilla and portrait frame calculations remain unchanged.

The new Passage sits between Type 01 and Atelier in Issue 001 and near the end of the 911 essay. Original transparent WebPs follow three genuine SVG curves through measured native scroll. There is no auto-driving, car-as-button, scroll interception or continuous render loop. A short sticky spread leaves reading text outside the car paths. Reduced motion, no JavaScript and short viewports retain a composed static plate with ordinary links. The GT was moved lower and desktop cars reduced after inspecting the middle scene: the first trial crowded the wedge and GT.

Articles retain native independent URLs. The existing deterministic paper veil is retained, shortened to 140ms, coloured from the departing page and shared on arrival. The existing logo inside the veil was removed, leaving no loading artwork. BFCache history removes leaving state. Related entries are generated from unchanged content metadata; the first photograph leads into another actual story, with visible provenance. Giulia's original end-title remains. Both Issue and Journal return links are present.

Issue photography, layouts and Atelier arrangement remain 009. Existing transition sentences now sit with an optional next-chapter anchor, allowing the editorial relationship to be followed without opening another URL. The last plate keeps its closing transition. The Journal frontispiece remains. Its existing first section link now exposes Issue 001; the collection appears as mast metadata on larger viewports. At 1180 × 820, the photograph, heading and credit fit together instead of the photo running below the first screen.

## Rejected / revised

A phone Atelier mast link wrapped into an extra block and created unbalanced whitespace; it was removed from the phone view. A stale document-top measurement made the Passage start too far along after lazy images loaded. Progress now comes from the current section bounds. The tablet middle scene initially placed the GT too close to the wedge; spacing and illustration sizes were revised. No new cover button, floating menu, emoji, replacement wordmark or new miniature was retained.

## Actual observation

Opened the original and changed 1180 cover triptychs; phone Passage first/middle/last; full-size WebKit 1180 Passage, cover midpoint, phone cover ending, phone and tablet Journal, Giulia related spread; six-size WebKit cover and Journal contact sheets. Final middle Passage and Issue/related screens were re-opened after the last spacing edit. These are editorial decisions rather than automated aesthetic scores. The review room gives the full native screenshots for independent judgment.

## Reproduction and checks

```sh
python3 scripts/publish.py check
python3 scripts/publish.py build
python3 scripts/publish.py preview --port 8000
BASE_URL=http://127.0.0.1:8001 node scripts/capture_world_010.cjs docs/world-010-review/before chromium
node scripts/capture_world_010.cjs docs/world-010-review/after chromium
# Use webkit in the last argument for identical WebKit evidence.
python3 scripts/build_world_review.py
node scripts/verify_world_010.cjs
REVIEW_DIR=docs/world-010-review/regression-008 node scripts/verify_issue_008.cjs
REVIEW_DIR=docs/world-010-review/regression-006 node scripts/verify_visual_006.cjs
python3 -m unittest discover -s scripts -p test_publishing_008.py -v
```

This container needed extracted Debian WebKit libraries and a launcher outside the repository. Set `WEBKIT_EXECUTABLE_PATH` when reproducing here; none are site dependencies. The 006 preservation assertion now explicitly excludes the commissioned cover HTML/CSS/JS changes, while retaining original photo focus, fonts, imagery, brand and legacy motion protection. No runtime framework was added.

Physical iPad/iPhone Safari, browser toolbar animation, older iOS and hardware thermal/performance behaviour remain unverified. Simulated viewport height changes and WebKit rendering do not establish physical Safari correctness. Full hardware acceptance remains the next validation step.
