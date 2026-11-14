# OBJECT LAB / 01 SHADOW / 2026-11-10 19:19 KST / run 7

## Verified new change
PR #38 feature branch preflight now fails closed on wrong opaque artwork colors, flattened RGB PNG and nonfinite physical widths; commit 0828801e0b8610eeb228056996ca3356b2e4e1c5. Original script only checked pixel dimensions and alpha bbox, so a same-sized recolored raster could previously pass.

## Tests and limitations
Independent Python/Pillow synthetic fixture execution PASS: correct ivory #F8F2E7 with expected 2500x575 bbox [4,4,2491,569] passed (82.42863mm full canvas for 82mm visible ink); same-bbox injected black opaque pixel rejected; NaN, infinity, negative widths rejected. The exact GitHub committed script was NOT executed; actual proprietary PNG NOT tested this run; browser, print, wash, vendor quote NOT RUN. Near-transparent antialias pixels and master SHA identity remain unverified. The script's existing use of all nonzero-alpha pixels for geometry is intentional but may differ from vendor thresholds.

## Next action
Execute the committed preflight on original 01 SHADOW PNG in an authorized Python/Pillow environment and verify original asset identity SHA, then obtain owner approval separately before any vendor logo upload. Do not infer a real one-piece quote from native placeholder text. No upload/order/payment/merge/deploy performed.
