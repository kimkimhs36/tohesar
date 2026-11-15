# 01 SHADOW — 82 mm visible-ink vs image-canvas correction (2026-11-14)

**Status: internal preflight only; NO supplier upload, print approval, order or physical measurement.**

## Critical finding
The source-locked 2500×575 RGBA PNG has alpha bounding box `[4,4,2491,569]` (Pillow's right/bottom coordinates are exclusive), as recorded in `README-MARPPLE-01-SHADOW.md`. Consequently, the visible nontransparent wordmark spans **2487 px**, not the full 2500 px image canvas. A vendor editor that scales the **canvas** to exactly 82.000 mm would produce a visible-ink width of **81.5736 mm**. This falsifies the assumption that an 82 mm image canvas necessarily yields an 82 mm visible wordmark.

| Quantity | Calculation | Result |
| --- | --- | ---: |
| Visible alpha width | 2491 − 4 | 2487 px |
| Visible ink at 82 mm canvas | 82 × 2487 / 2500 | 81.5736 mm |
| Canvas width for 82 mm visible ink | 82 × 2500 / 2487 | **82.42863 mm** |
| Left transparent offset at corrected scale | 82 × 4 / 2487 | 0.13189 mm |
| Right transparent offset at corrected scale | 82 × 9 / 2487 | 0.29674 mm |

**Important qualification:** The bbox includes any nonzero-alpha antialias pixels; it is not a metrologically agreed visible edge. A print vendor might crop transparency, rasterize with a different threshold, rescale art, or apply a print-process tolerance. Thus **82.42863 mm is a calculated canvas-setting candidate, not a vendor-approved print dimension**. Never silently modify the source logo, crop it, or replace the previously issued 82 mm nominal canvas scale card. Record both canvas and visible-ink targets in the final proof.

## Required actual proof before a one-piece sample
1. In the authorized vendor proof workflow (only after separate owner approval to upload brand art), establish whether the editor width control refers to full canvas or auto-trimmed opaque art.
2. If canvas-based, try **82.43 mm canvas width** as the candidate for an 82 mm alpha-bbox width; if trim-based, use **82.00 mm visible width**. Capture a dimensioned vendor proof and verify placement from garment reference points.
3. Confirm ivory rendering/underbase on washed charcoal, print process, available printable region, price including all fees, and owner-selected size. Do not equate the older generic-text +₩8,000 observation with the logo-image quote.
4. HOLD physical sample release until separate upload/order/payment permissions and a vendor-confirmed proof. Actual fit, wash and physical width tests: **NOT RUN**.

## Reproducibility
```python
from decimal import Decimal
bbox_left, bbox_right, canvas_px = 4, 2491, 2500
ink_px = bbox_right - bbox_left
ink_at_nominal = Decimal(82) * ink_px / canvas_px
canvas_for_ink = Decimal(82) * canvas_px / ink_px
assert ink_px == 2487
assert ink_at_nominal == Decimal('81.5736')
assert Decimal('82.4286') < canvas_for_ink < Decimal('82.4287')
print(ink_at_nominal, canvas_for_ink)
```

Evidence basis: existing source-locked PNG dimensions/alpha bbox from `object-lab/apparel/01-shadow/vendor-export/README-MARPPLE-01-SHADOW.md`. The calculations were independently executed in Python Decimal on 2026-11-14; **no vendor browser or physical sample test was run**.
