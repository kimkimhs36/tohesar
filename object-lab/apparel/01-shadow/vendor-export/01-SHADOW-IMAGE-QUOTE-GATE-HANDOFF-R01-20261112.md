# 01 SHADOW / actual-image vendor quote acceptance gate R01 (2026-11-12)

**New manufacturing blocker control, not another mockup.** The [strict receipt schema](./01-SHADOW-IMAGE-QUOTE-RECEIPT-SCHEMA-R01-20261112.json) specifies what must be documented before a Marpple 8178 original-logo **one-piece print feasibility and price** can be called verified. The [current incomplete receipt](./01-SHADOW-IMAGE-QUOTE-PENDING-R01-20261112.json) intentionally fails this schema. This prevents treating the older native generic-text amount (23,700 KRW) or 3,000 KRW listed shipping as a real original-image logo quote.

### Gate distinctions
- **82mm artboard vs visible ink:** both recorded separately. Previous source alpha-bbox implies approx. 81.5736mm visible raster width at 82mm artboard; only actual seller print proof can confirm physical ink.
- **Placement:** must name a physical garment seam reference and measured X/Y offsets; don't accept a screenshot of uncalibrated editor coordinates.
- **Printing:** print method and confirmed underbase status required; unknown is NOT success.
- **Quote:** single-unit printed price, shipping, tax handling, and total payable required; never infer VAT or extrapolate from generic-text delta.
- **Permission:** owner artwork upload permission and sample size approval must be independently confirmed. `orderApproved` remains `false` by design. A valid print receipt is **not** an authorization to buy.
- **Evidence:** timestamp and non-sensitive proof reference required; never store vendor login captures, personal addresses or cookies in public GitHub.

### Tests and limits
11/11 deterministic structural assertions in connected JavaScript runtime PASS. Pending receipt has 16 fields incompatible with required vendor evidence or approvals; **not a successful vendor quote**. JSON Schema validation by an independent library, real vendor print inspection, tax reconciliation and garment fit were **NOT RUN**. Schema is a structured preflight, not a supplier certificate.

### Next action
Wait for specific permission to upload original logo to vendor, and owner-selected sample size. Then inspect the actual image editor, record proof and price in a **private** evidence location; only publish sanitized factual results. Never cart, pay, order, merge or deploy without separate approval.
