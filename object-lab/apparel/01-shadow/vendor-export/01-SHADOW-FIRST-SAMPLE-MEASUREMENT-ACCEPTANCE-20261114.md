# 01 SHADOW / first physical sample measurement gate — 2026-11-14

**Status: PRE-SAMPLE SPECIFICATION ONLY. No physical measurements, supplier approval, owner-selected size, upload or order.**

## Why the first sample must be measured
The seller's SKU 8178 size chart explicitly permits **1–3 cm manufacturing measurement variation**. Therefore a photograph or editor mockup cannot certify chest fit or precise left-chest wordmark position. Do not convert a nominal seller chart into a guaranteed finished garment.

Source: `object-lab/apparel/vendor-gates/marpple/VERIFIED-SIZE-CHARTS-4SKU-20261110.json`, seller [SKU 8178](https://www.marpple.com/kr/product/detail?bp_id=8178). Chart snapshot dated 2026-11-10; not a fresh stock check.

## Physical garment measurement baseline (centimeters; garment laid flat)

| Size | Length | Shoulder | Half-chest | Sleeve | Nominal chest circumference = 2 × half-chest |
|---|---:|---:|---:|---:|---:|
| S | 68.5 | 52 | 55 | 21 | 110 |
| M | 71 | 54 | 58 | 21 | 116 |
| L | 73.5 | 56 | 61 | 22 | 122 |
| XL | 76 | 58 | 64 | 23 | 128 |
| 2XL | 78.5 | 61 | 67 | 24 | 134 |
| 3XL | 81 | 64 | 70 | 25 | 140 |

**Caution:** Double-width circumference is a calculation, not the seller's independently measured circumference. If a half-chest varies by ±1–3 cm, the doubled estimate varies by ±2–6 cm. This is a conservative interpretation of the seller's generic 1–3 cm measurement disclaimer, **not** a proven per-dimension tolerance or QC pass limit. Fit requires owner-selected size and a worn sample.

## Print acceptance gate: original 82 mm wordmark
- Requested artwork width **82.0 mm** = **8.2 cm**. Aspect ratio of the existing 2500 × 575 PNG gives expected height **18.86 mm** if image boundaries coincide with the art boundaries (82 × 575 / 2500). Transparent padding or cropped visible-ink bounds can change the *visible* dimensions; measure the visible print, not just file dimensions.
- At a target physical 82 mm width, source 2500 px corresponds to **774.39 pixels/inch** (2500 × 25.4 / 82). This is a *calculated effective pixel density*, not a printer's verified resolution, ink method, or vendor guarantee.
- Measure actual printed visible width with a millimeter ruler at three positions, recording min/max and any skew; record original `Ş` legibility, ivory opacity on charcoal, print edge, underbase/transfer halo, cracking, and placement referenced to the *actual garment seam*. **No vendor-approved print-size tolerance is known.** Do not invent PASS at ±1 mm.
- Before and after a first care-label-compliant wash: photograph against a ruler, measure length, half-chest and print width in mm; calculate dimensional change as `100 × (after − before) / before`. Report results, not assumed shrink percentages. A single wash is an initial check, not durability certification.

## Release decision
1. **Current: HOLD.** Sample size not approved; image-logo printing/placement/total payable price unverified.
2. With separate permission for **third-party original-art upload**, obtain editor/vendor confirmation of 82 mm visible width, physical seam offsets, Ş, print method, VAT/shipping-inclusive one-piece price. Upload approval does not authorize cart/order/payment.
3. With separate explicit sample-order approval, obtain garment and perform above physical QA. Record photos and numeric measurements; only then decide whether to revise size, placement, art or supplier.

**Arithmetic check:** 82 × 575 / 2500 = 18.86 mm; 2500 × 25.4 / 82 = 774.3902 px/in. No physical sample test run.
