# TOHEŞAR Next Generation — recovery log

## Source and branch
- Repository: kimkimhs36/tohesar
- Verified main HEAD: `6c5ec183992332d1d44b35edc8f86ea14f1ce1a5` (matches supplied reference).
- Work branch: `experiment/tohesar-next-generation`. Never push or merge main.
- Original entrypoint files copied verbatim into `archive/next-generation-baseline/` before routing changes. All existing scripts, styles, images, models and licenses remain preserved.

## Completed
- Inspected actual source structure, existing wordmark PNG/SVG, approved cedilla SVG and original 67-point silhouette, original image library, car assets and license provenance.
- Repository is a buildless static site on GitHub Pages; keep native static routing and CNAME.
- Confirmed GitHub CLI authentication and available Chromium/Playwright.

## Art direction
- An independent visual culture publication: warm ivory, ink, mineral blue, vermilion and photographic daylight.
- Home: oversized established wordmark, cinematic image compositions, editorial pacing, curated field notes, distinctive entrances into two live spatial works.
- World: a sunlit architectural harbour with physically grounded vehicle, water, atmospheric distance and composed camera views.
- Symbol: an architectural sculpture exhibition; exact source silhouette, restrained brushed metal, real studio reflections and tactile exploration.

## Current / next
- Create the shared visual system and three new experiences under `next-generation/`.
- Capture baseline and rebuilt desktop/mobile screenshots; verify WebGL, interactions, reduced motion and fallback behavior.
- Commit and immediately push major checkpoints; update this file at each checkpoint.
- Final validation, clean worktree, push branch and open PR against main.

## Recovery
```sh
git fetch origin
git switch experiment/tohesar-next-generation
git pull --ff-only origin experiment/tohesar-next-generation
python3 -m http.server 8080
```
- Latest checkpoint: branch initialization and source preservation.
- If remote push fails: record error here, retain local commit, create `/workspace/tohesar-recovery.bundle` with `git bundle create /workspace/tohesar-recovery.bundle --all`.
- Entry-point restoration: retrieve original routes from commit `6c5ec18` or the preserved archive. Source assets have not been replaced.

## Verification limits
- Physical iPhone Safari is not available. Browser WebKit emulation and mobile Chromium can check compatibility but do not establish physical-device verification.

## Checkpoint 2 — shared foundation
- Added unified ivory/blue/vermilion design tokens, responsive navigation, focus/skip-link and reduced-motion rules.
- Vendored Three.js r180 and used addon dependency closure with original MIT license; no CDN runtime requirement in the rebuild.
- Downloaded local DM Sans/Instrument Serif fonts and preserved both SIL OFL licenses.
- Generated and visually inspected a new bright coastal editorial study; preserved PNG source plus optimized 270KB WebP and generation provenance.
- Baseline browser captures underway in `/workspace/tohesar-evidence/before/`; independent World and Symbol implementations developing in parallel.

## Checkpoint 3 — editorial homepage and live harbour source
- Replaced home composition completely: established image wordmark, new bright coastal cover, substantial introduction, asymmetric visual journal, blue immersive entrance, sculpture entrance and large closing spread.
- Added responsive home styles, accessible opt-in sound control using preserved music, and progressive reveal effects respecting reduced motion.
- Converted local fonts to WOFF2 and retained SIL OFL licenses.
- New harbour scene source created: architecture, procedural materials, water and existing licensed car, shot presets/tour and exploration controls; entry integration in progress.
- Captured all six before desktop/mobile views and baseline reports in `/workspace/tohesar-evidence/before/`. Live site comparison screenshots also captured.
- Important baseline finding: existing World had font 404s; rebuild uses local complete fonts rather than those failing URLs.
- Recovery checkpoint includes in-progress new files; visual QA is next, not yet a final quality assertion.

## Checkpoint 4 — all three routes integrated
- New World and Symbol entrypoints connected to local Three.js modules and new standalone sources. All previous source files stay preserved.
- Symbol implements exact source contour with inward precision bevels, physically based anisotropic brushed finishes, studio environment reflections and a complete sunlit architectural exhibition.
- Both spatial works expose composition presets, drag/touch exploration, keyboard input, zoom, reduced motion and graceful fallback.
- First home browser verification passed resource, image, overflow and keyboard checks. Visual comparison prompted a stronger revision: begin inside the full-height coastal photograph; move the large printed masthead below the cover so the vehicle is present in the first viewport.
- Continuous progress preserved; full cross-route checks and visual refinement are underway.

## Checkpoint 5 — before visual/material refinement
- Real browser QA identified two World rendering faults: mixed indexed/nonindexed construction geometry and water reflection framebuffer feedback. Agent corrected batches to a single geometry representation and removed shared secondary water material.
- First Symbol composition rendered successfully, but its face is visually too uniformly pale. Preserve this working version before refining studio reflections and the shallow face crown within the exact outer contour.
- Fixing finish-control CSS stacking and examining mobile stage fit.
- Homepage's previously nonexistent journal fragment has been removed.
- No visual completion claim yet: screenshots are driving these corrections.

## Checkpoint 6 — evidence-led polish
- World rebuilt geometry and water now render with `gl.getError() === 0`. Refined first shots, environment/car contrast and open gallery depth.
- Added offscreen rendering suspension, static shadow-map reuse and 30fps water updates with frame-timestamp adaptive resolution.
- Homepage revised browser screenshots confirm full photo/vehicle presence in the first viewport on desktop/mobile; full-page content and lazy image loading verified.
- Symbol working visual state is saved before further precise face-surface refinement; improving balanced metallic shading and plinth visibility, with 44px touch controls.
- Playwright WebKit 26.5 runs WebGL2 in this Linux environment. It supplements Chromium checks; it is not a physical Safari device test.
- README documents static preview, verification, credits and recovery. Vendor files marked for clearer code review.

## Checkpoint 7 — settled sculpture and final engine checks
- Final Symbol surface retains the exact planar source silhouette and a precisely beveled inward edge. Removed experimental crown after screenshots exposed triangulation shading artifacts; physical studio reflections now produce continuous silver-to-graphite and clear brushing.
- Independent visual review confirms original 67 outline coordinates unchanged, plinth and contact visible, fan artifact removed, and mobile World vehicle clear of controls.
- Added detail-mode copy suppression so macro study is unobstructed, 44px touch controls, real context restoration environment regeneration and explicit GPU shadow-map release.
- World desktop/mobile interaction checks pass, WebGL0 and no failed resources. World cleanup records zero retained geometry/textures.
- Final 16-check Chromium and 16-check WebKit runs launched; screenshot evidence and reports will be retained in review documentation.
- Capturing actual new canvas images for homepage previews and stable loading/fallback art.

## Checkpoint 8 — integrated real previews and compact mobile fit
- Homepage portals now use captures of the actual new WebGL scenes, exported to small WebP previews. World loading/fallback uses a matching static render; source and ShareAlike attribution recorded.
- Improved heading contrast and readable AI image disclosure; added canonical/social metadata and clear archive restoration documentation.
- Both World and Symbol fit 375×667 screens with all primary controls visible. Safe-area spacing and 44px sculpture touch controls preserved.
- Normal desktop/mobile WebKit scenes, touch/pointer/keyboard controls, fallback and GPU departure cleanup pass.
- A genuine WebKit context restoration fault was identified: deleting a previous PMREM target after native context reset tries to delete objects belonging to the prior context. Both engines now dispose targets during context loss and regenerate them after restore. Fresh rerun underway; no error draining or masking.
- Final screenshots/report packaging and PR creation remain.

## Final verification and handoff checkpoint
- Chromium: 16/16 browser acceptance checks passed.
- WebKit 26.5: all 16 acceptance cases have passing evidence, including fresh reruns of both corrected context restoration cases. Original failing and corrected reports are retained for traceability.
- Final six desktop/mobile review captures inspected after preview integration; no console exceptions/errors or horizontal overflow. Native World field-notes navigation also verified.
- Additional 375×667 portrait and 844×390 landscape captures confirm accessible controls and artwork fit.
- `node tests/source-integrity.mjs` passes: 3 exact original entrypoint archives, all 67 silhouette coordinates exact, 117 original files unchanged.
- Source JS syntax and `git diff --check` pass.
- Verified GitHub Pages is still built from main at `/`; remote main still `6c5ec183992332d1d44b35edc8f86ea14f1ce1a5`. No production merge or deployment performed.
- Durable before/after images, consolidated reports and review instructions are committed under `docs/next-generation/`.
- Remaining release limitation: physical iPhone/macOS/iOS Safari device testing and device performance benchmarks are unavailable; emulated/mobile Chromium and Linux WebKit verification do not establish those results.
- Next: push this checkpoint, open PR against main and record the PR link. No further feature work planned.

## Completed handoff
- Pull Request: https://github.com/kimkimhs36/tohesar/pull/4
- PR base: `main`; head: `experiment/tohesar-next-generation`. Open for review, not merged.
- All authored code, original-source preservation, final visual comparisons, provenance and verification evidence are committed and pushed.
- Final local review captures confirm all three routes after the real preview integration. No remaining feature work or uncommitted implementation is intended.
- Optional local recovery bundle: `/workspace/tohesar-recovery.bundle`; GitHub branch remains the primary durable recovery source.
- To review: `docs/next-generation/REVIEW.md`. To recover: fetch/switch/pull the experiment branch and run the static server commands above.


## Focused art-direction correction — 2026-10-12
- Starting checkpoint: 388e0aa; confirmed origin/main still 6c5ec18. Working only on PR #4 branch.
- Compared committed actual before/after desktop screenshots directly. The new white arcade loses the original wet-road reflections, layered skyline and sunset composition. Rejected that direction instead of claiming an improvement.
- Restored Astra World entrypoint and its unchanged original renderer/materials/camera sequence. Only local Three.js imports, an Index link and current colophon differ. The rejected implementation remains recoverable in Git and next-generation/world.js.
- Kept homepage layout/code unchanged. Symbol retains all 67 contour points, precise bevel and brushed metal; revised gallery to charcoal/brown stone and focused warm light.
- Next: one desktop/mobile capture pass, basic interactions/errors and original asset integrity; update entry posters with actual renders and record comparison. Do not iterate into a new rebuild.
- Recovery: git checkout 388e0aa for pre-correction state; current branch checkpoints are pushed to origin. Never merge/push main.
- Capture pass exposed a pre-existing Astra font URL defect: Korean CSS requested `/assets/fonts/` while binaries lived under `/world/assets/fonts/`. Added identical licensed font copies at the requested URLs; original CSS and files remain untouched. Added the original renderer's MIT Three.js r180 Reflector module to the local vendor closure.
