# 01 SHADOW UNIFORM — size-dependent 82 mm print preflight (2026-11-11)

**Status: internal calculation, NOT approved for production.** Source: `object-lab/apparel/vendor-gates/marpple/VERIFIED-SIZE-CHARTS-4SKU-20261110.json`, MARPPLE SKU 8178 snapshot dated 2026-11-10. No new live stock/price/print observation. No logo uploaded.

## The actual sizing problem
An 82 mm original ivory wordmark is fixed in physical width, while the SKU 8178 blank changes substantially between S and 3XL. A generic M mockup cannot stand in for the selected sample size. The seller lists flat chest width, not body chest circumference. Doubling flat width is only a nominal garment circumference approximation, not a fit recommendation or a measured body dimension.

| Size | Garment length cm | Shoulder cm | Flat chest cm | Sleeve cm | Nominal chest circumference cm (2×flat) | 82 mm logo / flat chest width |
|---|---:|---:|---:|---:|---:|---:|
| S | 68.5 | 52 | 55 | 21 | 110 | 14.91% |
| M | 71 | 54 | 58 | 21 | 116 | 14.14% |
| L | 73.5 | 56 | 61 | 22 | 122 | 13.44% |
| XL | 76 | 58 | 64 | 23 | 128 | 12.81% |
| 2XL | 78.5 | 61 | 67 | 24 | 134 | 12.24% |
| 3XL | 81 | 64 | 70 | 25 | 140 | 11.71% |

Formula: `logo_ratio_percent = (82 mm / (flat_chest_cm × 10 mm/cm)) × 100`. Example M: `82/(58×10)×100 = 14.1379…%`. S→3XL changes apparent relative logo scale from 14.91% to 11.71% even if physical logo width stays 82 mm. This is **not** evidence of vendor print-area acceptance or print position.

## Separate decisions (do not infer one from another)
1. **Placement conflict remains unresolved:** prior materials mention left chest and center front. Both are concept alternatives; neither is owner-approved. Do not silently switch the design based on the table.
2. **Owner sample size unselected:** the historical M is only an anonymous editor test. Use the size chart plus a real well-fitting tee measurement before choosing. The seller discloses 1–3 cm manufacturing variation; measured sample can differ from chart.
3. **Vendor print feasibility unknown:** obtain seller-confirmed print-area dimensions for chosen size/position, then check the **actual ink bounding box** and original Ş; do not assume full 82 mm PNG canvas equals 82 mm ink.
4. **Print cost unknown:** generic native-text price is not the original-image quote. No checkout or payment authorized.

## Falsification / counterexample
Hypothesis: a print that looks proportional on M remains visually proportional on every size. **Falsified by chart arithmetic:** 82 mm / 580 mm = 14.14% on M versus 82 mm / 700 mm = 11.71% on 3XL, a 2.43 percentage-point difference. This does not justify auto-scaling the logo; 82 mm remains the design target pending owner approval.

## Reproducibility
All six rows were recomputed with Python arithmetic on 2026-11-11; assertions verified M nominal circumference 116 cm and M ratio 14.14%. **PASS:** table arithmetic. **NOT RUN:** real garment fit, MARPPLE editor image placement, physical print/wash test, live stock/pricing. **Next physical-sample blocker:** owner-approved placement and sample size, followed by vendor print-area proof; separate authorization required before original-logo upload, ordering, or payment.
