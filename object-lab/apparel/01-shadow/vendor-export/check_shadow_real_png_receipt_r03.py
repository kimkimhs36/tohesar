#!/usr/bin/env python3
"""Fail-closed actual tracked 01 SHADOW PNG receipt assertion, not vendor approval.

Expected metrics come from independent Base64 -> DEFLATE -> PNG filter decode of
the original GitHub blob on 2026-11-12. They are not generic PNG tolerances.
"""
import argparse
import json
from pathlib import Path

EXPECTED = {
    "canvas_px": [2500, 575],
    "visible_rgb": "#F8F2E7",
    "alpha_bbox_px": [4, 4, 2491, 569],
    "visible_pixels": 395012,
    "opaque_pixels": 379146,
    "antialiased_partial_alpha_pixels": 15866,
    "partial_alpha_nonexact_ivory_pixels": 14473,
    "partial_alpha_max_channel_delta": 13,
    "opaque_pixels_all_exact_ivory": True,
    "transparent_background": True,
    "vendor_print_method_verified": False,
    "white_underbase_verified": False,
    "physical_print_tested": False,
    "vendor_logo_uploaded": False,
}


def require_equal(label, actual, expected):
    # Explicit failure, including under python -O where assert is disabled.
    if type(actual) is not type(expected) or actual != expected:
        raise ValueError(f"Receipt mismatch for {label}: {actual!r} != {expected!r}")


def verify(provenance, raster):
    if not isinstance(provenance, dict) or not isinstance(raster, dict):
        raise ValueError("Both receipts must be JSON objects")
    require_equal("source_identity_verified", provenance.get("source_identity_verified"), True)
    require_equal("source_git_blob_sha1", provenance.get("source_git_blob_sha1"), "899d2014d8c247fe7e7774b65b6371c6315f72f9")
    require_equal("dimensions_px", provenance.get("dimensions_px"), [2500, 575])
    for key, expected in EXPECTED.items():
        require_equal(key, raster.get(key), expected)
    require_equal("partial_alpha_internal_channel_delta_limit", raster.get("partial_alpha_internal_channel_delta_limit"), 16)
    require_equal("alpha_coverage_equivalent_pixels", raster.get("alpha_coverage_equivalent_pixels"), 387663.58)
    require_equal("effective_ppi_at_82mm", raster.get("effective_ppi_at_82mm"), round(2500 * 25.4 / 82, 2))
    return True


def main():
    p = argparse.ArgumentParser()
    p.add_argument("provenance", type=Path)
    p.add_argument("raster", type=Path)
    args = p.parse_args()
    verify(json.loads(args.provenance.read_text()), json.loads(args.raster.read_text()))
    print("PASS: original tracked source matches independently decoded actual PNG pixel distribution; NOT a supplier proof")


if __name__ == "__main__":
    main()
