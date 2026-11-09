# TOHEŞAR / 04 OFFSET SHELL — diagonal seam engineering decision R02
**2026-11-10 KST · Maker-facing, internal preproduction · NOT CUTTABLE / NOT APPROVED / NO ORDER**

## Why this work now
01 SHADOW is blocked on supplier-original-image proof and narrow owner authorization. A fourth 01 quote validator or logo mockup would not move manufacturing forward. This note resolves a distinct 04 OFFSET SHELL engineering ambiguity: the R01 sketch is a design illustration, while the POM table lists **HPS-to-diagonal-side heights** and a half-chest at a different vertical location. The sketch must not be used to cut A/B panels by scaling pixels.

## Source provenance (read, not re-created)
- R02 branch `object-lab/apparel-first-drop-r02-20261109`, `object-lab/apparel/first-drop/05_OFFSET_SHELL_ENG/04-TECH-SPEC-DRAFT.json`: wearer-left diagonal side at HPS 395 mm, wearer-right at 270 mm; 10 mm seam allowance proposal, 25 mm hem turn, right hem extension 16 mm; 78 mm artwork, 55 mm from left side seam, 105 mm above finished hem.
- `04-PROPOSED-POM.csv`: HPS-to-hem 710 ±10 mm, half-chest 610 ±10 mm, half-hem 605 ±10 mm, diagonal side points 395 ±10 / 270 ±10 mm; all actual measurements blank. `04-SEWING-ORDER.csv` already asks maker to walk A/B diagonal seams; this note specifies *how to validate* the missing geometry.
- `04-FRONT-BACK-ENGINEERING-R01.svg`: illustration explicitly labelled NOT CUT FILE. Its graphic diagonal angle is NOT a verified physical pattern slope.

## New geometry check — what can and cannot be concluded
Let `x` be the finished *seam-line* horizontal distance between the diagonal join's two side intersections, not the upper chest width or the cut-edge width. Let `Δy=395-270=125 mm` be the proposed side-height difference. **Only if** the seam-line is a straight segment on a flat, unstrained front and the two HPS measurements share a common horizontal reference, the seam-line length is `L=sqrt(x²+125²)` and angle to horizontal is `atan(125/x)`. A nonstraight curved join requires walking its actual curve, not this formula.

| Hypothetical front seam-line width x | Straight seam length L | Angle | Length over horizontal |
|---:|---:|---:|---:|
| 550 mm | 564.03 mm | 12.80° | 14.03 mm |
| 605 mm | 617.78 mm | 11.67° | 12.78 mm |
| 610 mm | 622.68 mm | 11.58° | 12.68 mm |
| 650 mm | 661.91 mm | 10.89° | 11.91 mm |

**610 mm is the garment's flat half-chest width, a plausible reference for one front panel, but NOT a measured width at the diagonal join.** The diagonal crosses the torso below the chest POM line; taper, seam intersection, curvature and asymmetry can change `x`. In particular, DO NOT double the half-chest width to 1220 mm: that is the full body circumference, not the width of one front diagonal seam. No final length, angle, or seam placement is approved by this table. Do not add 10 mm seam allowances to the diagonal centerline length as a substitute for walking the actual offset cut edges.

## Factory decision procedure — R02 first pattern-maker handoff
1. Select and label a physical size block and washed fabric swatches first. R01 BLOCK 0 is a reference, **not a wearable S/M/L grading system**. Record garment fiber %, knit structure, GSM and before/after wash dimensions for both A and B fabrics; different shrinkage can distort the diagonal.
2. Draft finished front outer contour and shoulder/HPS landmarks. Measure the *actual* body width at the two diagonal side intersections; record left/right HPS datum consistency and hem shape. Mark the intended 395/270 mm side seam points with 10 mm tolerance targets, not as arbitrary pixels.
3. On the **sewing line** (not raw cut edge), record panel A lower diagonal curve length and panel B upper diagonal curve length independently. Their walk lengths should match **within a provisional 2 mm for one front**, unless intentional controlled easing is explicitly documented. This 2 mm is an internal prototype target, NOT a vendor standard. Record actual `x`, curve shape, notch coordinates, and whether differential stretch/easing is intended.
4. Offset both sewing lines for a provisional 10 mm seam allowance, then check that the allowance offsets do not self-intersect or change intended seam registration at side seams. Verify notches align after folding/overlocking and the stitch line stays on the marked path. No cut until maker signs off.
5. Resolve hem extension ambiguity: proposed wearer-right 16 mm asymmetric extension vs `HPS-to-hem 710 ±10 mm`—define whether 710 is the baseline hem, longer hem, or center-front hem. **Do not grade or sew from an unspecified datum.** Proposed 25 mm hem turn is a separate allowance, not part of finished HPS length.
6. Check lower panel B's available printable area against actual diagonal seam, hem and side seam. The 78 mm original vector art's proposed lower-edge clearance is 105 mm above the **local finished hem**; its left edge is proposed 55 mm from the left finished side seam. Require a physical art bounding box, minimum print-to-seam clearance chosen with printer, and photo proof; do not assume 55 mm is sufficient.
7. Prototype stitch with both washed swatches: 4-thread overlock + 2.5 mm topstitch *trial* only. Inspect puckering, curling, stretch recovery and differential shrinkage. Measure actual finished POM after pressing and after wash. Record failures before authorizing another garment.

## Required maker measurement record (blank until actually measured)
```csv
field,unit,proposed_or_required,actual,verified_by,status
block_size,text,UNSELECTED,,,BLOCKED
A_fabric_gsm,gsm,240-260 target,,,UNMEASURED
B_fabric_gsm,gsm,240-260 target,,,UNMEASURED
A_shrinkage_length_pct,%,unknown,,,UNMEASURED
B_shrinkage_length_pct,%,unknown,,,UNMEASURED
diagonal_left_HPS,mm,395 ±10,,,UNMEASURED
diagonal_right_HPS,mm,270 ±10,,,UNMEASURED
diagonal_finished_width_x,mm,unknown,,,UNMEASURED
A_diagonal_sewing_line_walk,mm,unknown,,,UNMEASURED
B_diagonal_sewing_line_walk,mm,unknown,,,UNMEASURED
A_B_walk_difference,mm,provisional ≤2,,,UNMEASURED
hem_710_datum,text,UNRESOLVED,,,BLOCKED
right_hem_extension,mm,16 proposed,,,UNMEASURED
artwork_print_to_join_clearance,mm,printer-dependent,,,UNMEASURED
artwork_print_to_hem_clearance,mm,105 proposed,,,UNMEASURED
```

## Acceptance gate
**HOLD / NO CUT** until size block, two actual fabric samples, side point datum, diagonal sewing-line walks, hem datum, seam allowance/notch details and printable clearance are measured and approved by a pattern maker. This file is an engineering decision brief, not a paper pattern or a factory quotation. No artwork sent externally; no purchase, production or vendor contact authorized.

## Next exact step
With available pattern-making capability, create **one** actual 04 paper toile / full-size front A/B seam-line draft from a selected physical size block, walk both seam lines and enter actuals above. If no pattern maker or materials are accessible, resume 01 only when owner grants *separate* supplier-logo upload permission; do not repeat quote validators.
