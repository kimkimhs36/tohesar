# 01 SHADOW — actual original PNG CI receipt gate R03 (2026-11-12 KST)

## What changed
Previous R02 repair allowed the real source's 14,473 slightly off-ivory partial-alpha pixels, while still requiring every opaque pixel to be exact ivory. The actual source was independently decoded, but the existing GitHub workflow checked only broad booleans and could not detect a silent shift in the original alpha edge distribution.

R03 adds `check_shadow_real_png_receipt_r03.py`, `test_check_shadow_real_png_receipt_r03.py`, and wires them into the **existing** `.github/workflows/object-lab-shadow-actual-png-qa.yml` on Draft PR #38. No new workflow, branch, product art or duplicate archive.

The gate now fails if the original Git blob or any measured PNG properties differ: 2500×575; alpha bbox [4,4,2491,569]; 395,012 visible pixels; 379,146 exact opaque ivory pixels; 15,866 partial-alpha pixels, 14,473 non-exact RGB at partial alpha; max partial RGB channel deviation 13; transparent pixels 1,042,488 by difference; alpha coverage 387663.58; effective PPI 774.39 at 82mm; internal max deviation limit 16. It also rejects any false vendor underbase/print/sample claim.

**Execution evidence:** six tests of this exact receipt-checking logic ran on Python 3 in an isolated container and passed (6/6). GitHub committed Python code is newly saved; the actual GitHub Actions workflow result, real original image executed through Pillow, and 11 committed raster regression tests remain **NOT VERIFIED** until a successful job log is inspected. Do not conflate synthetic receipt tests with source-image CI. The workflow's trigger is push on the existing feature branch, but the available commit-workflow search is PR-event-filtered and may miss push runs.

## Next manufacturing blocker
The source art itself remains unchanged. The priority is **01 SHADOW physical first sample**: owner selects size, separately authorizes original TOHEŞAR Ş upload, then actual MARPPLE 8178 editor checks original-image 82mm width/left chest position, method/underbase, itemized one-piece price and tax/shipping. No upload, cart, payment, vendor contact, main merge or physical sample happened.

If CI is unavailable, do not create another preflight: obtain an actual Pillow receipt for the tracked PNG on a permitted runtime, or pivot to 07/05/Sticker 001's unresolved physical manufacturing gate.
