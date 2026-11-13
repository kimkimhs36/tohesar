#!/usr/bin/env python3
"""Independent MuPDF visual-raster gate for Sticker 001 R07; no vendor upload."""
import json
import sys
from pathlib import Path

import fitz

PDF = Path(__file__).parent / "exports/STICKER-001-R07-LAYERED-110x40mm-UNAPPROVED.pdf"
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/tmp/sticker-r07-render")
OUT.mkdir(parents=True, exist_ok=True)
doc = fitz.open(str(PDF))
assert len(doc) == 1, f"expected one page, got {len(doc)}"
page = doc[0]
mm = (page.rect.width * 25.4 / 72, page.rect.height * 25.4 / 72)
assert all(abs(x - y) < 0.05 for x, y in zip(mm, (110, 40))), f"wrong physical size: {mm}"
ocgs = doc.get_ocgs()
assert len(ocgs) == 2, f"expected two optional-content layers, got {ocgs}"
names = {x.get("name") for x in ocgs.values()}
assert names == {"인쇄", "반칼"}, f"unexpected layer names: {names}"
pix = page.get_pixmap(matrix=fitz.Matrix(300 / 72, 300 / 72), alpha=False)
assert pix.width >= 1299 and pix.height >= 472, (pix.width, pix.height)
assert len(set(pix.samples[:min(len(pix.samples), 300000)])) > 1, "raster appears uniform in sampled bytes"
# Reject a formally valid PDF that renders no actual ink or cutline. The earlier
# nonuniform-byte sample could pass on white/near-white raster noise alone.
# RGB samples are used only as an internal raster sanity gate, NOT color approval.
channels = pix.n
assert channels == 3, f"expected RGB raster, got {channels} channels"
raw = memoryview(pix.samples)
ink_pixels = 0
magenta_pixels = 0
magenta_min_x = pix.width
magenta_min_y = pix.height
magenta_max_x = -1
magenta_max_y = -1
for pos in range(0, len(raw), channels):
    red, green, blue = raw[pos], raw[pos + 1], raw[pos + 2]
    if max(red, green, blue) < 180:
        ink_pixels += 1
    if red > 170 and green < 130 and blue > 100 and red > green + 60:
        magenta_pixels += 1
        pixel_index = pos // channels
        x, y = pixel_index % pix.width, pixel_index // pix.width
        magenta_min_x = min(magenta_min_x, x)
        magenta_min_y = min(magenta_min_y, y)
        magenta_max_x = max(magenta_max_x, x)
        magenta_max_y = max(magenta_max_y, y)
assert ink_pixels >= 100, f"artwork absent or nearly blank: {ink_pixels} dark pixels"
assert magenta_pixels >= 100, f"cutline absent or not magenta: {magenta_pixels} pixels"
# Reject arbitrary magenta marks in place of the expected inset cutline.
magenta_bbox_mm = [
    magenta_min_x * 25.4 / 300,
    magenta_min_y * 25.4 / 300,
    (magenta_max_x + 1) * 25.4 / 300,
    (magenta_max_y + 1) * 25.4 / 300,
]
expected_cutline_bbox_mm = [5, 5, 105, 35]
cutline_bbox_tolerance_mm = 0.7
assert all(abs(actual - expected) <= cutline_bbox_tolerance_mm
           for actual, expected in zip(magenta_bbox_mm, expected_cutline_bbox_mm)), (
    f"magenta raster is not the expected inset 100x30mm cutline: {magenta_bbox_mm}"
)
png = OUT / "STICKER-001-R07-300DPI-INDEPENDENT-UNAPPROVED.png"
pix.save(str(png))
result = {
    "status": "INTERNAL_RASTER_QA_ONLY_NOT_VENDOR_APPROVAL",
    "source": str(PDF.relative_to(Path(__file__).parents[2])),
    "page_mm": [round(x, 4) for x in mm],
    "layer_names": sorted(names),
    "raster_px": [pix.width, pix.height],
    "dark_ink_pixels": ink_pixels,
    "magenta_cutline_pixels": magenta_pixels,
    "magenta_cutline_bbox_mm": [round(v, 3) for v in magenta_bbox_mm],
    "expected_cutline_bbox_mm": expected_cutline_bbox_mm,
    "cutline_bbox_tolerance_mm": cutline_bbox_tolerance_mm,
    "raster_png": png.name,
    "vendor_approval": False,
    "physical_print": False,
    "spot_color_separation_verified": False,
    "color_calibration_verified": False,
}
(OUT / "STICKER-001-R07-INDEPENDENT-RENDER-QA.json").write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(json.dumps(result, ensure_ascii=False))
doc.close()
