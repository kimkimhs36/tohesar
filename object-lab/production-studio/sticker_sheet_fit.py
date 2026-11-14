#!/usr/bin/env python3
"""STICKER 001 / vendor sheet feasibility calculator, not a vendor approval.

Pure Python 3 standard library. Geometry is in millimeters. Tests several
hypothetical editor margins/gutters. NO assertion that any vendor allows the
configuration or any particular quantity.
Usage:
 python object-lab/production-studio/sticker_sheet_fit.py
 python object-lab/production-studio/sticker_sheet_fit.py --sheet 140 200 --margin 5 --gap 3
"""
import argparse
import json
from decimal import Decimal, InvalidOperation

def D(value):
    try:
        d=Decimal(str(value))
        if not d.is_finite() or d<0: raise ValueError("Expected nonnegative finite number")
        return d
    except (InvalidOperation, ValueError) as exc:
        raise argparse.ArgumentTypeError(str(exc))

def fit(sheet, label, margin, gap):
    sw,sh=sheet;lw,lh=label
    if lw<=0 or lh<=0 or sw<=0 or sh<=0: raise ValueError("Dimensions must be positive")
    usable_w=sw-2*margin
    usable_h=sh-2*margin
    if usable_w<0 or usable_h<0: return (0,0,0)
    nx=int((usable_w+gap)//(lw+gap))
    ny=int((usable_h+gap)//(lh+gap))
    return nx,ny,nx*ny

def max_grid(sheet, label, margin, gap):
    # Homogeneous orientation; no mixed rotation or nesting optimizations.
    a=fit(sheet,label,margin,gap)
    b=fit(sheet,label[::-1],margin,gap)
    return {"normal":{"columns":a[0],"rows":a[1],"count":a[2]},
            "rotated_90":{"columns":b[0],"rows":b[1],"count":b[2]},
            "upper_bound_homogeneous_grid":max(a[2],b[2])}

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--sheet",nargs=2,type=D,default=[D(140),D(200)],metavar=("WIDTH","HEIGHT"))
    ap.add_argument("--label",nargs=2,type=D,default=[D(100),D(30)],metavar=("WIDTH","HEIGHT"))
    ap.add_argument("--margin",type=D,default=D(0),help="hypothetical clearance on all 4 sheet edges, mm")
    ap.add_argument("--gap",type=D,default=D(0),help="hypothetical clearance between adjacent labels, mm")
    args=ap.parse_args()
    scenarios=[]
    if args.margin==0 and args.gap==0:
        cases=[(0,0),(2,2),(3,3),(5,3),(5,5),(10,5)]
    else: cases=[(args.margin,args.gap)]
    for m,g in cases:
        r=max_grid(args.sheet,args.label,D(m),D(g))
        scenarios.append({"edge_margin_mm":str(m),"inter_label_gap_mm":str(g),**r})
    result={"product":"TOHEŞAR STICKER 001",
            "sheet_mm":[str(x) for x in args.sheet],
            "trim_mm":[str(x) for x in args.label],
            "scenarios":scenarios,
            "vendor_confirmed":False,
            "sheet_quantity_confirmed":False,
            "warning":"Mathematical grids only. Vendor editor printable area, cutting clearance, material, quantity and delivery price are UNKNOWN. Do not claim 6 labels per sheet without vendor evidence."}
    print(json.dumps(result,ensure_ascii=False,indent=2))
    assert max_grid((D(140),D(200)),(D(100),D(30)),D(0),D(0))["normal"]["count"]==6
    assert max_grid((D(140),D(200)),(D(100),D(30)),D(5),D(3))["normal"]["count"]==5
    assert max_grid((D(140),D(200)),(D(100),D(30)),D(5),D(5))["normal"]["count"]==5
    assert max_grid((D(140),D(200)),(D(100),D(30)),D(10),D(5))["normal"]["count"]==5

if __name__=="__main__":main()
