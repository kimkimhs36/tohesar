# TOHEŞAR 04 OFFSET SHELL — paired seam engineering handoff
Date: 2026-11-13 KST. Status: UNAPPROVED / NO PHYSICAL PATTERN.

## Actual new result
- Added `offset_seam_pair_gate_r05.py`: reads **measured stitch-line polyline points in millimetres** for upper/lower diagonal front-panel edges; computes separate arclengths, length mismatch and corresponding notch-position mismatch.
- Paired notch fractions are measured along **arclength from the same sewing-direction start**. Rejects NaN, boolean coordinates, zero-length segments, unsorted/invalid notches, negative tolerances, missing points.
- Provisional 2mm seam and notch thresholds are **internal engineering test parameters**, NOT manufacturer-approved tolerances. Even a `REVIEW_ONLY` result does not approve cutting or sewing.
- Independent local Python 3 execution of the authored program and 10 unit tests: **10/10 PASS**; `python -m py_compile` PASS. This was performed in a separate sandbox before committing; **the exact GitHub-downloaded committed bytes were not independently executed**, so committed-byte regression is NOT RUN.
- Critical counterexample: upper straight [0,0]→[100,0] and lower curved [0,0]→[50,30]→[100,0] have identical endpoints but different arclengths; correctly returns HOLD. This falsifies endpoint-only seam compatibility.

## Files / run
- `offset_seam_pair_gate_r05.py`
- `test_offset_seam_pair_gate_r05.py`
- Run from engineering directory: `python -m unittest -v test_offset_seam_pair_gate_r05.py`
- Run measured data: `python offset_seam_pair_gate_r05.py actual-stitch-lines.json`

## Required real next input
The patternmaker must provide **two actual stitch-line curves** (same datum and sewing direction), notch positions and measured fabric response. Neither HPS depths nor the nominal half-chest width uniquely determines a curved seam. No arbitrary points from this test may be passed off as real production measurements. Physical cut, seam allowance, notches, wash and fit remain unverified.

01 SHADOW still has the highest first-sample priority but its original logo upload, size approval and actual 1pc quote are blocked by separate owner approvals. Do not substitute this engineering QA for sample manufacturing. No external upload, vendor outreach, order, payment, main merge or deployment occurred.
