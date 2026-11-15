import unittest
import subprocess
import sys
from check_shadow_real_png_receipt_r03 import EXPECTED, verify

P = {"source_identity_verified": True,
     "source_git_blob_sha1": "899d2014d8c247fe7e7774b65b6371c6315f72f9",
     "dimensions_px": [2500, 575]}
R = {**EXPECTED, "partial_alpha_internal_channel_delta_limit": 16,
     "alpha_coverage_equivalent_pixels": 387663.58,
     "effective_ppi_at_82mm": round(2500 * 25.4 / 82, 2)}


class TestReceipt(unittest.TestCase):
    def test_expected(self):
        self.assertTrue(verify(P, R))

    def test_opaque_mutation(self):
        with self.assertRaises(ValueError):
            verify(P, {**R, "opaque_pixels": 379145})

    def test_partial_fringe_mutation(self):
        with self.assertRaises(ValueError):
            verify(P, {**R, "partial_alpha_max_channel_delta": 14})

    def test_underbase_claim_rejected(self):
        with self.assertRaises(ValueError):
            verify(P, {**R, "white_underbase_verified": True})

    def test_source_mutation(self):
        with self.assertRaises(ValueError):
            verify({**P, "source_git_blob_sha1": "bad"}, R)

    def test_bbox_mutation(self):
        with self.assertRaises(ValueError):
            verify(P, {**R, "alpha_bbox_px": [0, 0, 2500, 575]})

    def test_bool_int_confusion_rejected(self):
        with self.assertRaises(ValueError):
            verify(P, {**R, "opaque_pixels_all_exact_ivory": 1})

    def test_missing_field_rejected(self):
        bad = R.copy()
        del bad["visible_pixels"]
        with self.assertRaises(ValueError):
            verify(P, bad)

    def test_optimized_mode_cannot_bypass_gate(self):
        snippet = "from check_shadow_real_png_receipt_r03 import verify; verify({'source_identity_verified':False}, {})"
        proc = subprocess.run([sys.executable, "-O", "-c", snippet], cwd=__import__("os").path.dirname(__file__), capture_output=True, text=True)
        self.assertNotEqual(proc.returncode, 0)
        self.assertIn("ValueError", proc.stderr)


if __name__ == "__main__":
    unittest.main()
