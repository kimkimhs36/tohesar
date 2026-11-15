# 01 SHADOW - R01 paper placement gauge | 2026-11-11 KST

**STATUS: DIGITAL PDF/RUN-TIME QA PASS; PHYSICAL PRINT / FIT / VENDOR PROOF NOT RUN.**
This is a tangible **paper-placement trial**, not another approved apparel mockup or a manufacturer-ready logo upload file. Use the original RGBA PNG for any later vendor-approved print submission, **not this flattened paper PDF**.

## Deliverables (same folder)
- `01-SHADOW-82MM-PAPER-PLACEMENT-GAUGE-R01-20261111.pdf` - 1:1 A4 paper cutout + 100 mm printer calibration scale + 180 mm lateral position gauge.
- `01-SHADOW-82MM-PAPER-PLACEMENT-GAUGE-R01-20261111.qa-preview.png` - real 2x PyMuPDF raster preview of the PDF.
- `build_shadow_paper_placement_gauge_r01.py` - reproducible reportlab/Pillow/PyMuPDF builder, original PNG SHA guard, PDF A4 and embedded-image geometry checks.
- `01-SHADOW-PAPER-PLACEMENT-GAUGE-R01-QA.json` - actual executed machine QA and hashes.

## Verifications actually performed on TEAM-BKIT PC
- Checked GitHub live PR #38 original transparent PNG bytes against local copy: **EXACT MATCH**, SHA256 `10eb8c3f582039bca54b8313c0e6a91dad99202e0265c600feef0a73ec75bd07`.
- Original PNG 2500 x 575 RGBA, alpha bbox [4,4,2491,569], no edits to it.
- Built PDF using actual logo image at **82.000 mm box width** (the visible pixel-edge width differs slightly). Page = real A4 210 x 297 mm.
- Machine QA PASS: input SHA/alpha, rendered A4 PDF page dimensions, embedded PDF image width, document text, 2x raster creation.
- Preview image inspected visibly: original Ş intact, cutout and calibration ticks visible, no clipping.

## Paper test for the owner (NOT DONE)
1. Print **A4 at Actual Size / 100%**, with no 'fit' or automatic scale.
2. Check the 100 mm printed ruler against a physical ruler. If incorrect, discard paper and correct printer scaling; **do not** rely on PDF metadata alone.
3. Cut along the 106 x 49 mm charcoal rectangle, hold it on a washed charcoal shirt, and assess scale at a **candidate** 120 mm from garment center to logo center, toward wearer's left.
4. Adjust the lateral/vertical positioning by physical trial. **Vertical neck datum remains UNVERIFIED**; 120 mm is an unapproved candidate, not a vendor position guarantee.
5. Decide the aesthetic and owner garment size separately. Only then, with explicit permission for third-party original artwork upload, test supplier native logo quote and placement.

**Not done:** actual printer output, paper measuring, physical on-shirt fit, Marpple original image upload, material/print method acceptance, tax-inclusive quote, purchase, payment, main merge, deploy, vendor contact.

**No new branch, no changes to main, no rewrite of original art.** Continue on existing PR #38 feature branch only, recheck live remote HEAD before making any new commit.
