# 01 SHADOW — evidence-authenticity quote gate v2 (2026-11-10 KST)

This is a *new* conservative gate beside the earlier `quote_gate.py`; no old source was overwritten. It fixes a concrete false-positive risk: a synthetic complete price + boolean approvals could yield READY_FOR_HUMAN_REVIEW without any traceable seller evidence. This v2 additionally demands a dated seller original-image quote reference, original-image proof reference, source identifier, underbase method, 7-day freshness check, and strict typed consent fields. A user-entered reference is NOT independently authenticated. The gate never authorizes external action.

## Real execution and evidence
Cloud Python 3 standard library unittest: **16/16 PASS**, including fake 'true' approval, boolean quantity, stale/future/invalid quote date, NaN/negative/mismatched costs, generic-text-not-logo quote, missing underbase and no source reference. Running the actual `quote_evidence_example_UNVERIFIED.json` returned **BLOCKED with 23 distinct blockers** and no computed total. These tests are synthetic; no seller quote, print method or approval was newly verified. GitHub checkout re-execution is required on other machines.

Run:
```sh
cd object-lab/apparel/01-shadow/vendor-export
python -m unittest -v test_quote_evidence_gate.py
python quote_evidence_gate.py quote_evidence_example_UNVERIFIED.json
```

Source design remains TOHEŞAR original Ş, 82mm target, charcoal BeCanvas SKU 8178. Generic native text price 23,700 KRW plus shipping is not an original-image logo quote. Unknown seller VAT/print charges must remain null, never be assumed zero. Any seller evidence reference must be independently inspected; the program does not fetch or cryptographically verify it. Even a READY_FOR_HUMAN_REVIEW outcome is *not* owner approval or purchase permission.

## Next real production blocker
Obtain permission specifically to submit original art to seller, then get seller-approved 82mm image proof, ink/underbase, placement and itemized final one-piece price. Until approved, work on independent 04 OFFSET SHELL pattern engineering or sticker vendor requirements; do not create more dummy quotes or mockups. No upload, seller message, cart, order, payment, merge or deployment occurred.
