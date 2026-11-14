import unittest
from print_preflight import preflight

class PreflightTest(unittest.TestCase):
    def test_geometry(self):
        result = preflight()
        self.assertAlmostEqual(result["nominal_art_mm"]["height"], 18.86, places=2)
        self.assertAlmostEqual(result["estimated_visible_ink_mm"]["width"], 81.574, places=3)
        self.assertAlmostEqual(result["effective_source_ppi_at_82mm"], 774.39, places=2)

    def test_sizes(self):
        result = preflight()
        self.assertEqual(len(result["sizes"]), 6)
        self.assertEqual(result["sizes"][1]["size"], "M")
        self.assertEqual(result["sizes"][1]["art_nominal_width_pct_of_flat_chest"], 14.14)
        self.assertTrue(all(
            x["art_max_pct_of_flat_chest_at_minus3cm_tolerance"] >= x["art_nominal_width_pct_of_flat_chest"]
            for x in result["sizes"]
        ))

    def test_no_false_approval(self):
        result = preflight()
        self.assertIn("NOT_VENDOR_APPROVED", result["status"])
        self.assertFalse(result["png_pixels_reopened_in_this_run"])
        self.assertFalse(result["logo_exact_original_path_checked_in_this_run"])
        self.assertGreaterEqual(len(result["critical_gates"]), 6)

if __name__ == "__main__":
    unittest.main()
