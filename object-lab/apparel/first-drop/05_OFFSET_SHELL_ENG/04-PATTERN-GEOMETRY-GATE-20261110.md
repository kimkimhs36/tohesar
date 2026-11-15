# 04 OFFSET SHELL — pre-pattern geometry and measurement gate (2026-11-10)

**New check on existing R01 technical source; no physical garment, pattern or approved tolerance.** This is an engineering review of the actual `04-TECH-SPEC-DRAFT.json` and `04-PROPOSED-POM.csv`, not a new mockup.

## Quantified BLOCK 0 geometry

| Quantity | Source target | Derived implication |
| --- | ---: | --- |
| HPS to finished hem | 710 mm | provisional body length |
| Diagonal join at wearer left | 395 mm from HPS | 315 mm vertically above hem at that endpoint |
| Diagonal join at wearer right | 270 mm from HPS | 440 mm vertically above hem at that endpoint |
| Endpoint drop difference | 395 − 270 | **125 mm** (12.5 cm) |
| Half chest | 610 mm | nominal 1220 mm flat circumference, **not body fit** |
| Half hem | 605 mm | nominal 1210 mm flat circumference |
| Right-front hem extension | 16 mm | **not** proof of sewn hem shape |
| Side/panel seam allowance | 10 mm | proposed trial, **not** approved factory cutting allowance |
| Lower wordmark | 78 mm wide; 105 mm above finished hem | horizontal placement reference from left side seam 55 mm; logo height and curved-seam clearance **unknown** |

### Critical hypothesis test

**Hypothesis:** The two seam endpoint depths and the nominal width are enough to derive a cuttable diagonal front-panel pattern.

**Falsified.** A straight seam and arbitrarily curved seams can share the same two endpoint coordinates while having different lengths and different seam-edge offsets. Moreover, 610 mm is the *chest* half-width at a defined measurement height, not a measured horizontal distance between diagonal-join endpoints. It must **not** be substituted into a diagonal length calculation. Thus even `sqrt(610² + 125²)` would be a mathematically valid number but **not** a verified seam length. The 10 mm allowance cannot be applied as an automatic outline offset before the true seam curve, grainline, notches, and fabric stretch behavior are specified.

### Production-critical measurement request for patternmaker (internal; no contact sent)

1. Record join endpoint positions relative to **the same HPS datum**, plus their actual x coordinates on the *stitch line* (not cut edge). Confirm whether the stated left/right values describe wearer left/right and whether HPS is a common datum across the garment.
2. Supply **paired stitch-line polylines/curves** for upper A and lower B with matching seam lengths; report each length in mm and specify intended differential/easing. Do not infer seam compatibility from endpoints.
3. Mark grainline, front center, seam notches and the exact diagonal join; distinguish **stitch line** from **10 mm trial cut allowance**. Check join crossing at side seams and 16 mm right hem extension.
4. Place the **original-path** 78 mm ivory wordmark relative to finished hem and left side seam only after checking the *actual lower-panel shape* and all seam/hem allowances. Its 105 mm hem clearance is not a confirmed minimum gap to the diagonal join.
5. Prototype a sewn swatch of the diagonal join and 2.5 mm topstitch on the actual proposed 240–260 gsm compact jersey. Check puckering, stretch recovery, shade shift and laundering before approval.
6. Fill the twelve `Actual mm` fields in `04-PROPOSED-POM.csv` from a real sample. Proposed tolerances in that file are **trial thresholds**, not an approved manufacturer QC standard.

### Test receipt

Static source values cross-checked from the GitHub R01 JSON and CSV. Arithmetic independent check: 710−395=315; 710−270=440; 395−270=125; 2×610=1220; 2×605=1210. No CAD pattern, stitch-length measurement, physical prototype, supplier quote, fabric purchase, sample fitting or wash test was executed.

**Next actual blocker for 04:** obtain the two matching *stitch-line* curves and seam lengths from a patternmaker **only after separate owner approval for vendor contact**. Until then 04 stays a custom cut-and-sew R&D concept, not a printable blank or cuttable techpack.

**First-sample priority remains 01 SHADOW.** Its official logo external upload and order are separate permission gates. This 04 work does not authorize either.
