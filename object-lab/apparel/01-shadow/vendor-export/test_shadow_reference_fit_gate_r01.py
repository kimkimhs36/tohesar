import unittest
from shadow_reference_fit_gate_r01 import evaluate

class FitGateTests(unittest.TestCase):
    def test_exact_m(self):
        result = evaluate([71,54,58,21])
        self.assertEqual(result['suggested_for_review_not_approved'],'M')
        self.assertEqual(result['ranked_sizes'][0]['weighted_nominal_squared_error'],0)
    def test_exact_s(self):
        self.assertEqual(evaluate([68.5,52,55,21])['suggested_for_review_not_approved'],'S')
    def test_exact_3xl(self):
        self.assertEqual(evaluate([81,64,70,25])['suggested_for_review_not_approved'],'3XL')
    def test_tolerance_is_not_a_size_score(self):
        a=evaluate([71,54,58,21],0)
        b=evaluate([71,54,58,21],3)
        self.assertEqual([x['size'] for x in a['ranked_sizes']],[x['size'] for x in b['ranked_sizes']])
        self.assertEqual(b['ranked_sizes'][0]['worst_absolute_delta_cm_under_assumption']['length'],3)
    def test_no_auto_approval(self):
        r=evaluate([71,54,58,21])
        self.assertFalse(r['owner_size_approved'])
        self.assertFalse(r['vendor_logo_uploaded'])
        self.assertFalse(r['vendor_image_logo_quote_verified'])
    def test_invalid_values(self):
        for ref in [[0,54,58,21],[float('nan'),54,58,21],[71,54,58],[-71,54,58,21]]:
            with self.assertRaises(ValueError):evaluate(ref)
    def test_invalid_tolerance(self):
        for t in [-1,float('nan'),float('inf')]:
            with self.assertRaises(ValueError):evaluate([71,54,58,21],t)
    def test_all_sizes_ranked(self):
        self.assertEqual(len(evaluate([70,53,57,22])['ranked_sizes']),6)

if __name__=='__main__':unittest.main()
