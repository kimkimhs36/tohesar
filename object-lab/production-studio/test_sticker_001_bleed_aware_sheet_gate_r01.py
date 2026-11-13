#!/usr/bin/env python3
"""Regression cases for bleed-aware sticker sheet occupancy; safe under python -O."""
import unittest
from sticker_001_bleed_aware_sheet_gate_r01 import grid


class TestBleedAwareSheet(unittest.TestCase):
    def test_nominal_six_vs_full_bleed_five(self):
        self.assertEqual(grid(margin=0, gap=0, bleed=0)["normal"]["count"], 6)
        self.assertEqual(grid(margin=0, gap=0, bleed=3)["normal"]["count"], 5)

    def test_hypothetical_5mm_margin_3mm_gap(self):
        r = grid(margin=5, gap=3)
        self.assertEqual(r["full_bleed_footprint_mm"], ["106", "36"])
        self.assertEqual(r["normal"]["count"], 4)
        self.assertEqual(r["rotated"]["count"], 3)

    def test_exact_footprint_fit(self):
        self.assertEqual(grid(sheet=(106,36), bleed=3, margin=0, gap=0)["normal"]["count"],1)

    def test_no_space(self):
        self.assertEqual(grid(sheet=(100,30), bleed=3, margin=0, gap=0)["normal"]["count"],0)

    def test_bad_inputs(self):
        for v in ("NaN", "Infinity", "-1", "abc"):
            with self.subTest(v=v), self.assertRaises(ValueError):
                grid(bleed=v)

    def test_no_vendor_approval(self):
        self.assertFalse(grid()["vendor_approved"])
        self.assertFalse(grid()["mixed_orientation_or_nesting_optimized"])


if __name__ == "__main__":
    unittest.main()
