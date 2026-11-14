#!/usr/bin/env python3
"""Sticker 001 independent trim-grid versus FULL BLEED artwork occupancy audit.

Pure Python stdlib. A print shop may impose additional spacing/cut requirements.
Do not interpret mathematical packing as seller sheet approval.
"""
from decimal import Decimal as D, InvalidOperation
import argparse
import json


def decimal(value, *, strictly_positive=False):
    try:
        n = D(str(value))
    except (InvalidOperation, ValueError) as exc:
        raise ValueError("invalid decimal") from exc
    if not n.is_finite() or n < 0 or (strictly_positive and n == 0):
        raise ValueError("dimensions must be finite and nonnegative; dimensions positive")
    return n


def grid(sheet=(140, 200), trim=(100, 30), bleed=3, margin=5, gap=3):
    sw, sh = [decimal(x, strictly_positive=True) for x in sheet]
    tw, th = [decimal(x, strictly_positive=True) for x in trim]
    b, m, g = [decimal(x) for x in (bleed, margin, gap)]
    # Physical print artwork footprint includes b on all sides of every trim.
    # 'gap' is the additional clearance between adjacent bleed extents.
    pw, ph = tw + 2*b, th + 2*b
    def count(w, h):
        usable_w, usable_h = sw - 2*m, sh - 2*m
        if usable_w < 0 or usable_h < 0:
            return {"columns": 0, "rows": 0, "count": 0}
        nx = int((usable_w + g) // (w + g))
        ny = int((usable_h + g) // (h + g))
        return {"columns": nx, "rows": ny, "count": nx*ny}
    return {
        "sheet_mm": [str(sw), str(sh)],
        "trim_mm": [str(tw), str(th)],
        "bleed_mm_each_side": str(b),
        "full_bleed_footprint_mm": [str(pw), str(ph)],
        "margin_mm": str(m), "gap_between_bleed_footprints_mm": str(g),
        "normal": count(pw, ph), "rotated": count(ph, pw),
        "best_homogeneous_orientation_count": max(count(pw, ph)["count"], count(ph, pw)["count"]),
        "vendor_approved": False,
        "vendor_dieline_approved": False,
        "mixed_orientation_or_nesting_optimized": False,
        "note": "Trim-only grid is not a valid print-artwork occupancy estimate when bleed is present. Vendor printable area, gutter policy, sheet material and price unknown."
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sheet", nargs=2, type=str, default=("140", "200"))
    ap.add_argument("--trim", nargs=2, type=str, default=("100", "30"))
    ap.add_argument("--bleed", default="3")
    ap.add_argument("--margin", default="5")
    ap.add_argument("--gap", default="3")
    a = ap.parse_args()
    print(json.dumps(grid(a.sheet, a.trim, a.bleed, a.margin, a.gap), indent=2))


if __name__ == "__main__":
    main()
