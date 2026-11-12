import unittest
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
        with self.assertRaises(AssertionError):
            verify(P, {**R, "opaque_pixels": 379145})

    def test_partial_fringe_mutation(self):
        with self.assertRaises(AssertionError):
            verify(P, {**R, "partial_alpha_max_channel_delta": 14})

    def test_underbase_claim_rejected(self):
        with self.assertRaises(AssertionError):
            verify(P, {**R, "white_underbase_verified": True})

    def test_source_mutation(self):
        with self.assertRaises(AssertionError):
            verify({**P, "source_git_blob_sha1": "bad"}, R)

    def test_bbox_mutation(self):
        with self.assertRaises(AssertionError):
            verify(P, {**R, "alpha_bbox_px": [0, 0, 2500, 575]})


if __name__ == "__main__":
    unittest.main()
