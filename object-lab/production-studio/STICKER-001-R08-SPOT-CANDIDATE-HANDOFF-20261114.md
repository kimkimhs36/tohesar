# Sticker 001 R08 — real spot-color separation candidate (2026-11-14 KST)

Status: **INTERNAL CANDIDATE / NOT VENDOR APPROVED / NOT SENT**. Preserve R07 as-is. This addresses a real R07 shortcoming: its kisscut line was ordinary process CMYK magenta, not a named separation. This is **not** an approved vendor cutline color name.

## Material change
- New generator: `export_sticker_r08_spot_candidate.cjs` on PR #35; unchanged original master path and source Git-blob checks.
- The `반칼` OCG now strokes with PDF `/Separation /KissCut`, alternate `/DeviceCMYK` C0/M100/Y0/K0 and FunctionType 2 tint transform; separate `인쇄` OCG remains.
- 110×40 mm PDF page, 100×30 mm inset kisscut rectangle, 0.5pt stroke, 979 original-path vertices / 8 closed contours. Print art is still **DeviceRGB, uncalibrated**. Vendor-specific spot names, PDF/X, bleed and print/cut registration remain unverified.

## Actual remote execution
- TEAM-BKIT online. Source SVG and master fetched from exact GitHub PR #35 SHA `f8694d4a79c66114772e823b61bc5ff0ea7ce3be` into isolated local folder. Ran Node 24 generator and independent PyMuPDF parser/renderer.
- Generated PDF **23,446 bytes**, SHA256 `14c18e821846fc65e9e64d3794759e80a9b763dd653afb7712403d866bb63cb2`.
- **PASS**: PDF open; page size 110×40mm; spot ColorSpace and actual `SCN` stroke; two OCG layers; real 300dpi render 1300×473px. Local generated PDF and PNG remain in `C:\\Users\\kimki\\Documents\\TOHESAR-FIRST-DROP-ATELIER\\spot-candidate-r08`.
- **NOT RUN**: human visual review, Adobe prepress separation preview, named supplier acceptance, actual CMYK/spot ink proof, physical print/cut and durability. The code was executed locally before GitHub commit; post-commit CI **NOT VERIFIED**. Never label this press-ready.
- No vendor upload, supplier contact, order/payment, public post, merge or deployment.

## Next consequential action
Choose a sticker vendor and read its exact named cutline/bleed/spot PDF rules; adapt `/KissCut` name and separation/printing to **that** rule, then independently check rendered layer visibility and supplier acceptance after separate upload permission. Do not repeat R07/R08 PDF structural tests as a manufacturing milestone. First wearable 01 SHADOW remains blocked by size, placement approval, logo-upload authorization and actual original-image one-piece quote.
