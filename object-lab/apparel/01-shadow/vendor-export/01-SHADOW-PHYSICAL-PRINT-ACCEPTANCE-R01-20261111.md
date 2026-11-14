# 01 SHADOW — physical print acceptance card R01 (2026-11-11)

Status: **PROPOSED INTERNAL QC; NOT SUPPLIER-APPROVED / NOT PRINTED / NOT ORDERED**. This is a measuring protocol, not an authorization to upload TOHEŞAR artwork. First-sample priority remains SKU 8178, washed charcoal 275gsm cotton, with the unchanged original ivory Ş mark.

## A. Dimension chain — falsifiable, not a mockup

Source raster is **2500 × 575 px RGBA**; intended art canvas width **82.00 mm**. The documented nontransparent alpha bounding box is **x=4..2491 inclusive**, y=4..569 inclusive. Therefore: nominal canvas height = 82×575/2500 = **18.86 mm**; nominal visible horizontal ink span = 82×2488/2500 = **81.6064 mm**; nominal visible vertical ink span = 82×566/2500 = **18.5648 mm**. Pixel-to-mm = **0.0328 mm/px**; nominal effective density = **774.39 pixels/inch**. These are *source arithmetic*, not a vendor-verified physical result. A printer may trim transparent padding, change scaling or resample.

**Critical falsification test:** a print can have the correct 2500-pixel raster yet be physically **100 mm wide** if the editor scales it to 100 mm; resolution alone does not prove the 82 mm target. Reject any workflow that calls the export '82 mm' based solely on PNG metadata.

## B. Proposed first-sample QC measurement (owner may revise)

- Record seller editor's numeric **physical canvas width in mm**, if supported. Target **82.0 mm**. If editor only provides relative screen pixels, mark **UNVERIFIED**; never estimate from a screenshot without an independent calibrated reference.
- For a delivered sample, lay garment flat, no stretching, 20–25°C after conditioning; place a millimeter ruler adjacent to ink. Record visible mark left/right and top/bottom extrema; photograph ruler and mark in the same plane. Nominal visible width **81.61 mm**, height **18.56 mm**. **Proposed internal screening band ±2 mm on visible width** (79.61–83.61 mm), NOT a vendor tolerance or contractual acceptance; if outside, hold and investigate scaling. A pass on dimensions alone does not approve quality.
- Record horizontal placement using a reproducible garment datum: **front centerline** at chest and the **top shoulder/high-point seam datum**. Measure ink-center offset from centerline in mm and vertical offset from datum in mm. **No numeric vertical placement is approved yet**; don't invent one. Require owner-approved placement proof before order.
- Under diffuse daylight, photograph the full **Ş** including cedilla; inspect tiny gaps, halos, edge stair-stepping, color/opacity and any white underbase. Confirm actual process (DTF/DTG/screen/other) with seller before treating the proof as production-feasible.
- Capture prewash measurements, then wash per *actual supplier care label* and repeat after drying. No durability PASS until actual wash cycle(s) and photos exist. Don't substitute simulated washes.

## C. One-piece quote evidence fields

| Required field | Current state |
|---|---|
| Garment candidate / color | SKU 8178 / charcoal, seller observation only |
| Size / stock at order time | **UNVERIFIED** (M was anonymous QA, not owner choice) |
| Original image-logo upload & print-method approval | **NOT AUTHORIZED / NOT DONE** |
| Exact 82mm position and seller-generated proof | **UNVERIFIED** |
| Original-image print fee / VAT / final shipping | **UNVERIFIED** |
| One-piece total, delivery estimate | **UNVERIFIED** |
| Owner authorization to order/pay | **NOT GRANTED** |

The previously observed ₩15,700 blank, ₩23,700 generic-native-text display, and ₩3,000 basic shipping are **historical test-screen observations**, never a quote for the original logo.

## D. Decision gates

**Before any external artwork upload:** request owner approval specifically for sharing the original mark with the named vendor. **After upload approval only:** capture seller artwork method, 82mm width/position, image-logo total and shipping/VAT without entering checkout or ordering. **Before purchase:** request separate explicit order/payment authorization. **After arrival:** run physical QC above and record evidence. Never label a screen proof a physical sample.

Source evidence: `README-MARPPLE-01-SHADOW.md`, `EDITOR-NATIVE-TEXT-01-05-07-20261110.json`, `VERIFIED-SIZE-CHARTS-4SKU-20261110.json`. Geometry calculated from the documented PNG pixel dimensions and alpha bounds; binary raster not independently re-opened in this run.
