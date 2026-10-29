# TOHEŞAR — WORLD CONTINUITY 010

Branch: `feature/tohesar-world-continuity-010`  
Exact 009 baseline: `500672342c158929b0e278a7cb1fb976a88781d6`  
Application / deployment source: `e6b77d156d953a0e0e24f36bd58ac7d370f1feac`

This final handoff and public verification are a documentation-only commit after release. Obtain the final branch HEAD with `git rev-parse HEAD`; the deployed application stays pinned to the source above. Do not deploy the old restored `feature/tohesar-continuity-010` experiment or copy its abandoned modifications.

## Open the work

- Independent review: https://tohesar-world-010-review.vercel.app/
- Journal: https://tohesar-world-010-review.vercel.app/journal/
- Issue: https://tohesar-world-010-review.vercel.app/journal/issues/001/
- Miniature Passage: https://tohesar-world-010-review.vercel.app/journal/issues/001/#miniature-passage
- Passage inside the 911 essay: https://tohesar-world-010-review.vercel.app/journal/911/#miniature-passage
- Article continuation: https://tohesar-world-010-review.vercel.app/journal/design/giulia/
- BEFORE / AFTER room: https://tohesar-world-010-review.vercel.app/docs/world-010-review/

Project `tohesar-world-010-review` / `prj_52bNvyMES3lKXDMATZq3yPMs6eB9`, team `team_PVgfk8zxTMeeUcglxP59fh17`. Deployment `dpl_EnmBsJmcPTzgLnoGbUmifEEsxb2V`, READY, approximately 5.3-second build. The stable alias is the production environment **of this new isolated review project only**. No official domain was assigned; no existing review project was replaced.

## Delivered

The cover remains the original cinematic entrance, photograph opening into Korean editorial, with the existing top Journal link. Wide viewports now use the visible `dvh` height while the scroll distance stays on `svh`. The final photograph is taller and slightly wider; right typography is modestly enlarged. The image focus and initial photo/wordmark composition remain. Journal never fades away mid-scroll and keeps a 44px-high target. Orientation, visualViewport, pageshow and font readiness refresh measurements. Live reduced-motion changes clear inline animation styles. Portrait photo calculations remain 009.

The Miniature Passage is a short, reversible native-scroll spread between Type 01 and Atelier in Issue 001 and near the end of the 911 essay. Original coupe, wedge and GT WebPs follow separate SVG curves. Their different timing and tangent-dependent poses express curve, speed and long-distance ease. No car is a button; normal links below the artwork lead to Atelier and Visual Culture. Static/no-JS/reduced-motion/short-viewport layouts keep all illustrations, labels, provenance and links. No new miniatures or heavy animation framework were added.

The continuous journal retains independent documents, direct URLs, native anchors, reload and browser history. The existing paper veil is shared on departure/arrival, uses the departing paper colour and lasts 140ms, with its old loading symbol removed. Related stories now lead with a real existing photograph and editorial relationship, preserving sources. Every indexed article has both Issue and Journal return paths. Issue transition sentences are preserved and accompanied by next-chapter links. Existing plate artwork and layouts remain 009.

Journal retains its frontispiece, lead 911, news, Design Atlas, Issue jacket and art invitations. Issue 001 is exposed through the existing section nav. Larger screens get Atelier metadata in the mast; the phone trial was rejected because it harmed spacing. At iPad landscape the feature photo, title and credit fit on the first screen.

## Source map / rebuild

- `creative/cover-art-max-004/cover.css`, `cover.js`, `index.html`: only commissioned cover layout, lifecycle and existing-link adjustments. `photo.css`, fonts and brand/image originals are protected.
- `journal/partials/miniature-passage.html`: authored scene, original assets, route paths and real navigation.
- `journal/assets/continuity010.css`, `continuity010.js`: responsive/static composition and passive-scroll / scheduled-frame geometry, following the 005–006 pattern. No scroll interception or permanent animation loop.
- `scripts/build_world_continuity.py`: inserts the authored scene into 911 idempotently. `build_issues.py` inserts it before the small chapter and generates next-chapter links. `build_design_atlas.py` renders photo-led related stories from unchanged metadata.
- `scripts/build_journal_navigation.py`: attaches shared 010 assets to active pages; `publish.py` invokes the new source helper. `journal/templates/giulia-body.html` preserves Giulia's authored closing while using the shared related composition.
- `journal/index.html`: authored Journal mast and existing navigation refinement; generated invitations still come from Issue data.
- `journal/assets/travel.css`, `travel.js`: existing document navigation and paper veil, with consistent arrival/history handling.
- `scripts/capture_world_010.cjs`, `build_world_review.py`, `verify_world_010.cjs`: developer capture/review/verification utilities. Site runtime requires no Node dependencies.

```sh
python3 scripts/publish.py check
python3 scripts/publish.py build
python3 scripts/publish.py preview --port 8000
python3 -m unittest discover -s scripts -p test_publishing_008.py -v
node scripts/verify_world_010.cjs
```

The CLI remains explicit and never publishes statuses or deploys. Check, build and preview pass; repeated builds are byte-identical. Draft protection, source/reference validation and existing publication safety tests pass. Local destinations/anchors pass. All old 911, F40, Type 01 and Giulia paragraphs remain present. Content, Issue, news and source-manifest JSON are unchanged.

## Review / verification

[WORLD_010_VISUAL_AUDIT.md](WORLD_010_VISUAL_AUDIT.md) records diagnosis, accepted and rejected layouts, actual screenshot observations and reproduction. BEFORE is a detached untouched worktree at the exact 009 HEAD, not reconstructed artwork. The room supports Chromium/WebKit and all six commissioned sizes, plus Issue, related stories and Atelier at 390 and 1180. The Passage is explicitly identified as a new scene without a fake 009 equivalent.

`world-010-review/verification/checks.json`: six-size route/viewport checks, forward/reverse path equality and reserved bounds, orientation and height simulation, native direct links/reload/history, live reduced motion and no-JS/short fallbacks, both engines. `regression-008/checks.json` and `regression-006/checks.json`: existing Issue, search, article motion, modal, news, menu/history and fallback regression passes. The 006 source assertion was narrowed only for the cover files intentionally commissioned here; original imagery/focus/brand/fonts/motion protection remains.

`world-010-review/deployed/`: public HTTPS verification and byte comparison. HTML, new motion/style files, cover code and review images match committed source. `deployment-result.json` records the release; `preservation.json` records protected asset hashes and original manuscript paragraphs; `publishing.json` records stable regeneration. No screenshot itself is treated as proof of aesthetic quality; the actual screens were opened and edited.

## Preservation and remaining limits

Main, COVER LIVE, 005–009 and the restored prior 010 experiment remain at their original remote heads. See `world-010-review/protected-branches.json`. No force push, official-domain change or existing deployment replacement. Original miniatures, photographs, source/rights data, wordmark/cedilla and Cinematic World assets are byte-identical; the new branch contains only the scoped implementation and evidence.

**Physical iPad Safari and iPhone Safari remain untested.** Playwright WebKit 26.5 is engine evidence, not Apple hardware. Browser toolbar motion, older iOS, safe-area behaviour on actual devices, battery/thermal and real touch momentum remain unverified. `100vh` is the wide fallback for browsers without `dvh`, but those older versions were not tested. Next acceptance should inspect cover start/middle/end and orientation with actual Safari chrome, then the Passage on phone and iPad hardware. No further design change should be made merely to satisfy an emulated result if it harms the original composition.
