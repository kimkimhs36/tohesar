#!/usr/bin/env python3
"""Regression tests for the NEW 2600px original-vector proof; no vendor operations."""
import hashlib
import json
import unittest
from pathlib import Path
from PIL import Image

import export_vendor_visible_ink_2600 as export


class VendorVisibleInkTests(unittest.TestCase):
    def test_source_sha_and_original_path_lock(self):
        source=export.SOURCE.read_bytes()
        self.assertEqual(export.sha256(source), export.SOURCE_SHA256)
        self.assertEqual(export.git_blob_sha1(source), export.SOURCE_BLOB_SHA1)

    def test_historical_file_does_not_meet_visible_2500_guidance(self):
        self.assertFalse(export.visible_ink_pass(2500, (4,4,2491,569)))
        self.assertEqual(2491-4, 2487)

    def test_nearly_full_2600px_art_can_pass(self):
        self.assertTrue(export.visible_ink_pass(2600, (5,4,2591,589)))

    def test_reject_false_claim_from_canvas_width_alone(self):
        self.assertFalse(export.visible_ink_pass(3000, (700,4,2200,600)))
        self.assertFalse(export.visible_ink_pass(2600, None))
        self.assertFalse(export.visible_ink_pass(2600, (0,0,2700,300)))

    def test_real_raster_alpha_integrity(self):
        with Image.open(export.DEST) as im:
            self.assertEqual(im.format, "PNG")
            self.assertEqual(im.mode, "RGBA")
            self.assertEqual(im.width, 2600)
            bbox=im.getchannel("A").getbbox()
            self.assertTrue(export.visible_ink_pass(im.width, bbox))
            self.assertLessEqual(max([bbox[0],bbox[1],im.width-bbox[2],im.height-bbox[3]]),10)
            self.assertEqual(im.getpixel((0,0))[3],0)

    def test_qa_truthfulness_and_digest(self):
        m=json.loads(export.MANIFEST.read_text(encoding="utf8"))
        self.assertEqual(m["png_sha256"],hashlib.sha256(export.DEST.read_bytes()).hexdigest())
        self.assertGreaterEqual(m["visible_alpha_width_px"],2500)
        self.assertEqual(m["source_svg_sha256"],export.SOURCE_SHA256)
        self.assertEqual(m["nominal_canvas_width_mm"],82.0)
        for key in ["vendor_logo_uploaded","owner_logo_upload_approved","physical_print_or_wash_tested",
                    "actual_logo_print_quote_verified","seller_print_method_verified","user_size_approved","order_or_payment"]:
            self.assertIs(m[key],False,key)


if __name__ == "__main__":
    unittest.main(verbosity=2)
