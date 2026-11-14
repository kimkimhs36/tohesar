#!/usr/bin/env python3
"""STICKER 001 R04: lock existing R03 art, repair ONLY transparent edge columns.

No re-lettering, redesign, network, checkout, or supplier upload.
R03 -> R04 is a source-locked raster QA repair, NOT vendor approval.
"""
from __future__ import annotations
import argparse
import hashlib
import io
import json
from pathlib import Path
from PIL import Image

EXPECTED_R03_SHA256 = "da9043612fa1b2ecf901636683ff89c82e29f8c9a3357818b84de32c3d5201a4"
EXPECTED_SIZE = (1252, 425)
BACKGROUND = (16, 17, 15, 255)  # #10110F opaque
SOURCE_NAME = "STICKER-001-R03-CENTERED-106x36-300DPI-UNAPPROVED.png"
OUT_NAME = "STICKER-001-R04-OPAQUE-EDGE-106x36-300DPI-UNAPPROVED.png"
QA_NAME = "STICKER-001-R04-OPAQUE-EDGE-QA.json"

def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def inspect_source(image: Image.Image, enforce_dimensions: bool = True) -> dict:
    im = image.convert("RGBA")
    w, h = im.size
    if enforce_dimensions and im.size != EXPECTED_SIZE:
        raise ValueError(f"Source changed dimensions: {im.size}")
    px = im.load()
    bad = [(x, y, px[x,y][3]) for y in range(h) for x in range(w) if px[x,y][3] != 255]
    if any(x not in (0,w-1) for x,_,_ in bad):
        raise ValueError("Unexpected alpha in inner pixels: STOP; manual redesign/inspection required")
    if enforce_dimensions and len(bad) != 2*h:
        raise ValueError(f"Unexpected source edge-alpha pattern: {len(bad)}; expected {2*h}")
    # Every nonopaque pixel must be in one of the two outermost columns.
    return {"pixel_count":w*h, "nonopaque_edge_pixels":len(bad),
            "alpha_extrema":list(im.getchannel("A").getextrema()),
            "edge_columns_only":all(x in (0,w-1) for x,_,_ in bad)}

def repair(image: Image.Image, enforce_dimensions: bool = True) -> tuple[Image.Image,dict]:
    old=image.convert("RGBA")
    original=inspect_source(old,enforce_dimensions)
    newer=old.copy()
    p=newer.load()
    w,h=newer.size
    for y in range(h):
        p[0,y]=BACKGROUND
        p[w-1,y]=BACKGROUND
    # No pixel other than outer columns may differ.
    before=old.load()
    for y in range(h):
        for x in range(1,w-1):
            if p[x,y] != before[x,y]:
                raise AssertionError("interior RGB/alpha altered unexpectedly")
    if newer.getchannel("A").getextrema() != (255,255):
        raise AssertionError("new artwork remains nonopaque")
    if any(p[x,y] != BACKGROUND for y in range(h) for x in (0,w-1)):
        raise AssertionError("outer border remains unfilled")
    return newer, {"original":original,"new_nonopaque_pixels":0,
                    "changed_pixels":2*h,"interior_pixels_exact":(w-2)*h,
                    "style_or_original_glyph_changed":False}

def build(src: Path, out: Path, qa: Path):
    data=src.read_bytes()
    if sha(data)!=EXPECTED_R03_SHA256:raise ValueError("R03 source SHA changed; refusing unsafe repair")
    with Image.open(io.BytesIO(data)) as raw:
        image=raw.convert("RGBA")
    fixed,result=repair(image)
    # Preserve nominal print dimensions but NEVER treat DPI metadata as vendor size approval.
    fixed.save(out,format="PNG",dpi=(300,300),optimize=True)
    with Image.open(out) as verify:
        checked=verify.convert("RGBA")
        assert checked.size==EXPECTED_SIZE
        assert checked.getchannel("A").getextrema()==(255,255)
        assert checked.getpixel((0,0))==BACKGROUND
        assert checked.getpixel((checked.width-1,checked.height-1))==BACKGROUND
        # Whole center interior identical to original, not merely selected sample pixels.
        assert checked.crop((1,0,checked.width-1,checked.height)).tobytes() == image.crop((1,0,image.width-1,image.height)).tobytes()
        readback_dpi=verify.info.get("dpi")
    # Safety: a raster fix is NOT cut/print/vendor approval. Do not overwrite R03.
    receipt={
      "status":"PASS_REAL_BINARY_EDGE_FIX_ONLY",
      "input_name":src.name,
      "input_sha256":sha(data),
      "output_name":out.name,
      "output_sha256":sha(out.read_bytes()),
      "output_bytes":out.stat().st_size,
      "dimensions_pixels":list(checked.size),
      "nominal_canvas_mm":[106,36],
      "nominal_dpi":300,
      "actual_png_reported_dpi":list(readback_dpi) if readback_dpi else None,
      "background":"#10110F",
      "ivory_artwork_unchanged":True,
      "left_right_outer_column_filled":True,
      "analysis":result,
      "actual_vendor_cutline_verified":False,
      "actual_physical_print_test":"NOT_RUN",
      "vendor_upload":False,
      "owner_release_approved":False,
      "ordered":False,
      "note":"Source R03 visual stays unchanged in 1250 inner columns; repaired exactly 425px each of left and right PNG border. Not evidence that original tiny antialias artifact caused a physical printing defect."
    }
    qa.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(receipt,ensure_ascii=False,indent=2))
    return receipt

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--src",type=Path,default=Path(__file__).with_name(SOURCE_NAME))
    p.add_argument("--out",type=Path,default=Path(__file__).with_name(OUT_NAME))
    p.add_argument("--qa",type=Path,default=Path(__file__).with_name(QA_NAME))
    a=p.parse_args()
    if a.src.resolve()==a.out.resolve():raise ValueError("R03 input must not be overwritten")
    build(a.src,a.out,a.qa)

if __name__=="__main__":
    main()
