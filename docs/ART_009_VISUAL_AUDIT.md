# TOHEŞAR — Art Direction 009

Baseline: b7a5d0b22fd21d9264064b4ff4afb42658520132. Separate branch: feature/tohesar-art-direction-009.

## Visual decisions

The baseline was rendered before editing. Its recurring photograph / tiny metadata / heading / paragraph sequence gave five different stories the same tempo. The 911 arch enclosed too little car. F40's saturated peach competed with the car. Giulia's dark plate split the body with lines. The Jaguar portrait crop emphasised a wall rather than the length of the GT. Archive introduction occupied the first phone screen without showing the publication.

The shared language is an observation plate: a car's name, a photographic frame, a short reading and a next observation. Lilac, warm paper and sage recur between scenes. Serif English names stretch and turn; Korean headings remain quiet and readable. Captions use 10–11px instead of ever smaller labels. The original miniature composition remains the reference for gentle colour and asymmetry; its artwork, rotations and shadows are preserved.

- **Issue jacket:** two typographic voices and a photographic plate. A trial crop cut the front of the car; it was rejected, and the mobile photograph retains its natural ratio.
- **911:** wider photographic frame with a single shoulder-like curve. The car and waterfront now occupy the plate together. Existing AI-assisted visual-fiction disclosure is retained.
- **F40:** open horizontal image, large functional typography, warm neutral paper. The photograph supplies the red.
- **Giulia:** sage observation paper, italic name, full side stance, three register labels outside the photo. No implied measured dimensions.
- **Jaguar:** an existing licensed manufacturer profile replaces the portrait crop of the arrival image. The profile is displayed at its native 1600:1067 ratio.
- **Miniatures:** preserve the successful arrangement; captions and paper connect it to the preceding plates.
- **Giulia essay:** side-profile opening makes the article's subject visible before the essay starts. All 36 original paragraph elements survive. Source/trim limits stay prominent. Front, rear and surface photos remain in the body.
- **Study:** edge-to-edge mobile photo, much lighter focus mask, 1px non-scaling guides, bright sage paper. SVG and photo use the same centred crop, so marks do not drift from their original coordinates. Progress fills the existing five segments. No wheel/body transformations, autoplay or scroll interception. Full-frame static photo and five notes remain.
- **Journal:** serif mast and larger waterfront plate; the original 911 lead, news and design invitations remain.
- **Archive:** shorter front matter, an actual edition jacket and publication details. Only published Issue 001 is present. The generator renders the same system for future published editions.

## Actual visual review

390 × 844 BEFORE and AFTER were inspected in both engines. Additional screenshot inspection covered 320 × 667, 430 × 932, iPad landscape 1180 × 820, desktop 1440 × 1000. The small-screen Giulia and Type 01 names were scaled down after overflow was found. The archive's font fallbacks were made explicitly serif after a WebKit render exposed a fallback difference. Miniatures were retained instead of redesigning a successful scene.

The review room shows twelve pairs (ten required scenes, closing and static whole-form view), engine selection, native screenshot links and plain-language design assessments. These are editorial judgments, not automated aesthetic scores.

## Reproduction

No website runtime dependency was added. Development checks use Playwright, an installed Chromium and Playwright WebKit. This environment uses an external WebKit launcher with extracted Debian libraries; no launcher or browser binaries are shipped.

```sh
# Baseline server in an untouched worktree at the exact baseline SHA, on port 8001.
BASE_URL=http://127.0.0.1:8001 node scripts/capture_art_009.cjs docs/art-009-review/before chromium
BASE_URL=http://127.0.0.1:8001 node scripts/capture_art_009.cjs docs/art-009-review/before webkit
# 009 server uses the existing publisher preview on port 8000.
python3 scripts/publish.py preview --port 8000
node scripts/capture_art_009.cjs docs/art-009-review/after chromium
node scripts/capture_art_009.cjs docs/art-009-review/after webkit
node scripts/review_art_009.cjs
REVIEW_DIR=docs/art-009-review/verification node scripts/verify_issue_008.cjs
REVIEW_DIR=docs/art-009-review/regression-006 node scripts/verify_visual_006.cjs
python3 -m unittest discover -s scripts -p test_publishing_008.py -v
```

Set WEBKIT_EXECUTABLE_PATH if a local launcher is required. The full capture scripts await fonts and decoded images; the study is captured at 50% of its natural scroll distance. BEFORE and AFTER use device scale 1.

## Generated sources

- `scripts/build_issues.py`: cover composition, chapter identity and archive/jacket markup; 009 stylesheet attached through the generator.
- `journal/templates/giulia-body.html` and `scripts/build_giulia.py`: authored article and final stylesheet ordering.
- `journal/assets/art009.css`: scoped visual system. Original shared CSS and cover CSS are untouched.
- `journal/assets/proportion008.js`: existing reversible passive scroll calculation, with per-segment progress and reset only.
- `journal/index.html`: existing authored Journal source with the new mast and class. All generated issue invitations continue to rebuild from data.

`check`, `build` and `preview` retain their meanings. Repeated builds match. `content-index.json`, `issues.json`, `news.json` and all source manifests are byte-identical to 008. Drafts are still excluded. No CMS, backend, image-generation pipeline or framework was introduced.

## Limits

No physical iPhone Safari or older iOS hardware test was performed. WebKit mobile viewports are browser-engine evidence only. The Pexels profile still has no verified exact model year/trim. Guide marks are visual observations, not CAD measurements. The ordinary photographic setting remains real; it was not AI-replaced. The original 911 visual fiction remains explicitly disclosed.
