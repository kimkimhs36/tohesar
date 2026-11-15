"""Conservative ruler-photo ink-width screening; NOT vendor or order approval."""
from decimal import Decimal, InvalidOperation
import argparse, json

def number(x, allow_zero=False):
    try: v=Decimal(str(x))
    except (InvalidOperation, ValueError): raise ValueError("invalid decimal")
    if not v.is_finite() or (v < 0 if allow_zero else v <= 0):
        raise ValueError("expected finite nonnegative" if allow_zero else "expected finite positive")
    return v

def evaluate(ruler_px, ink_px, ruler_mm=100, edge_uncertainty_px=2, target_mm=82, tolerance_mm=1):
    r=number(ruler_px); i=number(ink_px); m=number(ruler_mm)
    u=number(edge_uncertainty_px, True); t=number(target_mm); tol=number(tolerance_mm, True)
    # Each span has two endpoints; each endpoint can move +/-u pixels.
    if r <= 2*u or i <= 2*u: raise ValueError("uncertainty exceeds a measured span")
    lo=(i-2*u)*m/(r+2*u)
    hi=(i+2*u)*m/(r-2*u)
    nominal=i*m/r
    status=("PASS_SCREEN_ONLY" if lo>=t-tol and hi<=t+tol else
            "FAIL_SCREEN" if hi<t-tol or lo>t+tol else
            "INDETERMINATE_REMEASURE")
    return {"nominal_mm":str(nominal.quantize(Decimal(".001"))),
            "conservative_interval_mm":[str(lo.quantize(Decimal(".001"))),str(hi.quantize(Decimal(".001")))],
            "status":status,"vendor_approved":False,"sample_released":False,
            "assumptions":"ruler and ink coplanar; no perspective distortion; independent +/- pixel uncertainty at each of four endpoints"}

def tests():
    assert evaluate(1000,820,100,0)["status"]=="PASS_SCREEN_ONLY"
    assert evaluate(1000,820,100,2)["status"]=="PASS_SCREEN_ONLY"
    assert evaluate(1000,820,100,10)["status"]=="INDETERMINATE_REMEASURE"
    assert evaluate(1000,780,100,2)["status"]=="FAIL_SCREEN"
    assert evaluate(1000,840,100,2)["status"]=="FAIL_SCREEN"
    for a in [(10,8,100,5),("NaN",820,100,2),(1000,820,100,-1)]:
        try: evaluate(*a)
        except ValueError: pass
        else: raise AssertionError("invalid input accepted")
    return "PASS: 8 assertions"

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--ruler-px"); p.add_argument("--ink-px")
    p.add_argument("--edge-uncertainty-px",default="2")
    p.add_argument("--self-test",action="store_true")
    a=p.parse_args()
    if a.self_test: print(tests())
    else:
        if a.ruler_px is None or a.ink_px is None: p.error("ruler-px and ink-px required")
        print(json.dumps(evaluate(a.ruler_px,a.ink_px,edge_uncertainty_px=a.edge_uncertainty_px),indent=2))
