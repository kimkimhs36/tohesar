#!/usr/bin/env python3
"""STICKER 001: trim/bleed/cut-registration clearance audit; no vendor approval.

Uses nominal 100x30 trim, 3mm provisional bleed, 92mm original wordmark
and 21.15419297mm art box. Checks whether cutter drift would expose paper
or clip the artwork. All measurements mm, no actual vendor tolerance inferred.
"""
import argparse
import json
from decimal import Decimal as D

TRIM_W, TRIM_H = D("100"), D("30")
BLEED = D("3")
ART_X, ART_Y = D("4"), D("5.4")
ART_W, ART_H = D("92"), D("21.15419297")

def audit(drift):
    """Worst-case independent X/Y trim offset ±drift; positive drift in mm."""
    drift=D(str(drift))
    if drift < 0 or not drift.is_finite():
        raise ValueError("drift must be finite and nonnegative")
    left=ART_X
    right=TRIM_W-(ART_X+ART_W)
    top=ART_Y
    bottom=TRIM_H-(ART_Y+ART_H)
    return {
        "assumed_max_absolute_trim_shift_mm":str(drift),
        "nominal_wordmark_to_trim_clearance_mm":{
            "left":str(left),"right":str(right),"top":str(top),"bottom":str(bottom)
        },
        "worst_case_wordmark_clearance_after_shift_mm":{
            "left":str(left-drift),"right":str(right-drift),
            "top":str(top-drift),"bottom":str(bottom-drift)
        },
        "minimum_ink_clearance_after_shift_mm":str(min(left,right,top,bottom)-drift),
        "full_black_bleed_covers_shift":drift<=BLEED,
        "wordmark_not_clipped_by_shift":drift<=min(left,right,top,bottom),
        "release_approved":False,
        "vendor_cut_accuracy_verified":False
    }

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--drift-mm",default="1.5")
    a=p.parse_args()
    out=audit(a.drift_mm)
    out["note"]="Worst-case geometry only. Real cutter registration, material, ink, blade offset and corner radius must be vendor-approved."
    print(json.dumps(out,ensure_ascii=False,indent=2))

if __name__=="__main__":
    main()
