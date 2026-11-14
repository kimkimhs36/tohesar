import unittest
from datetime import date
from quote_evidence_gate import evaluate

TODAY=date(2026,11,10)
def complete():
    return dict(sku='8178',color='charcoal',size='M',quantity=1,artwork_width_mm=82,
        placement_from_center_mm='95',placement_from_hps_mm='180',
        print_method='DTF seller-confirmed',ink_color='ivory seller-confirmed',underbase_method='seller-confirmed',
        base_krw=15700,print_krw=9000,shipping_krw=3000,vat_krw=0,other_fees_krw=0,seller_confirmed_total_krw=27700,
        seller_quote_date='2026-11-10',seller_quote_reference='quote-8178-20261110',seller_quote_source='seller-official-document',
        seller_artwork_proof_reference='proof-8178-image-20261110',seller_quote_is_original_image=True,seller_artwork_proof_is_original_image=True,
        seller_artwork_approved=True,seller_placement_approved=True,owner_size_approved=True,owner_upload_approved=True,owner_order_approved=True)
class GateTests(unittest.TestCase):
    def check(self,q,code): self.assertIn(code,evaluate(q,TODAY)['blockers'])
    def test_synthetic_complete_only_review(self): self.assertEqual(evaluate(complete(),TODAY)['status'],'READY_FOR_HUMAN_REVIEW')
    def test_missing_quote_reference(self):
        q=complete();q['seller_quote_reference']='';self.check(q,'MISSING_EVIDENCE:seller_quote_reference')
    def test_stale_quote(self):
        q=complete();q['seller_quote_date']='2026-11-01';self.check(q,'STALE_QUOTE_RECHECK')
    def test_future_quote(self):
        q=complete();q['seller_quote_date']='2026-11-11';self.check(q,'FUTURE_QUOTE')
    def test_invalid_date(self):
        q=complete();q['seller_quote_date']='2026-02-30';self.check(q,'INVALID_QUOTE_DATE')
    def test_generic_text_not_logo_quote(self):
        q=complete();q['seller_quote_is_original_image']=False;self.check(q,'NOT_ORIGINAL_IMAGE_QUOTE')
    def test_fake_approval_string(self):
        q=complete();q['owner_order_approved']='true';self.check(q,'NOT_APPROVED:owner_order_approved')
    def test_bool_quantity(self):
        q=complete();q['quantity']=True;self.check(q,'INVALID_QUANTITY')
    def test_nan_money(self):
        q=complete();q['vat_krw']='NaN';self.check(q,'INVALID_MONEY:vat_krw')
    def test_negative_money(self):
        q=complete();q['print_krw']=-1;self.check(q,'INVALID_MONEY:print_krw')
    def test_mismatch(self):
        q=complete();q['seller_confirmed_total_krw']=27701;self.check(q,'TOTAL_MISMATCH')
    def test_unapproved_artwork(self):
        q=complete();q['seller_artwork_approved']=False;self.check(q,'NOT_APPROVED:seller_artwork_approved')
    def test_missing_underbase(self):
        q=complete();q['underbase_method']=None;self.check(q,'MISSING_EVIDENCE:underbase_method')
    def test_wrong_width(self):
        q=complete();q['artwork_width_mm']=81.574;self.check(q,'INVALID_WIDTH')
    def test_negative_placement(self):
        q=complete();q['placement_from_center_mm']=-1;self.check(q,'INVALID_PLACEMENT:placement_from_center_mm')
    def test_empty_document(self): self.assertEqual(evaluate({},TODAY)['status'],'BLOCKED')
if __name__=='__main__': unittest.main()
