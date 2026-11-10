#!/usr/bin/env python3
"""Read-only production artwork gate. Requires Pillow; never contacts vendors."""
import argparse
import json
from PIL import Image

def inspect(path, target_ink_mm=82.0):
    with Image.open(path) as source:
        if source.format != "PNG":
            raise ValueError("Expected PNG")
        image = source.convert("RGBA")
    width, height = image.size
    alpha = image.getchannel("A")
    box = alpha.getbbox()
    if box is None:
        raise ValueError("Fully transparent artwork")
    left, top, right, bottom = box
    ink_px = right - left
    canvas_mm = target_ink_mm * width / ink_px
    # Any anti-aliased nonzero alpha counts as ink; vendor rasterizers may threshold differently.
    pixels = image.getdata()
    nonzero = [(r,g,b,a) for r,g,b,a in pixels if a > 0]
    rgb = {(r,g,b) for r,g,b,a in nonzero if a >= 250}
    return {
        "file": str(path), "pixelSize": [width,height], "alphaBBoxExclusive": list(box),
        "inkWidthPixels": ink_px, "requestedVisibleInkWidthMm": target_ink_mm,
        "requiredFullCanvasWidthMm": round(canvas_mm, 5),
        "requiredFullCanvasHeightMm": round(canvas_mm * height / width, 5),
        "fullOpacityRgbColors": [list(x) for x in sorted(rgb)[:12]],
        "fullOpacityRgbDistinctCount": len(rgb),
        "geometryPass": (width,height)==(2500,575) and box==(4,4,2491,569),
        "vendorPrintApproved": False, "physicalPositionApproved": False,
        "printMethodVerified": False,
        "warning": "Only local raster geometry. Alpha thresholds, print underbase, placement, vendor scaling and final quote are unverified."
    }

def main():
    p=argparse.ArgumentParser()
    p.add_argument("png")
    p.add_argument("--ink-mm", type=float, default=82.0)
    args=p.parse_args()
    if not 0 < args.ink_mm <= 300: p.error("ink width must be within (0,300] mm")
    report=inspect(args.png,args.ink_mm)
    print(json.dumps(report,ensure_ascii=False,indent=2))
    if not report["geometryPass"]: raise SystemExit(2)

if __name__=="__main__": main()
