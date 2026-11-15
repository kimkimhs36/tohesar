"""01 SHADOW: physical print proof width gate. No supplier approval implied."""
from decimal import Decimal, InvalidOperation
import argparse, json

def positive(value):
    try: n = Decimal(str(value))
    except InvalidOperation: raise ValueError("invalid numeric measurement")
    if not n.is_finite() or n <= 0: raise ValueError("measurement must be positive finite")
    return n

def audit(ruler_px, logo_px, ruler_mm="100", target_mm="82", tolerance_mm="1", left_margin_mm=None, right_margin_mm=None):
    r=positive(ruler_px); l=positive(logo_px); mm=positive(ruler_mm)
    target=positive(target_mm); tol=positive(tolerance_mm)
    width=l*mm/r; error=width-target
    result={"observed_width_mm":str(width.quantize(Decimal(".001"))),
            "error_mm":str(error.quantize(Decimal(".001"))),
            "width_within_provisional_tolerance":abs(error)<=tol,
            "target_width_mm":str(target),"provisional_tolerance_mm":str(tol),
            "vendor_approved":False,"sample_released":False,
            "limitations":"Ruler and logo must be in the same flat plane; perspective, garment stretch and print shrinkage are not corrected."}
    if left_margin_mm is not None or right_margin_mm is not None:
        if left_margin_mm is None or right_margin_mm is None: raise ValueError("both margins required")
        a=positive(left_margin_mm); b=positive(right_margin_mm)
        result["measured_print_area_width_mm"]=str(a+width+b)
        result["margin_balance_difference_mm"]=str(abs(a-b))
    return result

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--ruler-px",required=True); p.add_argument("--logo-px",required=True)
    p.add_argument("--ruler-mm",default="100"); p.add_argument("--target-mm",default="82")
    p.add_argument("--tolerance-mm",default="1")
    p.add_argument("--left-margin-mm"); p.add_argument("--right-margin-mm")
    a=p.parse_args()
    print(json.dumps(audit(a.ruler_px,a.logo_px,a.ruler_mm,a.target_mm,a.tolerance_mm,a.left_margin_mm,a.right_margin_mm),indent=2))
