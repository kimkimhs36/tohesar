"""Evidence-first preflight for 01 SHADOW. Never authorizes an external action."""
import json
import re
from datetime import date
from decimal import Decimal, InvalidOperation
from pathlib import Path

MONEY = ('base_krw', 'print_krw', 'shipping_krw', 'vat_krw', 'other_fees_krw', 'seller_confirmed_total_krw')
APPROVALS = ('seller_artwork_approved', 'seller_placement_approved', 'owner_size_approved', 'owner_upload_approved', 'owner_order_approved')
SELLER_FIELDS = ('seller_quote_date', 'seller_quote_reference', 'seller_quote_source', 'seller_artwork_proof_reference', 'print_method', 'ink_color', 'underbase_method', 'placement_from_center_mm', 'placement_from_hps_mm')

def decimal(value):
    if isinstance(value, bool) or value is None or isinstance(value, (list, dict)):
        raise ValueError('not numeric')
    try:
        d = Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        raise ValueError('not numeric')
    if not d.is_finite():
        raise ValueError('not finite')
    return d

def evaluate(q, today=None):
    """Evaluate claimed evidence; never authenticate supplier records or consent."""
    today = today or date.today()
    blockers = []
    def block(s): blockers.append(s)
    if not isinstance(q, dict):
        return {'status': 'BLOCKED', 'blockers': ['INVALID_DOCUMENT'], 'computed_total_krw': None, 'warning': 'Never authorizes upload, purchase or payment.'}
    if q.get('sku') != '8178': block('WRONG_SKU')
    if q.get('color') not in ('차콜', 'charcoal'): block('UNVERIFIED_COLOR')
    if q.get('size') not in ('S', 'M', 'L', 'XL', '2XL', '3XL'): block('INVALID_SIZE')
    if type(q.get('quantity')) is not int or q['quantity'] != 1: block('INVALID_QUANTITY')
    try:
        if decimal(q.get('artwork_width_mm')) != Decimal('82'): block('INVALID_WIDTH')
    except ValueError: block('INVALID_WIDTH')
    for k in ('placement_from_center_mm', 'placement_from_hps_mm'):
        try:
            d = decimal(q.get(k))
            if not Decimal('0') <= d <= Decimal('500'): block('INVALID_PLACEMENT:'+k)
        except ValueError: block('INVALID_PLACEMENT:'+k)
    for k in APPROVALS:
        if type(q.get(k)) is not bool or q[k] is not True: block('NOT_APPROVED:'+k)
    for k in SELLER_FIELDS:
        v = q.get(k)
        if not isinstance(v, str) or not v.strip() or v.strip().lower() in ('unknown','unverified','pending','n/a','none'):
            block('MISSING_EVIDENCE:'+k)
    for k in ('seller_quote_reference','seller_quote_source','seller_artwork_proof_reference'):
        v=q.get(k)
        if isinstance(v,str) and len(v.strip())<8: block('WEAK_REFERENCE:'+k)
    d=q.get('seller_quote_date')
    try:
        if not isinstance(d,str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}',d): raise ValueError
        quoted=date.fromisoformat(d)
        if quoted>today: block('FUTURE_QUOTE')
        if (today-quoted).days>7: block('STALE_QUOTE_RECHECK')
    except ValueError: block('INVALID_QUOTE_DATE')
    amounts=[]
    for k in MONEY:
        try:
            amount=decimal(q.get(k))
            if amount<0 or amount!=amount.to_integral_value(): raise ValueError
            amounts.append(amount)
        except ValueError:
            block('INVALID_MONEY:'+k)
    total=None
    if len(amounts)==len(MONEY):
        total=sum(amounts[:5])
        if total!=amounts[5]: block('TOTAL_MISMATCH')
    if q.get('seller_quote_is_original_image') is not True: block('NOT_ORIGINAL_IMAGE_QUOTE')
    if q.get('seller_artwork_proof_is_original_image') is not True: block('NOT_ORIGINAL_IMAGE_PROOF')
    return {'status':'READY_FOR_HUMAN_REVIEW' if not blockers else 'BLOCKED',
            'computed_total_krw':str(total) if total is not None else None,
            'blockers':sorted(set(blockers)),
            'warning':'Even READY_FOR_HUMAN_REVIEW is not evidence authenticity verification and NEVER authorizes upload, purchase, checkout or payment.'}

if __name__ == '__main__':
    import sys
    if len(sys.argv)!=2: raise SystemExit('Usage: python quote_evidence_gate.py quote.json')
    print(json.dumps(evaluate(json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))),ensure_ascii=False,indent=2))
