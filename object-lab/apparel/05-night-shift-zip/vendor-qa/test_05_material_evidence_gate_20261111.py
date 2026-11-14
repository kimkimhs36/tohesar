"""Run: python -m unittest discover -s object-lab/apparel/05-night-shift-zip/vendor-qa -p 'test_05_material_evidence_gate_20261111.py'"""
import importlib.util
from pathlib import Path
import unittest

p = Path(__file__).with_name("05-MATERIAL-EVIDENCE-GATE-20261111.py")
spec = importlib.util.spec_from_file_location("material_gate", p)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
assess = module.assess

class MaterialGateTests(unittest.TestCase):
    def valid(self):
        return dict(sku=9362, zip_type="2-way", fabric_gsm=400,
                    fabric_composition="70/30 cotton/poly",
                    source="supplier technical specification", observed_at="2026-11-11")
    def test_missing_gsm_holds(self):
        self.assertEqual(assess(dict(sku=9362, zip_type="2-way"))["decision"], "HOLD")
    def test_string_gsm_invalid(self):
        self.assertEqual(assess(dict(self.valid(), fabric_gsm="400"))["decision"], "INVALID")
    def test_boolean_gsm_invalid(self):
        self.assertEqual(assess(dict(self.valid(), fabric_gsm=True))["decision"], "INVALID")
    def test_one_way_rejected(self):
        self.assertEqual(assess(dict(self.valid(), zip_type="1-way"))["decision"], "REJECT")
    def test_lightweight_rejected(self):
        self.assertEqual(assess(dict(self.valid(), fabric_gsm=350))["decision"], "REJECT")
    def test_full_candidate_requires_review(self):
        self.assertEqual(assess(self.valid())["decision"], "REVIEW")

if __name__ == "__main__":
    unittest.main()
