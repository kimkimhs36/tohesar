import copy
import json
import unittest
from pathlib import Path
from validate_catalogue_dimensions_r04 import inspect, DATA

class CatalogueGateTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.original = json.loads(Path(DATA).read_text(encoding="utf-8"))
    def fresh(self):
        return copy.deepcopy(self.original)
    def test_real_snapshot_detects_single_10cm_discrepancy(self):
        r = inspect(self.fresh())
        self.assertEqual(r["production_gate"], "HOLD")
        self.assertEqual(r["matching_dimensions"], 23)
        self.assertEqual(r["discrepancies"], [{"size": "L", "dimension": "chest_flat_cm", "marpple_cm": 63.5, "bodatee_cm": 53.5, "delta_cm": -10.0}])
    def test_identical_measurements_no_discrepancy_but_still_hold(self):
        x = self.fresh()
        x["bodatee_1000001018"]["sizes"]["L"][2] = 63.5
        r = inspect(x)
        self.assertEqual(r["discrepancies"], [])
        self.assertEqual(r["production_gate"], "HOLD")
    def test_rejects_nan(self):
        x = self.fresh()
        x["marpple_9362"]["sizes"]["S"][0] = float("nan")
        with self.assertRaises(ValueError): inspect(x)
    def test_rejects_boolean_measurement(self):
        x = self.fresh()
        x["marpple_9362"]["sizes"]["S"][0] = True
        with self.assertRaises(ValueError): inspect(x)
    def test_rejects_missing_size(self):
        x = self.fresh()
        del x["marpple_9362"]["sizes"]["M"]
        with self.assertRaises(ValueError): inspect(x)
    def test_rejects_changed_dimension_order(self):
        x = self.fresh()
        x["dimensions"][0], x["dimensions"][1] = x["dimensions"][1], x["dimensions"][0]
        with self.assertRaises(ValueError): inspect(x)
    def test_rejects_unsubstantiated_release(self):
        x = self.fresh()
        x["release"]["marpple_9362_manufacturer_match"] = True
        with self.assertRaises(ValueError): inspect(x)

if __name__ == "__main__":
    unittest.main()
