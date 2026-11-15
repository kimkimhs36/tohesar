# 01 SHADOW — Reference garment fit gate R01 (2026-11-12 KST)

**A runnable tool, not another nominal size-overlap report. NOT OWNER APPROVED / NOT ORDERED.**

The previous R01 tolerance study showed adjacent sizes can overlap under a hypothetical ±3 cm assumption, but did not give the owner a way to compare an existing comfortable T-shirt to the 8178 size chart. This new executable bridges that practical decision.

## Use without sharing body measurements
Measure a T-shirt already fitting as desired, laid flat, in centimeters, in this exact order: **garment length, shoulder width, flat chest width, sleeve length**. The reference must be garment measurements, not body measurements or a user profile. Example **hypothetical** reference (NOT a real owner's measurement):

```bash
python object-lab/apparel/01-shadow/vendor-export/shadow_reference_fit_gate_r01.py --reference 71 54 58 21
python -m unittest object-lab/apparel/01-shadow/vendor-export/test_shadow_reference_fit_gate_r01.py -v
```

The example matches nominal **M** exactly, so the first-ranked review candidate is M with zero nominal squared deviation. This is a unit-test fixture, **not a size selection**. The program scores six sizes using weighted squared differences (length 1, shoulder 1, flat chest 2, sleeve 0.5), intentionally weighting flat chest more; those weights are **design assumptions**, not seller-provided fit science. It returns per-dimension signed nominal differences, worst absolute deviations under a hypothetical independent ±3cm model, and explicitly false approval, supplier-logo-upload, physical sample and image-logo-quote states. It does **not** choose a real sample size autonomously.

## Execution evidence
- Python stdlib implementation; isolated local execution with **8/8 unittest PASS** after writing the executable and test cases. Test cases cover exact S/M/3XL chart matches, tolerance-only scenario behavior, invalid/NaN/Infinity rejection, all-six ranking, and no automatic owner approval.
- Tests were also rerun after matching the repository filenames locally: **8/8 PASS**.
- GitHub feature branch contains executable and tests; **GitHub Actions CI NOT RUN**, remote TEAM-BKIT was OFFLINE, and actual user garment measurements NOT PROVIDED. No browser/physical print/vendor import was attempted.
- Source size chart: `object-lab/apparel/vendor-gates/marpple/VERIFIED-SIZE-CHARTS-4SKU-20261110.json` (historical 2026-11-10 observation). All six SKU 8178 dimensions were transcribed. This tool is NOT a live stock or pricing query.

## Next action
Use the actual laid-flat measurements of an existing satisfactory T-shirt to review size; then get explicit owner approval for the exact size and for any *separate* third-party original artwork upload. Real 82mm image-logo method/price/placement remain unverified. No vendor logo upload, checkout, payment, order, main merge or production deploy.
