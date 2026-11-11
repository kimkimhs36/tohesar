# TOHEŞAR Object Lab / 01 SHADOW placement review handoff — 2026-11-11

- Existing Draft PR #38 is the *only* intended target for 01 SHADOW. The new working UI is `object-lab/apparel/sample-room/SAMPLE-DECISION-ROOM-20261110.html`. No other branch or main merge.
- Original TOHEŞAR Ş path is reused from the already committed inline SVG; there is no re-lettering or vendor upload.
- New 01-only controls compare `left-chest` and `center-front` positions and an *internal proposal* of 60–140 mm lateral offset (default 100 mm). Width scales from vendor flat chest measurement; THIS IS NOT A PRINTABLE-AREA MEASUREMENT.
- Left-chest proposal has no approved vertical/collar datum. The earlier 90±5 mm collar offset refers only to the center-front proposal. User interaction merely selects a review candidate; it NEVER authorizes production.
- 01 sample brief exports `placementReview` with `ownerApproved=false`, `supplierPrintZoneConfirmed=false`, proposed visible width 82 mm. Other product exports have `placementReview=null`.
- New headless Chrome QA run on TEAM-BKIT at 1440 desktop and 390 mobile: 8 new placement checks PASS, 2 downloaded 01 briefs, 0 JavaScript errors, 0 unintended external requests. Script: `qa-placement-real-chrome-20261111.cjs`; evidence: `PR38-SHADOW-PLACEMENT-REAL-CHROME-QA.json`, screenshots stored here.
- Existing 4-product / size / JSON export regression re-run against *the modified HTML*: 10/10 PASS, 2 real downloaded JSON briefs, zero JS/network errors. New evidence: `SAMPLE-PLACEMENT-REGRESSION-20261111.json`. The 2026-11-10 historical QA receipt is preserved unchanged.
- Real original PNG pixel regression and anonymous vendor UI smoke test were previously completed and recorded in `01-SHADOW-REAL-DEVICE-QA-RECEIPT-20261111.json`; do not repeat as a new milestone.
- Unresolved: G0 explicit owner placement design approval; G1 actual supplier 82 mm printed area and logo upload (requires separate approval); G2 original-image price/tax/delivery; G3 chosen garment size; G4 ink process and care; G5 physical sample. No order, purchase, messaging or vendor logo upload.
- NEXT single action: Have owner review the two 01 placements in the updated UI and confirm one actual design direction. Do not send logo to supplier, edit main, create a new branch, or restart the same completed QA cycles.
