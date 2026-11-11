#!/usr/bin/env python3
"""Source-locked 01 SHADOW PNG alpha/ink preflight. Digital-only, no vendor approval."""
import argparse,hashlib,json
from pathlib import Path
from PIL import Image
EXPECTED=(2500,575)
IVORY=(248,242,231)
WIDTH_MM=82.0

def inspect(im,require_source_size=True):
    im=im.convert("RGBA")
    if require_source_size and im.size!=EXPECTED:raise ValueError("Unexpected PNG size")
    if im.getchannel("A").getextrema()[0]!=0:raise ValueError("Transparent background absent")
    visible=opaque=partial=alpha_sum=0
    colors=set()
    for r,g,b,a in im.getdata():
        if a:
            visible+=1
            alpha_sum+=a
            opaque+=a==255
            partial+=0<a<255
            colors.add((r,g,b))
    if not visible:raise ValueError("No visible logo")
    if colors!={IVORY}:raise ValueError("Visible artwork has unexpected colors")
    return {
      "status":"DIGITAL_RASTER_ONLY_NOT_VENDOR_APPROVED",
      "canvas_px":list(im.size),
      "intended_art_width_mm":WIDTH_MM,
      "effective_ppi_at_82mm":round(im.width*25.4/WIDTH_MM,2),
      "alpha_bbox_px":list(im.getchannel("A").getbbox()),
      "visible_rgb":"#F8F2E7",
      "visible_pixels":visible,
      "opaque_pixels":opaque,
      "antialiased_partial_alpha_pixels":partial,
      "alpha_coverage_equivalent_pixels":round(alpha_sum/255,3),
      "transparent_background":True,
      "vendor_print_method_verified":False,
      "white_underbase_verified":False,
      "physical_print_tested":False,
      "vendor_logo_uploaded":False,
      "warning":"Vendor-specific underbase, ink opacity, transfer edges, wash durability, exact 82mm placement and one-piece price remain unverified."
    }

def main():
    p=argparse.ArgumentParser()
    p.add_argument("png",type=Path)
    p.add_argument("--json-out",type=Path)
    args=p.parse_args()
    raw=args.png.read_bytes()
    with Image.open(args.png) as im:
        if im.format!="PNG":raise ValueError("Expected PNG")
        out=inspect(im)
    out["png_sha256"]=hashlib.sha256(raw).hexdigest()
    out["png_bytes"]=len(raw)
    content=json.dumps(out,ensure_ascii=False,indent=2)+"\n"
    if args.json_out:args.json_out.write_text(content,encoding="utf-8")
    print(content)

if __name__=="__main__":main()
