import unittest
from quote_gate import evaluate
def sample():
    return dict(sku='8178',color='charcoal',size='M',quantity=1,artwork_width_mm=82,placement_from_center_mm=95,placement_from_hps_mm=180,print_method='DTF',ink_color='ivory',base_krw=15700,print_krw=8000,shipping_krw=3000,vat_krw=0,other_fees_krw=0,seller_confirmed_total_krw=26700,seller_quote_date='2026-11-10',seller_artwork_approved=True,seller_placement_approved=True,owner_size_approved=True,owner_upload_approved=True,owner_order_approved=True)
class TestGate(unittest.TestCase):
    def test_complete_is_only_review(self):
        x=evaluate(sample());self.assertEqual(x['status'],'READY_FOR_HUMAN_REVIEW');self.assertIn('never authorizes',x['warning'])
    def test_unapproved_blocked(self):
        q=sample();q['owner_order_approved']=False;self.assertEqual(evaluate(q)['status'],'BLOCKED')
    def test_missing_quote_blocked(self):
        q=sample();q['print_krw']=None;self.assertIn('MISSING:print_krw',evaluate(q)['blockers'])
    def test_total_mismatch_blocked(self):
        q=sample();q['vat_krw']=1000;self.assertIn('TOTAL_MISMATCH',evaluate(q)['blockers'])
    def test_nan_blocked(self):
        q=sample();q['shipping_krw']='NaN';self.assertIn('INVALID_MONEY',evaluate(q)['blockers'])
    def test_wrong_sku_blocked(self):
        q=sample();q['sku']='9337';self.assertIn('NOT_01_SHADOW_SKU',evaluate(q)['blockers'])
    def test_width_mismatch_blocked(self):
        q=sample();q['artwork_width_mm']=81.57;self.assertIn('ARTWORK_WIDTH_NOT_82MM',evaluate(q)['blockers'])
    def test_negative_placement_blocked(self):
        q=sample();q['placement_from_hps_mm']=-1;self.assertIn('INVALID_PLACEMENT:placement_from_hps_mm',evaluate(q)['blockers'])
    def test_zero_print_quote_blocked(self):
        q=sample();q['print_krw']=0;q['seller_confirmed_total_krw']=18700
        self.assertIn('PRINT_PRICE_NOT_POSITIVE',evaluate(q)['blockers'])
    def test_bool_quantity_blocked(self):
        q=sample();q['quantity']=True
        self.assertIn('QUANTITY_NOT_ONE',evaluate(q)['blockers'])
    def test_noncanonical_date_blocked(self):
        q=sample();q['seller_quote_date']='tomorrow'
        self.assertIn('INVALID_SELLER_QUOTE_DATE',evaluate(q)['blockers'])
    def test_blank_print_method_blocked(self):
        q=sample();q['print_method']='   '
        self.assertIn('INVALID_FIELD:print_method',evaluate(q)['blockers'])
    def test_width_numeric_string_allowed(self):
        q=sample();q['artwork_width_mm']='82.00'
        self.assertEqual(evaluate(q)['status'],'READY_FOR_HUMAN_REVIEW')
if __name__=='__main__':unittest.main()
