# 04 OFFSET SHELL — differential-shrinkage seam walk gate R03
2026-11-11 · Internal engineering hypothesis test · NOT A CUT FILE

## Critical assumption falsified
Equal **prewash** panel A/B diagonal sewing-line walks do **not** ensure a matched seam after washing if the two fabric panels shrink differently. This is especially consequential for the diagonal join and the proposed two-tone A/B material treatment.

With equal hypothetical 620 mm sewn walks, A lengthwise shrinkage 2% and B 3%:
- A after wash = 620 × 0.98 = **607.6 mm**
- B after wash = 620 × 0.97 = **601.4 mm**
- Predicted mismatch = **6.2 mm**, exceeding the existing *provisional internal* ≤2 mm walk-difference target.
- Equal 2% shrinkage would yield 607.6 mm for both, mismatch 0 mm.

This is a **linear engineering sensitivity calculation, not a measured garment or verified factory tolerance**. Grain direction, fabric relaxation, curvature, topstitch constraint, differential stretch and sewing sequence can change the real outcome. In particular, nominal fabric composition/GSM alone cannot establish shrinkage compatibility.

## New maker decision rule
Before cutting, obtain physical swatch shrinkage measurements in the **direction tangent to each diagonal sewing line**, not just vertical body length. Measure both A and B walks on actual seam lines (exclude 10 mm allowances). Record initial lengths L_A/L_B and direction-specific shrinkage s_A/s_B; compute predicted mismatch:

`abs(L_A * (1 - s_A/100) - L_B * (1 - s_B/100))`

Use **≤2 mm only as a provisional internal screening target** for one front seam, never as production acceptance. A numerical pass is insufficient for cutting: physically walk curves, check notches and grain, settle hem 710 mm datum, inspect seam puckering and test sewn/washed toile. If shrinkage differs, consider matching materials, pre-shrinking or reengineering seam and process; do **not** silently offset panel lengths to game the formula.

## Deterministic code QA actually executed
Local Python stdlib unit test suite: **6/6 PASS** (missing data holds; equal shrink passes; 2%/3% differential fails with 6.2 mm; small initial difference; invalid/nonfinite inputs; unresolved hem). Test code is available as an accompanying local artifact in this run, but **is not committed here**; this markdown is the committed decision record. No browser, patternmaking, swatch, vendor UI or physical test executed in this run.

## Status and exact next action
**HOLD / NO CUT**. Maker must record actual A/B swatch directional shrinkage, selected physical size block, actual curved sewing-line walks and hem datum. This note does not approve art upload, vendor contact, sample purchase, production or main merge. The 01 SHADOW actual logo upload and order gates remain independently blocked on owner approval.
