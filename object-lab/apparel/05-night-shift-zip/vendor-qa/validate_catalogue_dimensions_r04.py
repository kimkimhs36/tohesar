#!/usr/bin/env python3
"""Fail-closed public catalogue cross-check. No vendor access or logo upload."""
import json
import math
import sys
from pathlib import Path

DATA = Path(__file__).with_name("05-BECANVAS-CATALOG-EVIDENCE-R04-20261112.json")
EXPECTED_SIZES = ("S", "M", "L", "XL", "2XL", "3XL")
EXPECTED_DIMENSIONS = ("length_cm", "shoulder_cm", "chest_flat_cm", "sleeve_cm")

def inspect(data):
    if tuple(data.get("dimensions", ())) != EXPECTED_DIMENSIONS:
        raise ValueError("measurement dimension order changed")
    a = data["marpple_9362"]
    b = data["bodatee_1000001018"]
    for source in (a, b):
        if source["cotton_pct"] != 70 or source["polyester_pct"] != 30:
            raise ValueError("fabric composition changed")
        if set(source["sizes"]) != set(EXPECTED_SIZES):
            raise ValueError("missing/extra sizes")
    discrepancies = []
    for size in EXPECTED_SIZES:
        x, y = a["sizes"][size], b["sizes"][size]
        if len(x) != 4 or len(y) != 4:
            raise ValueError("incomplete measurement vector")
        for index, (left, right) in enumerate(zip(x, y)):
            if any(isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v) or v <= 0 for v in (left, right)):
                raise ValueError("invalid measurement")
            if left != right:
                discrepancies.append({"size": size, "dimension": EXPECTED_DIMENSIONS[index], "marpple_cm": left, "bodatee_cm": right, "delta_cm": round(right-left, 4)})
    release = data["release"]
    if release.get("marpple_9362_manufacturer_match") is not False or release.get("size_L_conflict_resolved") is not False:
        raise ValueError("unsubstantiated manufacturer/size release")
    return {"compared_dimensions": 24, "matching_dimensions": 24-len(discrepancies), "discrepancies": discrepancies, "production_gate": "HOLD"}

def main():
    result = inspect(json.loads(DATA.read_text(encoding="utf-8")))
    print(json.dumps(result, ensure_ascii=False, indent=2))
    # Fail closed on any mismatch: this is an intentional nonzero QA result.
    return 1 if result["discrepancies"] else 0

if __name__ == "__main__":
    sys.exit(main())
