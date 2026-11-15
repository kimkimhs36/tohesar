# 01 SHADOW — actual supplier quote gate (2026-11-10 KST)

This is a **manufacturing decision control**, not another image mockup. It prevents the previously observed anonymous generic-text price (23,700 KRW) from being mistaken for an approved original-logo quote or payable total.

## Evidence and constraints
- MARPPLE SKU 8178 charcoal M blank 15,700 KRW; generic text test 23,700 KRW; displayed shipping 3,000 KRW. These are **dated observations**, not an approved print quote.
- 82mm is a proposed artwork width. Seller has not approved original image, physical placement, print process, ink, underbase, VAT, durability or payable amount. M was only a QA test size.
- No original brand upload, order, payment, vendor contact, main merge or public launch.

## Execute offline
```sh
cd object-lab/apparel/01-shadow/vendor-export
python quote_gate.py quote_example_UNVERIFIED.json
python -m unittest -v test_quote_gate.py
```
The example MUST return BLOCKED. Fill only with actual verified seller values and separate explicit owner approvals. Never infer unknown VAT/fees as zero: keep null. Even READY_FOR_HUMAN_REVIEW **never authorizes** checkout, upload or payment. Unit-test approvals are synthetic and NOT actual authorization.

## Required gates
SKU, color, owner-selected size, quantity=1, 82mm target art, measured CF-to-art-left and HPS-to-art-top, print method, ink, itemized garment/print/shipping/VAT/other fees, seller-confirmed total and quote date, seller art and placement approval, and separate owner size/upload/order decisions. Script checks explicit Boolean flags and exact integer-KRW arithmetic; it cannot independently verify supplier representations or legal terms.

## Execution evidence
Python unittest was run in this cloud environment: 8 tests PASS. Unverified example executed and returned BLOCKED (missing seller quote, size, placement and approvals). GitHub files were committed independently and should be checked out/retested before any other executor claims execution. Supplier recheck NOT RUN; original artwork submission NOT RUN; physical test NOT RUN.

## Next real blocker
Obtain a seller-approved original-image logo print method/placement and genuine one-piece itemized quote after narrow owner authorization. Until then, pivot to 04 OFFSET SHELL cut-and-sew specifications or vendor documentation without sending private artwork rather than producing more paper proof sheets.
