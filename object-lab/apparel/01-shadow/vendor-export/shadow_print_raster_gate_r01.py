#!/usr/bin/env python3
"""Source-locked 01 SHADOW PNG prepress gate: opaque ivory and bounded anti-alias RGB.

Prepress-only geometry/color hygiene. It never proves supplier method, underbase,
print position, one-piece quote, fabric care, or physical print acceptance.
"""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image

EXPECTED = (2500, 575)
IVORY = (248, 242, 231)
WIDTH_MM = 82.0
# Internal anti-aliasing *file-hygiene* limit; NOT vendor tolerance or color proof.
MAX_PARTIAL_CHANNEL_DELTA = 16


def inspect(im, require_source_size=True):
    im = im.convert("RGBA")
    if require_source_size and im.size != EXPECTED:
        raise ValueError("Unexpected PNG size")
    if im.getchannel("A").getextrema()[0] != 0:
        raise ValueError("Transparent background absent")

    visible = opaque = partial = alpha_sum = 0
    partial_nonstandard = max_partial_delta = 0
    for r, g, b, a in im.getdata():
        if not a:
            continue  # Ignore arbitrary RGB in entirely transparent pixels.
        visible += 1
        alpha_sum += a
        if a == 255:
            opaque += 1
            if (r, g, b) != IVORY:
                raise ValueError("Opaque artwork has unexpected colors")
        else:
            partial += 1
            d = max(abs(r - IVORY[0]), abs(g - IVORY[1]), abs(b - IVORY[2]))
            max_partial_delta = max(max_partial_delta, d)
            partial_nonstandard += (d > 0)
            if d > MAX_PARTIAL_CHANNEL_DELTA:
                raise ValueError("Partial-alpha artwork has unexpected colors")
    if not visible:
        raise ValueError("No visible logo")
    if not opaque:
        raise ValueError("No opaque ivory logo core")
    return {
        "status": "DIGITAL_RASTER_ONLY_NOT_VENDOR_APPROVED",
        "canvas_px": list(im.size),
        "intended_art_width_mm": WIDTH_MM,
        "effective_ppi_at_82mm": round(im.width * 25.4 / WIDTH_MM, 2),
        "alpha_bbox_px": list(im.getchannel("A").getbbox()),
        "visible_rgb": "#F8F2E7",  # Core ink, not every partially transparent RGB triplet.
        "visible_pixels": visible,
        "opaque_pixels": opaque,
        "antialiased_partial_alpha_pixels": partial,
        "partial_alpha_nonexact_ivory_pixels": partial_nonstandard,
        "partial_alpha_max_channel_delta": max_partial_delta,
        "partial_alpha_internal_channel_delta_limit": MAX_PARTIAL_CHANNEL_DELTA,
        "opaque_pixels_all_exact_ivory": True,
        "alpha_coverage_equivalent_pixels": round(alpha_sum / 255, 3),
        "transparent_background": True,
        "vendor_print_method_verified": False,
        "white_underbase_verified": False,
        "physical_print_tested": False,
        "vendor_logo_uploaded": False,
        "warning": "Internal RGB tolerance applies ONLY to partial-alpha anti-aliased source pixels; NOT vendor color acceptance. Printing method, underbase, transfer edges, placement, wash test and real one-piece price remain unverified."
    }


def main():
    p = argparse.ArgumentParser()
    p.add_argument("png", type=Path)
    p.add_argument("--json-out", type=Path)
    args = p.parse_args()
    raw = args.png.read_bytes()
    with Image.open(args.png) as im:
        if im.format != "PNG":
            raise ValueError("Expected PNG")
        out = inspect(im)
    out["png_sha256"] = hashlib.sha256(raw).hexdigest()
    out["png_bytes"] = len(raw)
    content = json.dumps(out, ensure_ascii=False, indent=2) + "\n"
    if args.json_out:
        args.json_out.write_text(content, encoding="utf-8")
    print(content)


if __name__ == "__main__":
    main()
