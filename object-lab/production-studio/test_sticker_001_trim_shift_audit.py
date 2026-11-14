import unittest
from decimal import Decimal as D
from sticker_001_trim_shift_audit import audit

class TrimShiftTests(unittest.TestCase):
    def test_nominal_clearance(self):
        r=audit("0")
        self.assertEqual(r["minimum_ink_clearance_after_shift_mm"],"3.44580703")
    def test_one_point_five_mm(self):
        r=audit("1.5")
        self.assertEqual(r["minimum_ink_clearance_after_shift_mm"],"1.94580703")
        self.assertTrue(r["full_black_bleed_covers_shift"])
        self.assertTrue(r["wordmark_not_clipped_by_shift"])
    def test_three_mm_borderline(self):
        r=audit("3")
        self.assertEqual(r["minimum_ink_clearance_after_shift_mm"],"0.44580703")
        self.assertTrue(r["full_black_bleed_covers_shift"])
    def test_four_mm_fails(self):
        r=audit("4")
        self.assertFalse(r["full_black_bleed_covers_shift"])
        self.assertFalse(r["wordmark_not_clipped_by_shift"])
    def test_invalid(self):
        for x in ["-1","NaN","Infinity"]:
            with self.assertRaises(ValueError): audit(x)
    def test_no_approval(self):
        r=audit("0")
        self.assertFalse(r["release_approved"])
        self.assertFalse(r["vendor_cut_accuracy_verified"])
if __name__=="__main__":unittest.main()
