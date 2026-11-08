#!/usr/bin/env python3
"""Object Lab Sticker 001: source-locked transparent PNG and local QC.

Run from repo root:
    python3 -m pip install cairosvg pillow
    python3 object-lab/sticker-001/export_auto_cut_png.py

Never substitute fonts or regenerate the logo. Does not submit to a vendor.
"""
from __future__ import annotations
import hashlib
from pathlib import Path
import xml.etree.ElementTree as ET
from io import BytesIO
import sys

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
SOURCE = ROOT / "assets/wordmark.svg"
ART = HERE / "100x30-AUTO-CUT-CONTOUR-SOURCE-NO-BLEED-NOT-APPROVED.svg"
OUT = HERE / "100x30-AUTO-CUT-TRANSPARENT-300DPI-NOT-APPROVED.png"
EXPECTED_SHA1 = "e9b299f8d797625b3704103c08ea1aede5c5ea05"
NS = "{http://www.w3.org/2000/svg}"

def paths(p: Path):
    root = ET.parse(p).getroot()
    return [(x.get("d"), x.get("fill"), x.get("fill-rule")) for x in root.iter(NS + "path")]

def main():
    raw = SOURCE.read_bytes()
    # Git blob SHA, not ordinary file SHA.
    blob = hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest()
    if blob != EXPECTED_SHA1:
        raise RuntimeError(f"Brand source changed: {blob}")
    if paths(SOURCE) != paths(ART):
        raise RuntimeError("Original wordmark vector path mismatch")
    root = ET.parse(ART).getroot()
    if root.get("viewBox") != "0 0 100 30" or root.get("width") != "100mm" or root.get("height") != "30mm":
        raise RuntimeError("Not a 100x30mm sticker")
    rects = list(root.iter(NS + "rect"))
    if len(rects) != 1 or any(rects[0].get(k) != v for k, v in {"x":"0","y":"0","width":"100","height":"30","fill":"#000000"}.items()):
        raise RuntimeError("Cut silhouette must be exactly 100x30mm black")
    import cairosvg
    from PIL import Image
    # 300 DPI exact aspect ratio: 1181 x 354 pixels.
    png = cairosvg.svg2png(bytestring=ART.read_bytes(), output_width=1181, output_height=354)
    img = Image.open(BytesIO(png)).convert("RGBA")
    if img.size != (1181, 354):
        raise RuntimeError(f"Unexpected dimensions: {img.size}")
    if any(img.getpixel(pos)[3] != 255 for pos in [(0,0),(1180,0),(0,353),(1180,353)]):
        raise RuntimeError("Opaque black rectangular contour required")
    img.save(OUT, dpi=(300,300))
    print("PASS: Git source blob, vector identity, 100x30 silhouette, 1181x354 pixels, 300DPI metadata")
    print(f"OUTPUT: {OUT}")
    print("CAUTION: editor may resize image or interpret boundary differently. Vendor acceptance unverified.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
