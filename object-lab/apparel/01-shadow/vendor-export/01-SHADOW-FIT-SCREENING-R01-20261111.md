# 01 SHADOW — first-sample fit screening R01 (2026-11-11)

**Decision:** do not treat the anonymous editor test size M as owner-approved. Use actual body/garment measurements before ordering. This is a measurement decision gate, not a fit recommendation or vendor approval.

## Source and conversion
MARPPLE BeCanvas pigment tee SKU 8178 seller size guide, snapshot 2026-11-10 (cm). Chest width is measured **flat**, so nominal garment circumference = 2 × flat width. Supplier's general 1–3 cm measurement variation is not a certified per-measurement tolerance; below we conservatively model ±3 cm on *flat chest width* (thus ±6 cm circumference) and ±3 cm on length. These are screening assumptions, not actual garment measurements.

| Size | Length nominal [±3 cm] | Flat chest | Circumference nominal [±6 cm] |
|---|---:|---:|---:|
| S | 68.5 | 55 | 110 |
| M | 71 | 58 | 116 |
| L | 73.5 | 61 | 122 |
| XL | 76 | 64 | 128 |
| 2XL | 78.5 | 67 | 134 |
| 3XL | 81 | 70 | 140 |

## Measured wearer gate — no personal data in repository
Record **privately**, not in GitHub: body chest circumference B, desired garment ease interval [Emin,Emax], and acceptable maximum garment length Lmax. For each size, calculate nominal ease = 2×flat_chest − B; conservative ease interval = [2×(flat_chest−3)−B, 2×(flat_chest+3)−B]. Length interval = [seller_length−3,seller_length+3].

- **ROBUST_SCREEN:** entire ease interval lies inside desired ease interval AND upper length bound ≤ Lmax.
- **CONDITIONAL_MEASURE:** ease intervals overlap AND lower length bound ≤ Lmax, but not robust; obtain actual garment measurements.
- **EXCLUDE_SCREEN:** no overlap or even the shortest plausible length exceeds Lmax.

**Falsification test with hypothetical inputs only:** B=100 cm, desired ease 10–30 cm, Lmax=76 cm. M nominal ease 16 cm, conservative interval 10–22 cm, length 68–74 cm → ROBUST_SCREEN. S nominal ease 10 cm, interval 4–16 cm → CONDITIONAL_MEASURE. 2XL nominal ease 34 cm, interval 28–40 cm and length 75.5–81.5 cm → CONDITIONAL_MEASURE, **not** EXCLUDE: edge overlap matters. 3XL nominal ease 40 cm, interval 34–46 cm → EXCLUDE_SCREEN. Python Decimal implementation of this model was executed with 10 checks PASS in the working runtime; the local script was **not** committed as part of this record. This hypothetical case is not the owner's body size or size selection.

## Release gate
No size is automatically approved by screening. Compare an existing well-fitting tee measured flat (chest, length, shoulder, sleeve) against the seller's four POMs; confirm chosen size and fit preference with owner, and verify available stock and final print-inclusive quote. Before any original-art upload, obtain separate permission. Before payment, obtain separate approval. Actual 82 mm ivory logo, physical print method, location and wash durability remain **UNVERIFIED**.

**Source:** `object-lab/apparel/vendor-gates/marpple/VERIFIED-SIZE-CHARTS-4SKU-20261110.json`; source observations are time-stamped and not a stock guarantee.
