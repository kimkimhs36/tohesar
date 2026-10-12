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
