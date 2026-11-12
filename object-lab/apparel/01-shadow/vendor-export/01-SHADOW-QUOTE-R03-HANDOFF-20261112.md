# 01 SHADOW — quote gate R03 (2026-11-12)

Previous R02 accepted negative placement coordinates, zero-priced image quotes, and an explicitly hypothetical placeholder evidence reference as a structurally valid seller proof. R03 rejects these fail-open inputs. The old R02 test baseline with `hypothetical-no-vendor-proof` must now be updated to expect a rejection; do not claim old suite is green unchanged.

New adversarial regression cases are in `test_quote_reconciliation_gate_r03_adversarial.cjs`; 9/9 executed by evaluating the exact updated CJS in a connected JavaScript runtime. Independent Node test and actual vendor quote NOT RUN. A passing structure still cannot prove vendor authenticity: review seller-issued evidence separately. Do not upload original art without explicit owner authorization. No order/payment/merge.

Next manufacturing gate: owner selects sample size and separately approves seller original-image upload; verify print method, underbase, location and all-in one-piece seller quote. This is a code safety fix, not a physical sample.
