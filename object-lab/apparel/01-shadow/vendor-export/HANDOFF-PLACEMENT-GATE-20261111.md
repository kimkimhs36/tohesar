# 01 SHADOW physical placement gate — 2026-11-11

## New deliverable
- `01-PLACEMENT-MEASUREMENT-GATE-20261111.py` calculates physical logo width from a ruler and logo measured in the SAME flat image plane. Formula: logo_width_mm = logo_px * ruler_mm / ruler_px. Uses decimal arithmetic and checks finite positive measurements.
- `test_01_placement_measurement_gate_20261111.py` covers exact 82mm, over/under-width, proportional image scaling, margins, invalid values and release flag.
- Independent local prototype executed 7/7 PASS; committed GitHub version has NOT been run after commit. Browser/vendor/physical print tests NOT RUN.
- Provisional ±1mm width tolerance is an internal QC suggestion, NOT a vendor or owner-approved tolerance. A screen screenshot is not a physical ruler measurement; photograph must be undistorted and coplanar, with perspective correction if needed.
- The 82mm nominal width is unchanged; official TOHEŞAR Ş artwork is not modified or uploaded. No price/size/printing method/order is approved.

## Next real blocker
Obtain permission for original logo upload to vendor editor (separate from purchase approval), then obtain a true 82mm print proof with a coplanar ruler or supplier dimensions, seller-calculated image-inclusive total including tax and shipping, and owner-selected garment size. If unavailable, hold release. No order/payment/contact without explicit approval.
