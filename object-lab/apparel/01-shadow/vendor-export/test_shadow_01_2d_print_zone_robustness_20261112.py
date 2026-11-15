#!/usr/bin/env python3
"""Conditional 2D print-zone drift math for 01 SHADOW; NOT vendor approval."""
from decimal import Decimal as D
import json
from pathlib import Path

def evaluate(zone=(380,480), art=(82,18.5648), center=(0,0), drift=(0,0), safety=(0,0)):
    vals=[*zone,*art,*center,*drift,*safety]
    if any(not D(str(v)).is_finite() for v in vals): raise ValueError("nonfinite")
    zw,zh,aw,ah,cx,cy,dx,dy,sx,sy=map(lambda v:D(str(v)),vals)
    if min(zw,zh,aw,ah)<=0 or min(dx,dy,sx,sy)<0 or aw>zw or ah>zh:
        raise ValueError("invalid geometry")
    raw=(zw/2+cx-aw/2,zw/2-cx-aw/2,zh/2+cy-ah/2,zh/2-cy-ah/2)
    worst=(raw[0]-dx-sx,raw[1]-dx-sx,raw[2]-dy-sy,raw[3]-dy-sy)
    return {"raw_margins_mm":list(map(str,raw)),"worst_margins_mm":list(map(str,worst)),
            "worst_min_mm":str(min(worst)),"conditional_pass":all(v>=0 for v in worst),
            "vendor_approved":False}

def main():
    path=Path(__file__).with_name("01-SHADOW-2D-PRINT-ZONE-ROBUSTNESS-R01-20261112.json")
    data=json.loads(path.read_text(encoding="utf-8"))
    for case in data["scenarios"]:
        result=evaluate(center=case["offsetMm"],drift=case["driftMm"],safety=case["safetyMm"])
        assert D(result["worst_min_mm"])==D(str(case["worstMinimumMm"])),case["name"]
        assert result["conditional_pass"] is case["conditionalPass"],case["name"]
        assert not result["vendor_approved"]
    print(f"PASS {len(data['scenarios'])} scenario regressions; vendor approval remains FALSE")

if __name__=="__main__": main()
