"""05 NIGHT SHIFT ZIP — evidence-only candidate acceptance. No vendor contact."""
import json
import sys

def assess(item):
    required = ("sku", "zip_type", "fabric_gsm", "fabric_composition", "source", "observed_at")
    missing = [key for key in required if item.get(key) in (None, "")]
    if missing:
        return {"decision": "HOLD", "missing": missing}
    gsm = item["fabric_gsm"]
    if isinstance(gsm, bool) or not isinstance(gsm, (int, float)) or not 100 <= gsm <= 900:
        return {"decision": "INVALID", "reason": "fabric_gsm must be numeric g/m2"}
    if item["zip_type"] != "2-way":
        return {"decision": "REJECT", "reason": "2-way zip required"}
    if gsm < 400:
        return {"decision": "REJECT", "reason": "below 400 gsm design target"}
    return {"decision": "REVIEW", "reason": "specification candidate only, not physical approval"}

if __name__ == "__main__":
    print(json.dumps(assess(json.load(sys.stdin)), ensure_ascii=False))
