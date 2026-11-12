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


def verify(provenance, raster):
    assert provenance["source_identity_verified"] is True
    assert provenance["source_git_blob_sha1"] == "899d2014d8c247fe7e7774b65b6371c6315f72f9"
    assert provenance["dimensions_px"] == [2500, 575]
    for key, expected in EXPECTED.items():
        assert type(raster.get(key)) is type(expected) and raster[key] == expected, (
            key, raster.get(key), expected
        )
    assert raster["partial_alpha_internal_channel_delta_limit"] == 16
    assert raster["alpha_coverage_equivalent_pixels"] == 387663.58
    assert raster["effective_ppi_at_82mm"] == round(2500 * 25.4 / 82, 2)
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
