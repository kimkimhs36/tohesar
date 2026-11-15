"""Conservative offline quote gate. No upload, checkout or vendor communication."""
import json,sys
from datetime import date
from decimal import Decimal,InvalidOperation
REQUIRED=('sku','color','size','quantity','artwork_width_mm','placement_from_center_mm','placement_from_hps_mm','print_method','ink_color','base_krw','print_krw','shipping_krw','vat_krw','other_fees_krw','seller_confirmed_total_krw','seller_quote_date','seller_artwork_approved','seller_placement_approved','owner_size_approved','owner_upload_approved','owner_order_approved')
MONEY=('base_krw','print_krw','shipping_krw','vat_krw','other_fees_krw','seller_confirmed_total_krw')
def evaluate(q):
    blockers=[]
    for k in REQUIRED:
        if k not in q or q[k] is None or q[k]=='':blockers.append('MISSING:'+k)
    if any(k not in q or q[k] is None or q[k]=='' for k in MONEY):total=None
    else:
        try:
            values=[Decimal(str(q[k])) for k in MONEY]
            if any(not x.is_finite() or x<0 or x!=x.to_integral_value() for x in values):
                blockers.append('INVALID_MONEY');total=None
            else:
                total=sum(values[:5])
                if total!=values[5]:blockers.append('TOTAL_MISMATCH')
        except (InvalidOperation,ValueError,TypeError):blockers.append('INVALID_MONEY');total=None
    if q.get('sku')!='8178':blockers.append('NOT_01_SHADOW_SKU')
    if type(q.get('quantity')) is not int or q.get('quantity')!=1:blockers.append('QUANTITY_NOT_ONE')
    try:
        width=Decimal(str(q.get('artwork_width_mm')))
        if not width.is_finite() or width!=Decimal('82'):blockers.append('ARTWORK_WIDTH_NOT_82MM')
    except (InvalidOperation,ValueError,TypeError):blockers.append('ARTWORK_WIDTH_NOT_82MM')
    if total is not None and values[1]<=0:blockers.append('PRINT_PRICE_NOT_POSITIVE')
    for k in ('color','size','print_method','ink_color'):
        if not isinstance(q.get(k),str) or not q[k].strip():blockers.append('INVALID_FIELD:'+k)
    try:
        quote_date=q.get('seller_quote_date')
        if not isinstance(quote_date,str) or date.fromisoformat(quote_date).isoformat()!=quote_date:raise ValueError()
        if date.fromisoformat(quote_date)>date.today():blockers.append('FUTURE_SELLER_QUOTE_DATE')
    except ValueError:blockers.append('INVALID_SELLER_QUOTE_DATE')
    for k in ('seller_artwork_approved','seller_placement_approved','owner_size_approved','owner_upload_approved','owner_order_approved'):
        if q.get(k) is not True:blockers.append('NOT_APPROVED:'+k)
    for k in ('placement_from_center_mm','placement_from_hps_mm'):
        try:
            v=Decimal(str(q.get(k)))
            if not v.is_finite() or v<0:blockers.append('INVALID_PLACEMENT:'+k)
        except (InvalidOperation,ValueError,TypeError):blockers.append('INVALID_PLACEMENT:'+k)
    return {'status':'READY_FOR_HUMAN_REVIEW' if not blockers else 'BLOCKED','computed_total_krw':str(total) if total is not None else None,'blockers':sorted(set(blockers)),'warning':'READY_FOR_HUMAN_REVIEW never authorizes vendor upload, purchase or payment.'}
if __name__=='__main__':
    q=json.load(open(sys.argv[1],encoding='utf-8'))
    print(json.dumps(evaluate(q),ensure_ascii=False,indent=2))
