#!/usr/bin/env python3
"""01 SHADOW internal print geometry preflight; no vendor contact or uploads."""
import argparse
import json
from pathlib import Path

ART_PX = (2500, 575)
ALPHA_BBOX = (4, 4, 2491, 569)  # Prior saved observation; pixels not reopened here.
ART_MM = 82.0
SIZES = {
    "S": (68.5, 52, 55, 21), "M": (71, 54, 58, 21),
    "L": (73.5, 56, 61, 22), "XL": (76, 58, 64, 23),
    "2XL": (78.5, 61, 67, 24), "3XL": (81, 64, 70, 25),
}

def preflight():
    width_px, height_px = ART_PX
    left, top, right, bottom = ALPHA_BBOX
    assert 0 <= left < right <= width_px and 0 <= top < bottom <= height_px
    assert ART_MM > 0
    rows = []
    for size, (length, shoulder, chest, sleeve) in SIZES.items():
        rows.append({
            "size": size, "seller_length_cm": length,
            "seller_shoulder_cm": shoulder, "seller_chest_flat_cm": chest,
            "seller_sleeve_cm": sleeve,
            "art_nominal_width_pct_of_flat_chest": round(100 * ART_MM / (chest * 10), 2),
            "art_max_pct_of_flat_chest_at_minus3cm_tolerance": round(100 * ART_MM / ((chest - 3) * 10), 2),
        })
    return {
        "status": "INTERNAL_GEOMETRY_ONLY_NOT_VENDOR_APPROVED",
        "source": "2026-11-10 GitHub size chart SKU 8178 and saved PNG metadata",
        "logo_exact_original_path_checked_in_this_run": False,
        "png_pixels_reopened_in_this_run": False,
        "nominal_art_mm": {"width": ART_MM, "height": round(ART_MM * height_px / width_px, 3)},
        "observed_alpha_bbox_px": list(ALPHA_BBOX),
        "estimated_visible_ink_mm": {
            "width": round(ART_MM * (right - left) / width_px, 3),
            "height": round(ART_MM * (bottom - top) / width_px, 3),
        },
        "effective_source_ppi_at_82mm": round(width_px / (ART_MM / 25.4), 2),
        "seller_tolerance_note": "up to 3 cm; does not define print positioning error",
        "sizes": rows,
        "critical_gates": [
            "Owner must select size; test M is not approval",
            "Owner must separately authorize third-party logo upload",
            "Vendor must confirm printable zone and actual left-chest placement",
            "Vendor must verify physical width and print method/ivory opacity on pigment fabric",
            "Vendor-calculated image-logo quote, VAT and shipping remain unknown",
            "No order/payment without separate explicit approval",
        ],
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", type=Path)
    args = parser.parse_args()
    text = json.dumps(preflight(), ensure_ascii=False, indent=2) + "\n"
    if args.out:
        args.out.write_text(text, encoding="utf-8")
    else:
        print(text, end="")
