# 01 SHADOW — R02 original-image quote arithmetic reconciliation · 2026-11-12

**New blocker found:** the earlier R01 JSON Schema could accept a structurally valid receipt with `unitPrintedPrice=0`, `shippingPrice=0`, `totalPayable=0`, or with a mathematically inconsistent total; it also permitted `VAT_SEPARATE_EXPLICITLY_ITEMIZED` without an explicit VAT amount. That is unsafe for real sample purchasing decisions.

**New independent executable gate:** [quote_reconciliation_gate_r02.cjs](./quote_reconciliation_gate_r02.cjs). Run `node quote_reconciliation_gate_r02.cjs PRIVATE-RECEIPT.json`. It returns nonzero for unapproved original-image upload/size, missing vendor-original-image proof classification, absent tax itemization, or nonmatching `unitPrintedPrice + shippingPrice + VAT = totalPayable`. Included-VAT receipts count VAT as zero *additional* KRW; separate VAT must be itemized. It always states `receiptIsOrderAuthorization=false`. This is intentionally **additional** to R01 schema, not a replacement for schema validation or human verification of a real supplier screenshot.

**Executed:** 10/10 synthetic counterexample tests in the available JavaScript execution runtime. [Runnable Node tests](./test_quote_reconciliation_gate_r02.cjs) committed for independent execution; Node CLI run is NOT CONFIRMED until actual runner results. Synthetic prices are examples, not observed seller quotes.

**Next action:** obtain owner approval for a specific sample size and separate authorization for original-art vendor editor upload, then verify original-image quote, placement, underbase, ink width and tax with real vendor evidence. No logo upload, order, payment, main merge or deployment performed.
