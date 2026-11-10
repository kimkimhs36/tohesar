#!/usr/bin/env python3
"""Sticker 001 R03 exact-source, trim-centered PNG generator. INTERNAL / UNAPPROVED.

Render a true 300dpi 106x36mm provisional-bleed file. No network, seller upload,
purchase, checkout, vendor approval, or implied physical cutline.
"""
from __future__ import annotations

import hashlib
import io
import json
from decimal import Decimal as D
from pathlib import Path
from xml.etree import ElementTree as ET

from cairosvg import svg2png
from PIL import Image

HERE = Path(__file__).resolve().parent
ORIGINAL = HERE / "WORDMARK-WEB-SOURCE-REFERENCE.svg"
BLEED = HERE / "STICKER-001-R03-CENTERED-106x36-3MM-BLEED-UNAPPROVED.svg"
TRIM = HERE / "STICKER-001-R03-CENTERED-100x30-TRIM-UNAPPROVED.svg"
OUTPUT = HERE / "exports" / "STICKER-001-R03-CENTERED-106x36-300DPI-UNAPPROVED.png"
REPORT = OUTPUT.with_suffix(".qa.json")
ORIGINAL_BLOB = "e9b299f8d797625b3704103c08ea1aede5c5ea05"
NS = "{http://www.w3.org/2000/svg}"
ART_H = D("21.15419297")
CENTER_Y = (D(30) - ART_H) / D(2)
DRIFT_MM = D("3")
OLD_BOTTOM_MM = D("3.44580703")
DPI = 300


def blob(data: bytes) -> str:
    return hashlib.sha1(f"blob {len(data)}\0".encode() + data).hexdigest()


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def get_paths(tree):
    return list(tree.iter(NS+"path"))


def verify_geometry() -> dict:
    src = ORIGINAL.read_bytes()
    assert blob(src) == ORIGINAL_BLOB, "Original Git SVG blob changed; do not re-letter"
    original = ET.fromstring(src)
    orig_paths = get_paths(original)
    assert original.attrib.get("viewBox") == "0 0 1109 255" and len(orig_paths) == 1
    result = {}
    for label, file, width, height, x, y in [
        ("trim", TRIM, D(100), D(30), D(4), CENTER_Y),
        ("bleed", BLEED, D(106), D(36), D(7), CENTER_Y+D(3)),
    ]:
        data = file.read_bytes()
        tree = ET.fromstring(data)
        assert tree.get("width") == f"{width}mm" and tree.get("height") == f"{height}mm"
        assert tree.get("viewBox") == f"0 0 {width} {height}"
        texts = list(tree.iter(NS+"text"))
        assert not texts, "Vendor artwork must not contain font-dependent text"
        assert not list(tree.iter(NS+"image")) and not list(tree.iter(NS+"use"))
        assert "NOT APPROVED FOR PRINT" in data.decode("utf8")
        paths = get_paths(tree)
        assert len(paths) == 1 and paths[0].get("d") == orig_paths[0].get("d")
        assert paths[0].get("fill", "").lower() == "#f8f2e7"
        assert paths[0].get("fill-rule") == "evenodd"
        rects = list(tree.iter(NS+"rect"))
        assert len(rects) == 1 and rects[0].get("fill") == "#10110F"
        assert rects[0].get("width") == str(width) and rects[0].get("height") == str(height)
        nested = [el for el in tree.iter(NS+"svg") if el is not tree]
        assert len(nested) == 1
        logo = nested[0]
        assert logo.get("width") == "92" and logo.get("height") == "21.15419297"
        assert logo.get("viewBox") == "0 0 1109 255"
        actual_x,actual_y = D(logo.get("x")), D(logo.get("y"))
        assert actual_x == x and actual_y == y
        left = actual_x - (width-D(100))/D(2)
        right = D(100) - left - D(92)
        top = actual_y - (height-D(30))/D(2)
        bottom = D(30) - top - ART_H
        assert left == right == D(4)
        assert top == bottom == CENTER_Y
        assert not any("cutline" in (el.get("id","")+el.get("class","")).lower() for el in tree.iter())
        result[label] = {"artwork_canvas_mm":[str(width),str(height)],
                         "trim_mm":["100","30"],
                         "ink_path_exact_source":True,
                         "art_box_y_mm":str(actual_y),
                         "nominal_art_box_clearance_mm":str(CENTER_Y),
                         "clearance_after_hypothetical_3mm_shift_mm":str(CENTER_Y-DRIFT_MM)}
    assert CENTER_Y > OLD_BOTTOM_MM
    return result


def render():
    checks=verify_geometry()
    # The cutline is deliberately ABSENT. 3mm bleed is provisional.
    expected=(round(106*DPI/25.4),round(36*DPI/25.4))
    png=svg2png(bytestring=BLEED.read_bytes(), output_width=expected[0], output_height=expected[1])
    im=Image.open(io.BytesIO(png)).convert("RGBA")
    assert im.size == expected, f"Raster dimensions {im.size} != {expected}"
    observed_bg = im.getpixel((20,20))
    assert all(abs(observed_bg[i] - target) <= 3 for i,target in enumerate((16,17,15))), f"Background sample: {observed_bg}"
    ink_mask=im.getchannel("R").point(lambda r:255 if r>160 else 0)
    ink_bbox=ink_mask.getbbox()
    assert ink_bbox is not None, "No visible ivory ink rendered"
    assert ink_bbox[2]-ink_bbox[0]>900, ink_bbox
    # Contrast and fine art actually rendered, not just syntactically valid XML.
    px=im.getpixel((im.width//2,im.height//2))
    assert max(im.getchannel("R").getextrema()) > 220
    OUTPUT.parent.mkdir(parents=True,exist_ok=True)
    im.save(OUTPUT,format="PNG",dpi=(DPI,DPI),optimize=True)
    reopened=Image.open(OUTPUT)
    assert reopened.size == expected and reopened.format == "PNG"
    assert reopened.getchannel("R").point(lambda r:255 if r>160 else 0).getbbox()==ink_bbox
    report={
        "product":"TOHEŞAR Sticker 001",
        "status":"INTERNAL_CENTERED_R03_PRINT_ART_CANDIDATE_NOT_VENDOR_APPROVED",
        "source_git_blob_sha1":ORIGINAL_BLOB,
        "exact_original_vector_path_preserved":True,
        "new_design_decision":"Center original 92mm x 21.15419297mm wordmark box vertically on nominal 100x30mm trim, no rescale",
        "nominal_trim_mm":[100,30],
        "provisional_full_bleed_mm":3,
        "canvas_mm":[106,36],
        "png_dimensions_px":list(expected),
        "png_dpi_nominal":DPI,
        "png_sha256":sha256(OUTPUT.read_bytes()),
        "png_bytes":OUTPUT.stat().st_size,
        "visible_ivory_bbox_approx_px":list(ink_bbox),
        "previous_min_rectangular_art_clearance_mm":str(OLD_BOTTOM_MM),
        "improved_min_rectangular_art_clearance_mm":str(CENTER_Y),
        "clearance_gain_mm":str(CENTER_Y-OLD_BOTTOM_MM),
        "after_hypothetical_3mm_trim_drift_min_mm":str(CENTER_Y-DRIFT_MM),
        "geometry":checks,
        "warning":"Calculated only. No physical cutter tolerance, safe-zone, rounded-corner or artwork method approved.",
        "actual_vendor_cutline_verified":False,
        "original_art_vendor_upload":False,
        "owner_release_approval":False,
        "order_or_payment":False,
    }
    REPORT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print(json.dumps(report,ensure_ascii=False,indent=2))


if __name__ == "__main__":
    render()
