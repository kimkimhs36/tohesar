#!/usr/bin/env python3
"""TOHEŞAR 01 source-locked 2600px PNG candidate (offline, no supplier uploads).

Corrects the *visible ink pixel count* of the earlier 2500px-canvas PNG.
Approval, actual on-garment size, fabric printing and payable quote remain UNKNOWN.
Run from any checkout: python object-lab/apparel/01-shadow/vendor-export/export_vendor_visible_ink_2600.py
"""
from __future__ import annotations

import hashlib
import io
import json
from pathlib import Path
from xml.etree import ElementTree as ET

from cairosvg import svg2png
from PIL import Image

ROOT = Path(__file__).resolve().parents[4]
SOURCE = ROOT / "assets" / "wordmark.svg"
DEST = Path(__file__).resolve().parent / "exports" / "01-SHADOW-IVORY-82MM-CANVAS-2600PX-VISIBLE2500-UNAPPROVED.png"
MANIFEST = DEST.with_suffix(".qa.json")
SOURCE_SHA256 = "17d4ac8b0e3f13d8b4e76e5c335a9ee42a603136401d8fa81422b70ae5337d20"
PATH_SHA256 = "b7d36711e60d94465d0587e4a4e4100fba1217a2157865995717ca8c23b0d93d"
SOURCE_BLOB_SHA1 = "e9b299f8d797625b3704103c08ea1aede5c5ea05"
WIDTH_PX = 2600
ART_CANVAS_WIDTH_MM = 82.0
ALPHA_VISIBLE_MIN_PX = 2500
NS = "{http://www.w3.org/2000/svg}"


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def git_blob_sha1(data: bytes) -> str:
    return hashlib.sha1(f"blob {len(data)}\0".encode() + data).hexdigest()


def visible_ink_pass(canvas_width: int, bbox: tuple[int, int, int, int] | None) -> bool:
    if bbox is None or len(bbox) != 4:
        return False
    x0, y0, x1, y1 = bbox
    return (0 <= x0 < x1 <= canvas_width and (x1 - x0) >= ALPHA_VISIBLE_MIN_PX)


def main() -> None:
    original = SOURCE.read_bytes()
    assert sha256(original) == SOURCE_SHA256, "source SHA-256 changed: stop"
    assert git_blob_sha1(original) == SOURCE_BLOB_SHA1, "source Git blob changed: stop"
    svg = ET.fromstring(original)
    assert svg.attrib["viewBox"] == "0 0 1109 255"
    assert svg.findall(f".//{NS}text") == []
    assert svg.findall(f".//{NS}image") == []
    paths = svg.findall(f".//{NS}path")
    assert len(paths) == 1, "expected original single outline"
    assert sha256(paths[0].attrib["d"].encode()) == PATH_SHA256, "original letterforms changed"
    assert paths[0].attrib.get("fill", "").lower() == "#f8f2e7"
    assert paths[0].attrib.get("fill-rule") == "evenodd"

    height = round(WIDTH_PX * 255 / 1109)
    raw_png = svg2png(bytestring=original, output_width=WIDTH_PX, output_height=height)
    rendered = Image.open(io.BytesIO(raw_png)).convert("RGBA")
    assert rendered.size == (WIDTH_PX, height)
    bbox = rendered.getchannel("A").getbbox()
    assert visible_ink_pass(WIDTH_PX, bbox), f"visible alpha <2500px: {bbox}"
    x0, y0, x1, y1 = bbox
    margins = [x0, y0, WIDTH_PX - x1, height - y1]
    assert max(margins) <= 10, f"too much transparent padding: {margins}"
    assert rendered.getpixel((0, 0))[3] == 0
    assert rendered.getpixel((WIDTH_PX - 1, height - 1))[3] == 0
    opaque = rendered.getchannel("A").point(lambda a: 255 if a == 255 else 0)
    assert opaque.getbbox(), "no fully opaque ivory pixel"

    DEST.parent.mkdir(parents=True, exist_ok=True)
    dpi = WIDTH_PX * 25.4 / ART_CANVAS_WIDTH_MM
    rendered.save(DEST, format="PNG", dpi=(dpi, dpi), optimize=True)
    reread = Image.open(DEST)
    assert reread.format == "PNG" and reread.mode == "RGBA" and reread.size == (WIDTH_PX, height)
    assert reread.getchannel("A").getbbox() == bbox

    metrics = {
        "product": "TOHEŞAR / 01 SHADOW UNIFORM",
        "status": "UNAPPROVED_INTERNAL_RASTER_QA_NOT_VENDOR_ACCEPTED",
        "source_svg_sha256": SOURCE_SHA256,
        "source_git_blob_sha1": SOURCE_BLOB_SHA1,
        "source_path_sha256": PATH_SHA256,
        "source_letterforms_changed": False,
        "output_file": str(DEST.relative_to(ROOT)),
        "png_sha256": sha256(DEST.read_bytes()),
        "png_bytes": DEST.stat().st_size,
        "canvas_px": [WIDTH_PX, height],
        "visible_alpha_bbox_px": list(bbox),
        "visible_alpha_width_px": x1 - x0,
        "transparent_margins_px_left_top_right_bottom": margins,
        "nominal_canvas_width_mm": ART_CANVAS_WIDTH_MM,
        "nominal_visible_ink_width_mm_if_canvas_82mm": round((x1-x0)*ART_CANVAS_WIDTH_MM/WIDTH_PX, 3),
        "embedded_dpi_approx": round(reread.info["dpi"][0], 2),
        "prior_2500px_canvas_visible_ink_px": 2487,
        "marpple_2500_visible_ink_recommendation_met": True,
        "actual_logo_print_quote_verified": False,
        "physical_print_or_wash_tested": False,
        "owner_logo_upload_approved": False,
        "vendor_logo_uploaded": False,
        "seller_print_method_verified": False,
        "user_size_approved": False,
        "order_or_payment": False,
        "source_guideline_url": "https://www.marpple.com/kr/faq/image-preparation",
        "disclaimer": "MARPPLE recommends >=2500px excluding transparent padding, not a guaranteed acceptance rule. PNG raster resolution and metadata cannot prove ink opacity, method, exact size or printer acceptance."
    }
    MANIFEST.write_text(json.dumps(metrics, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(metrics, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
