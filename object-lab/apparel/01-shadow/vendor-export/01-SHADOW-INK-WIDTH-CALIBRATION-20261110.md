# 01 SHADOW — artwork canvas vs visible ink width calibration (2026-11-10)

**Status: measured from existing export metadata, NOT supplier print proof.** This is a new preflight geometry gate for the already committed 2500×575 RGBA logo. No brand artwork was sent to a vendor.

## Critical assumption falsified
The export README reports an alpha bounding box of `[4,4,2491,569]` for the 2500×575 image. Pillow bounding boxes use exclusive right/bottom edges. If the editor scales the **full 2500-pixel image canvas** to 82.00 mm, visible ink occupies only `(2491 - 4) / 2500 = 0.9948` of the width, or **81.5736 mm**, not precisely 82.00 mm. Visible left and right transparent margins are 0.1312 mm and 0.2952 mm respectively at this scale. These tiny margins are not a production defect; they matter only when specifying whether 82 mm means *image canvas* or *actual printed ink*.

If the desired **visible ink width** is exactly 82.00 mm, set the editor image-canvas width to **82.4286 mm** *assuming the same alpha bounds are preserved*. This is a calculated candidate, **not** a verified editor setting. Canvas height at 82.00 mm canvas width is 18.8600 mm; at 82.00 mm ink width it is 18.9586 mm. Do not infer printed height from those canvas dimensions.

## Manufacturing preflight decision
- **Preferred instruction:** specify “82 mm visible ivory logo width” rather than an ambiguous “82 mm PNG”. Measure the supplier proof's artwork ink bounds and chest placement with a physical scale or dimension readout. Do not assume PNG pixel density or DPI controls physical width.
- **Position:** left chest; center coordinates relative to collar seam / center front are **UNAPPROVED / NOT MEASURED**. No fixed distance is invented. Ask for exact seller printable-area boundaries and choose placement on a real size after approval.
- **Print method:** UNVERIFIED. Confirm method, ivory opacity/underbase on washed charcoal, ability to preserve the cedilla on **Ş**, and wash-care durability. No claims of physical quality before a sample exists.
- **Tolerance:** vendor's garment measurement tolerance of 1–3 cm applies to garment dimensions, **not** logo registration or print-width tolerance. Do not misapply it. Require a supplier-specific printing tolerance before accepting artwork proof.
- **Approval boundary:** original art upload, purchase, payment, vendor contact and owner size selection remain separate explicit gates.

## Reproducible check (independent arithmetic)
```python
from math import isclose
canvas_px, x0, x1, nominal_mm = 2500, 4, 2491, 82
visible_px = x1 - x0
ink_mm = nominal_mm * visible_px / canvas_px
canvas_mm_for_82_ink = nominal_mm * canvas_px / visible_px
assert visible_px == 2487
assert isclose(ink_mm, 81.5736, abs_tol=1e-8)
assert isclose(canvas_mm_for_82_ink, 82.4286, abs_tol=0.0001)
print(ink_mm, canvas_mm_for_82_ink)
```

**Test boundary:** arithmetic checked in automation JavaScript; PNG was **not** independently decoded or visually inspected this run, and no seller browser test ran. The alpha bounds are sourced from the existing exporter README, not remeasured here. Next real blocker: owner permission for third-party original-logo upload, followed by editor scale/placement and all-in quote, with no checkout.
