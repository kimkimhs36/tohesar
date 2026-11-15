import unittest
from offset_seam_pair_gate_r05 import assess

class Tests(unittest.TestCase):
    def base(self): return dict(upper=[[0,0],[100,0]],lower=[[0,0],[100,0]],notches_upper=[.25,.75],notches_lower=[.25,.75])
    def test_matching(self): self.assertEqual(assess(self.base())['status'],'REVIEW_ONLY')
    def test_curved_same_endpoints(self):
        d=self.base();d['lower']=[[0,0],[50,30],[100,0]]
        self.assertEqual(assess(d)['status'],'HOLD')
    def test_different_lengths(self):
        d=self.base();d['lower']=[[0,0],[110,0]]
        self.assertEqual(assess(d)['status'],'HOLD')
    def test_notch_mismatch(self):
        d=self.base();d['notches_lower']=[.30,.75]
        self.assertEqual(assess(d)['status'],'HOLD')
    def test_missing_points(self):
        d=self.base();d['upper']=[]
        with self.assertRaises(ValueError): assess(d)
    def test_nan(self):
        d=self.base();d['upper'][0][0]=float('nan')
        with self.assertRaises(ValueError): assess(d)
    def test_bool_rejected(self):
        d=self.base();d['upper'][0][0]=True
        with self.assertRaises(ValueError): assess(d)
    def test_reversed_notches(self):
        d=self.base();d['notches_upper']=[.75,.25]
        with self.assertRaises(ValueError): assess(d)
    def test_invalid_tolerance(self):
        d=self.base();d['max_seam_mismatch_mm']=-1
        with self.assertRaises(ValueError): assess(d)
    def test_no_notches(self):
        d=self.base();d['notches_upper']=[];d['notches_lower']=[]
        self.assertEqual(assess(d)['status'],'REVIEW_ONLY')

if __name__=='__main__': unittest.main()
