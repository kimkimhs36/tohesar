"""Tests for 01 physical measurement gate."""
import unittest
from importlib.util import spec_from_file_location, module_from_spec
from pathlib import Path
p=Path(__file__).with_name("01-PLACEMENT-MEASUREMENT-GATE-20261111.py")
spec=spec_from_file_location("placement_gate",p); m=module_from_spec(spec); spec.loader.exec_module(m)
audit=m.audit
class TestPlacement(unittest.TestCase):
    def test_exact(self): self.assertTrue(audit(1000,820)["width_within_provisional_tolerance"])
    def test_oversize(self): self.assertFalse(audit(1000,850)["width_within_provisional_tolerance"])
    def test_undersize(self): self.assertFalse(audit(1000,790)["width_within_provisional_tolerance"])
    def test_rescaled_image(self): self.assertTrue(audit(500,410)["width_within_provisional_tolerance"])
    def test_margins(self): self.assertEqual(audit(1000,820,left_margin_mm=12,right_margin_mm=13)["margin_balance_difference_mm"],"1")
    def test_invalid(self):
        for value in ["0","-1","NaN","Infinity","abc"]:
            with self.assertRaises(ValueError): audit(value,820)
    def test_unapproved(self): self.assertFalse(audit(1000,820)["vendor_approved"])
if __name__=="__main__": unittest.main()
