# 01 SHADOW UNIFORM — measurable 82 mm print preflight (2026-11-10 KST)

**State:** new source-based geometry calculation and reproducible tests; **NOT** a printer-approved proof or an actual supplier image quote. Work started from live PR #38 head `841ecf1e6a6771d157774ab6c16f4ca8d2a68dca`. Latest PR head after this document must be queried dynamically.

## Actual new deliverables
- `print_preflight.py`: deterministic Python 3 standard-library calculation using 82 mm target width, existing 2500×575 PNG dimensions, previously recorded alpha bounding box and supplier SKU 8178 size chart. **No logo file uploaded, read or redrawn**.
- `test_print_preflight.py`: 3 tests for geometry, six-size ratios and explicit non-approval gates.
- An equivalent local calculation and three tests were actually run successfully in a Python 3 environment on 2026-11-10 KST. The committed scripts have the same calculations; **a fresh GitHub checkout execution of committed blobs has not been performed**. Run `python -m unittest -v test_print_preflight` from this directory to independently reproduce.

## Engineering results (internal, not vendor approved)
- Nominal source art: **82.000 × 18.860 mm**, at original 2500×575 pixel ratio.
- Saved alpha bbox `[4,4,2491,569]` implies visible ink **81.574 × 18.532 mm** when the **full image** is scaled to exactly 82 mm. If vendor scales the visible alpha instead of full canvas, values change.
- Pixel density at 82 mm: **774.39 PPI**. This does NOT establish printer resolution or minimum line/stroke acceptance.
- M garment chart: flat chest 58 cm; 82 mm art occupies **14.14%** of nominal flat-chest width. If finished garment is 3 cm narrower (supplier's maximum disclosed size tolerance), proportion becomes **14.91%**. This is a comparison of proportions, **not** a chest placement coordinate or printable-area confirmation.
- All S–3XL chart sizes are evaluated in script. The 1–3 cm vendor garment tolerance is NOT print-placement tolerance.

## Counterexample / falsification check
Hypothesis: '2500 px / 82 mm means the printed ivory mark will be exactly 82 mm wide.' **Rejected**: source image has transparent margins; visible alpha ink is ~81.574 mm under full-canvas scaling. More importantly, a third-party editor may re-scale or crop the uploaded image, and the printer may impose different physical constraints. Therefore no final artwork dimension is certified until an authorized editor proof shows measured placement and vendor print process.

## Blockers, kept distinct
1. Owner has not approved sending original TOHEŞAR mark to supplier; no upload or outreach occurred.
2. Owner has not chosen sample size; M is test-only.
3. Actual printer placement/ink method/ivory opacity and true image-logo total incl. VAT and shipping remain unknown.
4. The actual garment has not been printed, purchased, delivered, fit tested or wash tested.

**Next independent step:** once owner approves original art upload (separately from ordering), inspect measured 82 mm placement in vendor editor, preserve the Ş, record original-logo print fee and supplier-calculated all-in price. Until then, use this geometry test to reject incorrect internal specs; do not claim physical progress beyond preflight.
