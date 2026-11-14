# TOHEŞAR OBJECT LAB — Sticker 001 R04 opaque-edge binary repair (2026-11-12 KST)

**STATUS: SOURCE-LOCKED PNG EDGE FIX — EXECUTED/TESTED; NOT A VENDOR-APPROVED PRINT FILE OR PRODUCTION SAMPLE.**

## Why a new revision was warranted
The separate existing Sticker 001 draft PR #35 contains R03 centered artwork and real binary 300dpi PNG, plus independent trim-shift numerical audits. Inspecting **actual R03 PNG bytes** exposed 850 semi-transparent pixels: all 425 pixels in each **outermost left and right column**, alpha = 178, despite the intended solid black bleed field. No other interior alpha defect was found. This is an edge-rasterization defect at the export boundary, **not proof of a visible real-world printing failure**; the 3 mm bleed means the specific edge may be cut off. It still defeats the intended all-opaque print background and is safely repairable without changing logo art.

## New material output
- `exports/STICKER-001-R04-OPAQUE-EDGE-106x36-300DPI-UNAPPROVED.png`
  - Real 1252×425px PNG, nominal 106×36mm, stored 300dpi metadata.
  - SHA-256 **f7ceb58fc3110571e622d7ed3e125c68561678622e52861a72557fe0be8f1a76**, 29,622 bytes.
  - Modifies ONLY outermost columns to solid opaque `#10110F`. **Exactly 850 changed pixels.**
  - 531,250 interior pixels remain identical to R03 RGBA bytes; the central ivory TOHEŞAR wordmark, including the original Ş, was not redrawn or modified.
- `repair_sticker_001_r03_edge_alpha_r04.py`: deterministic fail-closed Pillow prepress repair; SHA-256 locks original R03 as **da9043612fa1b2ecf901636683ff89c82e29f8c9a3357818b84de32c3d5201a4** and rejects interior transparency or changed source dimensions.
- `test_repair_sticker_001_r03_edge_alpha_r04.py`: actually executed six standard unittest cases **6/6 PASS**, including negative tests (wrong hash, unexpected inner alpha, wrong size/pattern).
- `exports/STICKER-001-R04-OPAQUE-EDGE-QA.json`: real output hash, actual size/DPI, alpha extrema, source/invariant proof and unresolved production gates.

The R03 PNG and SVG remain unchanged. This R04 is a derived **alternative** for owner/supplier preflight; it is not a new logo, cutline, marketing mockup, or approval of registration tolerance.

## Executed / not executed
- **PASS** local TEAM-BKIT Python 3.12 + Pillow: 6/6 tests, SHA source, pixel mutation invariant (850 only), after-save PNG readback, alpha 255 everywhere, reported dpi ~299.9994, visually inspected raster.
- **NOT RUN** vendor-import/contour-cut test, physical print, cutting accuracy, laminate/matte finish, vehicle paint compatibility, VAT+shipping-inclusive quote, order/payment.
- Actual logo file **NOT** sent to any third-party vendor. No credentials, addresses, PII, user photos, supplier messages, carts or checkout involved.
- This candidate remains on existing Sticker 001 PR #35 feature branch, **not main**, no new branch, no merge or deploy.

## Next distinct real-world blocker
Resolve the selected printer's **actual round-corner radius, contour cutline data format, registration allowance, safe artwork inset**, and one-piece/sheet price without unauthorized original-art upload. R03's 3 mm bleed cannot guarantee arbitrary cutter displacement. The earlier Publog inward-2mm auto-cut route uses different dimensions and must not be silently paired with this 106×36 file. Keep first wearable 01 SHADOW priority: original logo vendor upload and order require separate owner authorization.
