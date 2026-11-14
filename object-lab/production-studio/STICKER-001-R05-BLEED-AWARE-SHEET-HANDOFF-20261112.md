# Sticker 001 R05 — full-bleed sheet occupancy correction (2026-11-12)

**Material production blocker found:** existing `sticker_sheet_fit.py` computes hypothetical sticker grids from **100×30mm trim dimensions**, while the existing print export is **106×36mm** after 3mm bleed on every side. Treating trim counts as printable artwork counts overstates capacity. This is a packing arithmetic issue, not an allegation about any supplier's printing system.

**New separate source-locked geometry gate:** [sticker_001_bleed_aware_sheet_gate_r01.py](./sticker_001_bleed_aware_sheet_gate_r01.py), plus [six test cases](./test_sticker_001_bleed_aware_sheet_gate_r01.py). The original script and original Ş vector/PNG are unchanged. The new gate explicitly accounts for the full-bleed footprint, sheet margins and an additional gap *between full-bleed footprints*. Counts are for homogeneous orientations only, not mixed nesting or vendor-validated print sheets.

| Hypothetical 140×200mm sheet | Trim-only normal | 3mm-bleed normal |
|---|---:|---:|
| 0mm margin / 0mm gap | 6 | 5 |
| 5mm margin / 3mm gap | 5 | 4 |
| 5mm margin / 5mm gap | 5 | 4 |
| 10mm margin / 5mm gap | 5 | 4 |

Independent JS floor arithmetic validated the four scenarios in this run. Python test source is written for the repo; **do not mark Python unittest or CI PASS until actual execution**. [Machine-readable calculation](./STICKER-001-R05-BLEED-AWARE-SHEET-QA-20261112.json).

**Next gate:** supplier's actual sheet printable area, bleed adjacency policy, contour-cut format and price; do not send logo or order without distinct owner authorization. 01 SHADOW wearable sample remains first business priority.
