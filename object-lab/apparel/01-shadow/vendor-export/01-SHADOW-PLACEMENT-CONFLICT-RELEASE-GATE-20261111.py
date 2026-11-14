"""01 SHADOW: fail-closed production release gate for conflicting placements.
Run: python 01-SHADOW-PLACEMENT-CONFLICT-RELEASE-GATE-20261111.py
No network, vendor upload, order, or external dependency.
"""
from dataclasses import dataclass

@dataclass(frozen=True)
class Evidence:
    owner_approved_placement: str | None = None
    supplier_print_zone_confirmed: bool = False
    actual_image_quote_confirmed: bool = False
    size_approved: bool = False
    print_method_confirmed: bool = False

def release(e: Evidence) -> tuple[bool, tuple[str, ...]]:
    reasons = []
    if e.owner_approved_placement not in ("LEFT_CHEST", "CENTER_FRONT"):
        reasons.append("G0: owner placement not approved (left chest vs center front)")
    if not e.supplier_print_zone_confirmed:
        reasons.append("G1: supplier print zone/82mm not confirmed")
    if not e.actual_image_quote_confirmed:
        reasons.append("G2: original-image quote not confirmed")
    if not e.size_approved:
        reasons.append("G3: garment size not owner-approved")
    if not e.print_method_confirmed:
        reasons.append("G4: print process/opacity not confirmed")
    return not reasons, tuple(reasons)

def _tests():
    assert not release(Evidence())[0]
    assert len(release(Evidence())[1]) == 5
    assert not release(Evidence(owner_approved_placement="BOTH", supplier_print_zone_confirmed=True, actual_image_quote_confirmed=True, size_approved=True, print_method_confirmed=True))[0]
    assert not release(Evidence(owner_approved_placement="LEFT_CHEST"))[0]
    assert release(Evidence("LEFT_CHEST", True, True, True, True))[0]
    assert release(Evidence("CENTER_FRONT", True, True, True, True))[0]
    print("PASS 6 static release-gate assertions; vendor/physical tests NOT RUN")

if __name__ == "__main__":
    _tests()
    ok, reasons = release(Evidence())
    print("CURRENT RELEASE:", "READY" if ok else "HOLD")
    for reason in reasons:
        print("-", reason)
