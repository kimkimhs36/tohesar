#!/usr/bin/env python3
"""Read-only production artwork gate. Requires Pillow; never contacts vendors."""
import argparse
import json
import hashlib
from math import isfinite
from PIL import Image

EXPECTED_SOURCE_BLOB_SHA1 = '899d2014d8c247fe7e7774b65b6371c6315f72f9'  # original committed PNG Git blob

def inspect(path, target_ink_mm=82.0, expected_blob_sha1=EXPECTED_SOURCE_BLOB_SHA1):
    if not isfinite(target_ink_mm) or not 0 < target_ink_mm <= 300:
        raise ValueError("Ink width must be finite and within (0,300] mm")
    with open(path, 'rb') as fp:
        original_bytes = fp.read()
    git_blob_sha1 = hashlib.sha1(b'blob ' + str(len(original_bytes)).encode('ascii') + b'\x00' + original_bytes).hexdigest()
    source_integrity_pass = git_blob_sha1 == expected_blob_sha1
    with Image.open(path) as source:
        if source.format != "PNG" or source.mode != "RGBA":
            raise ValueError("Expected genuine RGBA PNG, not flattened RGB")
        image = source.copy()
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
    near_opaque_count = sum(a >= 250 for r,g,b,a in nonzero)
    non_ivory_opaque_count = sum(a >= 250 and (r,g,b) != (248,242,231) for r,g,b,a in nonzero)
    color_pass = near_opaque_count > 0 and non_ivory_opaque_count == 0
    geometry_pass = (width,height)==(2500,575) and box==(4,4,2491,569)
    return {
        "file": str(path), "pixelSize": [width,height], "alphaBBoxExclusive": list(box),
        "inkWidthPixels": ink_px, "requestedVisibleInkWidthMm": target_ink_mm,
        "requiredFullCanvasWidthMm": round(canvas_mm, 5),
        "requiredFullCanvasHeightMm": round(canvas_mm * height / width, 5),
        "fullOpacityRgbColors": [list(x) for x in sorted(rgb)[:12]],
        "fullOpacityRgbDistinctCount": len(rgb),
        "geometryPass": geometry_pass,
        "sourceGitBlobSha1": git_blob_sha1,
        "expectedSourceGitBlobSha1": expected_blob_sha1,
        "originalSourceIntegrityPass": source_integrity_pass,
        "opaqueIvoryPass": color_pass,
        "nearOpaquePixelCount": near_opaque_count,
        "nonIvoryNearOpaquePixelCount": non_ivory_opaque_count,
        "localPreflightPass": geometry_pass and color_pass and source_integrity_pass,
        "vendorPrintApproved": False, "physicalPositionApproved": False,
        "printMethodVerified": False,
        "warning": "Source-locked local raster check. Alpha thresholds, print underbase, placement, vendor scaling and final quote are unverified."
    }

def main():
    p=argparse.ArgumentParser()
    p.add_argument("png")
    p.add_argument("--ink-mm", type=float, default=82.0)
    args=p.parse_args()
    if not 0 < args.ink_mm <= 300: p.error("ink width must be within (0,300] mm")
    report=inspect(args.png,args.ink_mm)
    print(json.dumps(report,ensure_ascii=False,indent=2))
    if not report["localPreflightPass"]: raise SystemExit(2)

if __name__=="__main__": main()
