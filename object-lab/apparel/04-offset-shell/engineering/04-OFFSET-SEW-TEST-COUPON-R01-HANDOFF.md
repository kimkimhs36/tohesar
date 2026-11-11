# TOHEŞAR OBJECT LAB — 04 OFFSET SHELL / R01 diagonal seam sew-test coupon

**Status: CUTTABLE TRIAL COUPON ONLY — digital validation PASS, physical test NOT RUN.**

## Why this exists
The 04 OFFSET SHELL R01 original geometry, R02 maker decision and R03 shrinkage sensitivity are already documented. Those are not cut files. This output is a **new full-size A4 exercise coupon** so the proposed diagonal seam can be trial-sewn before a full pattern maker derives the real body block. Do not substitute this coupon for a wearer-sized garment panel or quote it as a production pattern.

## Deliverables
- `04-OFFSET-DIAGONAL-SEW-TEST-COUPON-R01.pdf` — two separate printed A/B trial panels at 1:1 physical scale.
- `04-OFFSET-DIAGONAL-SEW-TEST-COUPON-R01.qa-preview.png` — actually rendered PDF 2x preview.
- `build_04_diagonal_sew_test_coupon_r01.py` — reproducible parametric PDF builder with seam/allowance/notch checks.
- `04-OFFSET-DIAGONAL-SEW-TEST-COUPON-R01-QA.json` — machine-readable actual run receipt.

## Numerically verified on TEAM-BKIT
- Intended **stitch** curve (same A and B): `x=30+150t, y=20t+6 sin(pi*t)` mm, `0<=t<=1`.
- Independent shared A/B sewing walk: **151.9027 mm / 151.9027 mm**, difference **0.0000 mm** within numerical sampling resolution. This is an **invented swatch-only curved path**, not the final full front diagonal.
- A and B sampled seam allowances: **10.0 mm perpendicular**, not just vertical and not a supplier-approved allowance.
- Three registration notches at 25%, 50% (double notch), 75% of walked seam length. Notch ticks are surface marks, not deep cuts into the sample.
- First render disclosed a defect: A seam start extended outside the paper cut outline. Fixed by extending the **cut edges** beyond the two **shorter nominal sewing-line endpoints**, and added explicit point-in-polygon checks for all sampled stitch positions. Rerender inspected visually and passed.
- A4 page geometry **210 x 297 mm** verified by PyMuPDF, preview actually rendered, 100 mm printer check bar included. Actual printer-output length is UNMEASURED.

## Physical testing instructions — NOT YET EXECUTED
1. Print page 1 at **100% / ACTUAL SIZE**, no 'fit to page'; verify the printed 100 mm bar with a ruler.
2. Cut the two separate paper outlines on solid lines, transfer to two candidate 240–260 gsm compact jersey scraps (or mark any substitute as non-representative). Keep panel grain directions documented.
3. Mark the dashed sewing lines and three pairs of registration notches on fabric; do not cut notches deeply. Pin right sides together matching the arc-length notches, sew with a proposed knit-safe four-thread overlock, and try 2.5 mm topstitch only as a separate experiment.
4. Log seam waviness, needle damage, seam appearance, stretch recovery, left/right endpoints, and after-wash mismatch. A clean result on one coupon **does not** approve a full-sized pattern, dual-material shrinkage or factory finishing.
5. Record actual photos and postwash dimensions privately; do not commit addresses or private photos to PUBLIC GitHub without explicit approval.

## Remaining production gates
04 needs a selected size block, actual seam side intersections (do **not** replace them with flat half-chest), complete curved front A/B pattern, actual textiles, seam walk, grain/hem datum, shrinkage and maker approval. No vendor upload, purchase, payment, contact or main merge was performed. 01 SHADOW remains first sample priority, waiting on separate approval to upload original logo to a supplier and verify its actual image-print pricing and positioning.

**Repository continuation:** retain existing PR #38 draft stacked on PR #37. Requery live HEAD before each next commit. Do not branch/rebase/force-push other work or claim this trial coupon is a manufactured sample.
