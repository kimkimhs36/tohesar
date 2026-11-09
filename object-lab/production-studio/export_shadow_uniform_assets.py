#!/usr/bin/env python3
"""Reproducible source-locked 01 SHADOW UNIFORM chest print assets.

Outputs transparent 82 mm ivory logo at true 300, 600 dpi. Source geometry,
physical dimensions and Git blob are asserted. These are preproduction
candidates: the garment-specific approved master and vendor preview are pending.
"""
from __future__ import annotations

import hashlib
import io
import json
import math
import sys
from pathlib import Path
from xml.etree import ElementTree as ET

import cairosvg
from PIL import Image

HERE = Path(__file__).resolve().parent
SRC = HERE / "WORDMARK-WEB-SOURCE-REFERENCE.svg"
ART = HERE / "SHADOW-UNIFORM-01-CHEST-82mm-CANDIDATE.svg"
OUT = HERE / "exports" / "01-shadow-uniform"
EXPECTED_SOURCE_BLOB = "e9b299f8d797625b3704103c08ea1aede5c5ea05"
EXPECTED_ART_BLOB = "c4160648feb1d74d4b2af663b8755984a2ac77fa"
WIDTH_MM = 82
HEIGHT_MM = WIDTH_MM * 255 / 1109
IVORY = "#f8f2e7"


def git_blob_sha1(path: Path) -> str:
    data = path.read_bytes()
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\x00" + data).hexdigest()


def only_path(path: Path):
    root = ET.fromstring(path.read_bytes())
    nodes = [n for n in root.iter() if n.tag.split("}")[-1] == "path"]
    if len(nodes) != 1:
        raise AssertionError(f"{path.name}: expected 1 existing path, got {len(nodes)}")
    if any(n.tag.split("}")[-1] in ("text", "image", "foreignObject") for n in root.iter()):
        raise AssertionError("Unexpected live text or external image")
    return root, nodes[0]


def checked_source() -> str:
    if git_blob_sha1(SRC) != EXPECTED_SOURCE_BLOB:
        raise AssertionError("Original website wordmark SHA changed; halt")
    if git_blob_sha1(ART) != EXPECTED_ART_BLOB:
        raise AssertionError("Original chest artwork SHA changed; halt")
    src_root, src_path = only_path(SRC)
    art_root, art_path = only_path(ART)
    if src_path.attrib["d"] != art_path.attrib["d"]:
        raise AssertionError("Original paths differ; no redraw permitted")
    if art_path.attrib.get("fill", "").lower() != IVORY:
        raise AssertionError("Ivory print color changed")
    if art_path.attrib.get("fill-rule") != "evenodd":
        raise AssertionError("Original evenodd fill-rule changed")
    if art_root.attrib.get("width") != "82mm" or art_root.attrib.get("viewBox") != "0 0 1109 255":
        raise AssertionError("Physical artwork dimensions changed")
    if not math.isclose(float(art_root.attrib["height"].removesuffix("mm")), HEIGHT_MM, abs_tol=.001):
        raise AssertionError("Unexpected physical height")
    return hashlib.sha256(src_path.attrib["d"].encode()).hexdigest()


def render():
    source_path_sha = checked_source()
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = {
        "product": "TOHESAR OBJECT LAB / 01 SHADOW UNIFORM",
        "master_approval": False,
        "press_ready": False,
        "vector_geometry_unmodified": True,
        "source_git_blob_sha1": EXPECTED_SOURCE_BLOB,
        "chest_vector_git_blob_sha1": EXPECTED_ART_BLOB,
        "source_path_sha256": source_path_sha,
        "size_mm": {"width": WIDTH_MM, "height": round(HEIGHT_MM, 6)},
        "color": IVORY,
        "background": "transparent",
        "vendor_print_placement_verified": False,
        "vendor_import_verified": False,
        "exports": [],
    }
    for dpi in (300, 600):
        width = round(WIDTH_MM / 25.4 * dpi)
        height = round(HEIGHT_MM / 25.4 * dpi)
        png = cairosvg.svg2png(bytestring=ART.read_bytes(), output_width=width, output_height=height)
        with Image.open(io.BytesIO(png)) as temp:
            im = temp.convert("RGBA")
        if im.size != (width, height):
            raise AssertionError("Unexpected raster dimensions")
        alpha_min, alpha_max = im.getchannel("A").getextrema()
        if (alpha_min, alpha_max) != (0, 255):
            raise AssertionError("Transparent/solid portions missing")
        # Ensure visible opaque pixels really are ivory. Anti-aliasing alpha
        # near edges may be fractional, but the underlying RGB must stay ivory.
        if not all(
            r == 0xF8 and g == 0xF2 and b == 0xE7
            for r, g, b, alpha in im.getdata()
            if alpha == 255
        ):
            raise AssertionError("Unexpected opaque color")
        target = OUT / f"SHADOW-UNIFORM-01-82mm-IVORY-{dpi}DPI.png"
        im.save(target, format="PNG", dpi=(dpi, dpi), optimize=True)
        with Image.open(target) as test:
            if test.size != (width, height) or test.mode != "RGBA":
                raise AssertionError("Roundtrip PNG QC failed")
            if not all(abs(value - dpi) < 1 for value in test.info.get("dpi", (0, 0))):
                raise AssertionError("PNG DPI metadata missing")
        manifest["exports"].append(
            {
                "name": target.name,
                "dpi": dpi,
                "pixels": [width, height],
                "alpha_extrema": [alpha_min, alpha_max],
                "file_sha256": hashlib.sha256(target.read_bytes()).hexdigest(),
                "bytes": target.stat().st_size,
            }
        )
    p = OUT / "MANIFEST.json"
    p.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(manifest, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    try:
        render()
    except Exception as exc:
        print(f"FATAL print-source QC: {exc}", file=sys.stderr)
        sys.exit(1)
