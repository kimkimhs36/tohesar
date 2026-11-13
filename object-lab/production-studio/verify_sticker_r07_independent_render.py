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
png = OUT / "STICKER-001-R07-300DPI-INDEPENDENT-UNAPPROVED.png"
pix.save(str(png))
result = {
    "status": "INTERNAL_RASTER_QA_ONLY_NOT_VENDOR_APPROVAL",
    "source": str(PDF.relative_to(Path(__file__).parents[2])),
    "page_mm": [round(x, 4) for x in mm],
    "layer_names": sorted(names),
    "raster_px": [pix.width, pix.height],
    "raster_png": png.name,
    "vendor_approval": False,
    "physical_print": False,
    "spot_color_separation_verified": False,
    "color_calibration_verified": False,
}
(OUT / "STICKER-001-R07-INDEPENDENT-RENDER-QA.json").write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(json.dumps(result, ensure_ascii=False))
doc.close()
