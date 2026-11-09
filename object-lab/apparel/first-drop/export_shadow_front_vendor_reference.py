#!/usr/bin/env python3
"""01 SHADOW UNIFORM front vendor-placement reference PNG, existing R02 art only.

This renders an existing concept SVG without changing the chest logo path.
The output is a draft placement illustration, not proof of actual print size
or garment availability. Supplier may request it together with original 82mm
transparent ivory PNG in object-lab/print-production-studio-20261109.
"""
from __future__ import annotations

import hashlib
import io
import json
from pathlib import Path
from xml.etree import ElementTree as ET

import cairosvg
from PIL import Image

BASE = Path(__file__).resolve().parent
ROOT = BASE.parents[2]
SOURCE = ROOT / "assets" / "wordmark.svg"
FLAT = BASE / "01-SHADOW-SOURCE-LOCKED-FRONT.svg"
OUTPUT = BASE / "exports" / "01-shadow-uniform"
SOURCE_BLOB = "e9b299f8d797625b3704103c08ea1aede5c5ea05"
FLAT_BLOB = "ea10bd3ee4c3056440637dd59554b051372775da"

def blob_sha(path):
    data = path.read_bytes()
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\x00" + data).hexdigest()

def check_logo_geometry():
    if blob_sha(SOURCE) != SOURCE_BLOB:
        raise RuntimeError("Official web source SHA mismatch")
    if blob_sha(FLAT) != FLAT_BLOB:
        raise RuntimeError("Existing flatlay SHA mismatch; do not silently alter!")
    original = ET.parse(SOURCE).getroot()
    board = ET.parse(FLAT).getroot()
    s = [n for n in original.iter() if n.tag.endswith("}path") or n.tag == "path"]
    p = [n for n in board.iter() if n.tag.endswith("}path") or n.tag == "path"]
    exact = [node for node in p if node.attrib.get("d") == s[0].attrib.get("d")]
    if len(s) != 1 or len(exact) != 1:
        raise RuntimeError("Missing unique original vector geometry")
    if exact[0].attrib.get("fill", "").lower() != "#f8f2e7":
        raise RuntimeError("Artwork ivory was unexpectedly changed")
    if not any(node.tag.endswith("}text") and "NOT MANUFACTURED" in "".join(node.itertext()) for node in board.iter()):
        raise RuntimeError("Draft disclosure was removed")
    return hashlib.sha256(s[0].attrib["d"].encode()).hexdigest()

def main():
    source_path_hash = check_logo_geometry()
    OUTPUT.mkdir(parents=True, exist_ok=True)
    export_px = (1900, 2240)
    png = cairosvg.svg2png(bytestring=FLAT.read_bytes(), output_width=export_px[0], output_height=export_px[1])
    with Image.open(io.BytesIO(png)) as img:
        rgb = img.convert("RGB")
        if rgb.size != export_px:
            raise RuntimeError("PNG size QC failure")
        file = OUTPUT / "SHADOW-01-VENDOR-FRONT-PLACEMENT-REFERENCE-R02.png"
        rgb.save(file, "PNG", optimize=True)
    with Image.open(file) as verify:
        if verify.size != export_px or verify.format != "PNG":
            raise RuntimeError("PNG disk roundtrip QC failure")
    record = {
        "status": "PREPRODUCTION_VENDOR_PLACEMENT_REFERENCE_NOT_PRINT_MASTER",
        "output": file.name, "size_px": list(export_px),
        "logo_original_path_sha256": source_path_hash,
        "web_source_blob_sha1": SOURCE_BLOB,
        "existing_flatlay_blob_sha1": FLAT_BLOB,
        "artwork_redrawn": False,
        "actual_chest_position_mm_verified": False,
        "supplier_blank_color_available_verified": False,
        "vendor_upload_verified": False,
        "vendor_approved": False,
        "source_illustration_not_real_tee_photo": True,
        "file_sha256": hashlib.sha256(file.read_bytes()).hexdigest()
    }
    (OUTPUT / "FRONT-PLACEMENT-MANIFEST.json").write_text(json.dumps(record,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(record,ensure_ascii=False,indent=2))
if __name__ == "__main__":
    main()
