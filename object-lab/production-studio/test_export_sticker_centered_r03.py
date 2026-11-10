#!/usr/bin/env python3
"""Independent regression tests: centered sticker R03, original vector, real PNG."""
import hashlib
import json
import unittest
from decimal import Decimal as D
from xml.etree import ElementTree as ET
import export_sticker_centered_r03 as r03

class CenteredStickerR03Tests(unittest.TestCase):
    def test_source_is_git_locked_original(self):
        self.assertEqual(r03.blob(r03.ORIGINAL.read_bytes()),r03.ORIGINAL_BLOB)

    def test_original_path_is_byte_for_byte_equal(self):
        orig=ET.fromstring(r03.ORIGINAL.read_bytes())
        source_path=r03.get_paths(orig)[0].get("d")
        for f in (r03.TRIM,r03.BLEED):
            candidate=ET.fromstring(f.read_bytes())
            self.assertEqual(len(r03.get_paths(candidate)),1)
            self.assertEqual(r03.get_paths(candidate)[0].get("d"),source_path)

    def test_nominal_and_bleed_specs(self):
        r=r03.verify_geometry()
        self.assertEqual(r["trim"]["artwork_canvas_mm"],["100","30"])
        self.assertEqual(r["bleed"]["artwork_canvas_mm"],["106","36"])
        self.assertEqual(r["trim"]["nominal_art_box_clearance_mm"],"4.422903515")
        self.assertEqual(r["bleed"]["nominal_art_box_clearance_mm"],"4.422903515")

    def test_center_is_maximin_vertical_margin(self):
        original_bottom=D("30")-D("5.4")-D("21.15419297")
        symmetric=(D("30")-D("21.15419297"))/2
        self.assertGreater(symmetric,original_bottom)
        self.assertEqual(symmetric,D("4.422903515"))
        self.assertEqual(symmetric-original_bottom,D("0.977096485"))

    def test_shift_sensitivity_remains_unapproved(self):
        centered=r03.CENTER_Y
        for displacement in [D("0"),D("1.5"),D("3")]:
            self.assertGreaterEqual(centered-displacement,0)
        self.assertGreater(centered-D("3"),D("1"))
        self.assertLess(centered-D("4.5"),0)

    def test_svg_has_no_live_text_cutline_or_vendor_links(self):
        for f in (r03.TRIM,r03.BLEED):
            content=f.read_text(encoding="utf8")
            root=ET.fromstring(content)
            for kind in ("text","image","use","foreignObject"):
                self.assertEqual(list(root.iter(r03.NS+kind)),[])
            self.assertNotIn("http://",content)
            self.assertIn("NOT APPROVED FOR PRINT",content)

    def test_actual_png_size_digest_and_no_approval(self):
        report=json.loads(r03.REPORT.read_text(encoding="utf8"))
        self.assertEqual(report["png_dimensions_px"],[1252,425])
        self.assertEqual(report["source_git_blob_sha1"],r03.ORIGINAL_BLOB)
        self.assertEqual(report["png_sha256"],hashlib.sha256(r03.OUTPUT.read_bytes()).hexdigest())
        self.assertEqual(report["improved_min_rectangular_art_clearance_mm"],"4.422903515")
        for key in ("actual_vendor_cutline_verified","original_art_vendor_upload",
                    "owner_release_approval","order_or_payment"):
            self.assertIs(report[key],False)
        self.assertTrue(report["exact_original_vector_path_preserved"])

if __name__=="__main__":
    unittest.main(verbosity=2)
