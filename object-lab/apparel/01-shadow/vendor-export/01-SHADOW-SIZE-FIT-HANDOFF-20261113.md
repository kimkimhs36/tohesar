# 01 SHADOW — seller-size fit decision handoff (2026-11-13 KST)

## New output
[Offline size and fit decision HTML](01-SHADOW-SIZE-FIT-DECISION-20261113.html) on stacked Draft PR #38, initial commit `9571939eae705cd8430ba5a7c738855d9275980a`.

The sheet uses **the existing 2026-11-10 public MARPPLE SKU 8178 seller size-chart snapshot** from `object-lab/apparel/vendor-gates/marpple/VERIFIED-SIZE-CHARTS-4SKU-20261110.json`; it is not a new stock or price observation. It provides S–3XL comparison, wearer-entered chest circumference, garment chest circumference (2 × seller flat width), optional conservative ±3 cm flat-width tolerance (±6 cm circumference), ease range, and browser print/PDF. Input is not persisted or transmitted. **No size is preapproved** (M initial display is a test/default only).

## Verification
- Pure arithmetic pre-commit check: 6/6 seller-size doubled-flat-width cases PASS (S 110, M 116, L 122, XL 128, 2XL 134, 3XL 140 cm).
- GitHub readback: 8/8 static/HEAD/integrity safety assertions PASS; exact new HEAD `9571939eae705cd8430ba5a7c738855d9275980a` at check.
- **NOT RUN**: actual desktop/mobile browser visual or interaction test, real garment measurements, physical wearer fit, vendor stock/print approval.
- **Risk**: 1–3 cm seller manufacturing tolerance is not necessarily an independently guaranteed ±3 cm flat-width error; sheet uses a deliberately conservative *scenario*, not a confidence interval. A positive chest-ease result is not a fit approval. Actual fit requires shoulder/length/neck, body proportions, fabric wash and wear assessment.

## Next real manufacturing gate
Owner chooses actual 01 sample size after measuring desired tee and comparing garment chart. Separate explicit owner approval is required before uploading original logo to any supplier. Then obtain vendor-native original 82mm print method/position, image-inclusive one-piece quote with VAT and shipping, and separately obtain order/payment approval. If upload remains blocked, investigate **05 400gsm two-way zip construction** or **04 physical patternmaker measurement**, not another synthetic quote test.

No supplier upload, vendor contact, checkout, payment, physical sample, main merge, public deployment or repo visibility change occurred.
