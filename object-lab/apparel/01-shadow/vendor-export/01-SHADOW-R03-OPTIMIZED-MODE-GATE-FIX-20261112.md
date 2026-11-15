# 01 SHADOW R03 — optimized-Python bypass closed (2026-11-12 KST)

## Concrete newly found blocker
The existing `check_shadow_real_png_receipt_r03.py` used Python `assert` for all safety checks. Running Python with `-O` removes assertions, allowing an invalid or fabricated source/print receipt to return PASS. This is a real fail-open behavior, not a PNG/artwork defect.

## Change
Replaced all assertions with explicit `require_equal()` raising `ValueError`, including strict type checks (bool vs integer), source blob SHA, alpha/color metrics, and false vendor approval flags. Preserved existing CLI, expected source identity and data contract. Added regression tests for optimized-mode bypass, missing receipt field, and bool/int confusion; changed old tests to expect ValueError.

## Execution
- Tested equivalent implementation in available Python 3 environment: **9/9 PASS** in normal mode and **9/9 PASS** under `python -O`. Explicit optimized-mode subprocess with intentionally false `source_identity_verified` returned nonzero and ValueError.
- The **actual committed files** have been re-read from GitHub and require CI to verify their exact execution; GitHub Actions for 01 SHADOW still **NOT CONFIRMED**. This is not proof of a physical print.
- Source artwork PNG and `Ş` untouched; no vendor artwork upload, cart, contact, order, payment, merge or deployment.

## Next manufacturing gate
Obtain verified original-logo 82mm seller editor print placement, print method/underbase, image-inclusive one-piece quote, and owner-approved sample size. No vendor upload until separate owner authorization; no order until separate approval.
