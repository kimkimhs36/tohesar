# 01 SHADOW — garment size tolerance overlap / R01 (2026-11-12 KST)

**Engineering interpretation, NOT a seller-certified grading or an owner fit decision.**

## Source and assumptions
Source: `object-lab/apparel/vendor-gates/marpple/VERIFIED-SIZE-CHARTS-4SKU-20261110.json` on this branch. Seller SKU 8178 chart in centimeters:
| Size | Length | Shoulder | Flat chest | Sleeve |
|---|---:|---:|---:|---:|
| S | 68.5 | 52 | 55 | 21 |
| M | 71 | 54 | 58 | 21 |
| L | 73.5 | 56 | 61 | 22 |
| XL | 76 | 58 | 64 | 23 |
| 2XL | 78.5 | 61 | 67 | 24 |
| 3XL | 81 | 64 | 70 | 25 |

Seller's size-chart disclosure mentions 1–3 cm measurement tolerance. Its exact statistical or ± interpretation is **not established**. For a deliberately conservative counterexample, this study models **each finished garment independently at nominal ±3 cm** on each listed dimension. This is a scenario, **not** a claim that every garment actually deviates ±3 cm.

## Counterexample: a larger nominal size is not guaranteed larger on every measurement
For adjacent sizes with nominal difference Δ, independent symmetric ±t intervals overlap by `max(0, 2t - Δ)` cm (where intervals overlap; a zero-length touch is not positive overlap). With t=3 cm:

| S → M dimension | Nominal step | S possible interval | M possible interval | Overlap |
|---|---:|---|---|---:|
| Length | +2.5 cm | 65.5–71.5 | 68–74 | 3.5 cm |
| Shoulder | +2 cm | 49–55 | 51–57 | 4 cm |
| Flat chest | +3 cm | 52–58 | 55–61 | 3 cm |
| Sleeve | 0 cm | 18–24 | 18–24 | 6 cm |

**Falsified assumption:** the nominally larger M tee must have a larger physical flat chest than S. Under this deliberately conservative scenario, an S measuring 58 cm and an M measuring 55 cm would reverse that order. This does **not** establish the real factory tolerance distribution; it demonstrates why nominal size labels alone cannot certify the target silhouette.

## Actual executable verification (local Python, not remote PC or GitHub CI)
A Python Decimal interval calculator was created and executed in an isolated available environment. Initial run: 6 pass / 1 error because nonfinite Decimal comparison raised InvalidOperation rather than intended ValueError. Code corrected by testing `is_finite()` **before** comparing with zero. Re-run: **7/7 unittest PASS**, including chest/length overlap, zero tolerance, negative/NaN rejection, five adjacent size pairs and no-fit-approval state. Local source SHA-256: `ee20c215525479e1892eb555b8422fbdbebc635c59ed4f30558678d3f31061ed`; test SHA-256: `a54d0b5c6c261aa5498a7e31101473c1e39f4bc4a512e0d03f8c15150e3378c5`; generated JSON SHA-256: `8e7abf6540502a65935985df781644351ba757bd0c3d4893d375c7ba0632175e`. Those local generated files were **not** added to this commit. Do not claim GitHub CI ran these tests.

## Actionable first-sample consequence
The owner must measure a personally acceptable reference T-shirt **laid flat** (length, shoulder, flat chest, sleeve) and compare actual desired garment measurements to seller chart; no body measurements or PII need be stored. Choose the sample size after that comparison; M was only a seller editor test, not an approved fit. If the physical sample arrives, record actual garment measurements and wash shrinkage before approving further production.

No brand upload, supplier contact, checkout, payment, main merge, website deploy, or garment fit test. **Owner size: UNSELECTED; physical sample: NOT MADE.**
