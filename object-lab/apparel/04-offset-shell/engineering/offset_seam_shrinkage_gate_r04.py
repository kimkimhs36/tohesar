#!/usr/bin/env python3
"""04 OFFSET SHELL: conservative directional-shrinkage screen; never authorizes cutting."""
import argparse
import json
import math
import unittest

def screen(a_mm, b_mm, a_shrink_pct, b_shrink_pct, hem_datum_resolved=False, limit_mm=2.0):
    values = (a_mm, b_mm, a_shrink_pct, b_shrink_pct, limit_mm)
    if any(isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v) for v in values):
        raise ValueError("Finite numeric measurements required")
    if not (a_mm > 0 and b_mm > 0 and 0 <= a_shrink_pct < 100 and 0 <= b_shrink_pct < 100 and limit_mm > 0):
        raise ValueError("Invalid lengths, shrinkage, or limit")
    if not isinstance(hem_datum_resolved, bool):
        raise ValueError("Hem datum must be explicit boolean")
    after_a = a_mm * (1 - a_shrink_pct / 100)
    after_b = b_mm * (1 - b_shrink_pct / 100)
    mismatch = abs(after_a - after_b)
    return {
        "prewash_mismatch_mm": round(abs(a_mm-b_mm), 4),
        "predicted_postwash_A_mm": round(after_a, 4),
        "predicted_postwash_B_mm": round(after_b, 4),
        "predicted_mismatch_mm": round(mismatch, 4),
        "provisional_screen_limit_mm": limit_mm,
        "screen_pass": mismatch <= limit_mm,
        "cut_authorized": False,
        "status": "HOLD_NO_CUT",
        "unresolved": ["hem datum"] if not hem_datum_resolved else [],
        "warning": "Measure directional shrinkage on physical swatches; a numerical pass never approves cutting."
    }

class Tests(unittest.TestCase):
    def test_equal(self):
        r = screen(620, 620, 2, 2, True)
        self.assertEqual(r["predicted_mismatch_mm"], 0)
        self.assertTrue(r["screen_pass"])
        self.assertFalse(r["cut_authorized"])
    def test_differential(self):
        r = screen(620, 620, 2, 3, True)
        self.assertAlmostEqual(r["predicted_mismatch_mm"], 6.2)
        self.assertFalse(r["screen_pass"])
    def test_existing_mismatch(self):
        self.assertFalse(screen(620, 625, 2, 2, True)["screen_pass"])
    def test_hem_hold(self):
        self.assertEqual(screen(620, 620, 2, 2)["unresolved"], ["hem datum"])
    def test_boundary(self):
        self.assertTrue(screen(620, 622, 0, 0, True)["screen_pass"])
    def test_invalid(self):
        for args in [(0,620,2,2),(620,620,-1,2),(620,620,2,100),(float("nan"),620,2,2),(620,620,float("inf"),2)]:
            with self.subTest(args=args), self.assertRaises(ValueError):
                screen(*args)
    def test_boolean_rejected(self):
        with self.assertRaises(ValueError):
            screen(True,620,2,2)
    def test_no_false_approval(self):
        for a,b,sa,sb in [(620,620,0,0),(620,620,2,3),(620,622,0,0)]:
            self.assertFalse(screen(a,b,sa,sb,True)["cut_authorized"])

if __name__ == "__main__":
    p = argparse.ArgumentParser(description="04 OFFSET SHELL maker pre-cut screen; no factory approval")
    p.add_argument("--test", action="store_true")
    p.add_argument("--a-mm", type=float)
    p.add_argument("--b-mm", type=float)
    p.add_argument("--a-shrink-pct", type=float)
    p.add_argument("--b-shrink-pct", type=float)
    p.add_argument("--hem-datum-resolved", action="store_true")
    args = p.parse_args()
    if args.test:
        unittest.main(argv=["offset_seam_shrinkage_gate_r04.py"], exit=False)
    else:
        if any(x is None for x in (args.a_mm,args.b_mm,args.a_shrink_pct,args.b_shrink_pct)):
            p.error("Four numeric arguments required unless --test is used")
        print(json.dumps(screen(args.a_mm,args.b_mm,args.a_shrink_pct,args.b_shrink_pct,args.hem_datum_resolved),indent=2))
