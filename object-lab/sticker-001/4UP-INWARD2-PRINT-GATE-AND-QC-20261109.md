# TOHEŞAR OBJECT LAB · STICKER 001
## 4-up original-vector production candidate — verification record (2026-11-09)

**Status:** engineering candidate / NOT printer-accepted / NOT owner-approved / NO order, payment or external contact.

### Original source identity
- Official website vector asset `main/assets/wordmark.svg`, Git blob SHA1 `e9b299f8d797625b3704103c08ea1aede5c5ea05`.
- Single SVG candidate contains the original byte-identical path tag once; 4-up layout contains the same path tag four times. Tool-side exact-string vector identity checks passed.
- Website source is **not presumed to be the approved final product master**. Approve artwork separately before any order.

### What the vendor actually publishes
- Official vendor: https://www.publog.co.kr/sub_fancy/diy_sticker.s2.asp?opt1=syn&opt2=9
- Auto-cut is selectable **inside or outside** the uploaded image outline, with **0.5mm, 1mm or 2mm** offsets. Recommendation shown on vendor page: 2mm.
- 140×200mm sheet contains a lower 10mm barcode region. The cuttable area is listed at **136×188mm**; the top/left/right 2mm margins are unavailable for image placement.
- Images can be uploaded as a transparent PNG, 300dpi+ recommended.
- Documentation is inconsistent on image spacing: one guide says 5mm, another older text says 3mm. This candidate conservatively uses 5mm between black artwork rectangles.
- Official information warns of 1–2mm cutting displacement. A mathematically correct target cut is **not** a verified physical product dimension.
- Published 140×200mm one-sheet base price and shipping are separate from the final specific stock/coating/item/checkout price. Vendor publicly lists 3,000 KRW delivery under the free-delivery threshold. **No verified final total or tax-inclusive checkout for TOHEŞAR.**

### New 4-up engineering solution
- Single uploaded black-ivory artwork is exactly **104 × 34mm**.
- Set vendor cut contour to **INSIDE 2mm**, yielding a calculated nominal **100 × 30mm** outline with 2mm black bleed per edge.
- Four artwork rectangles in 140×200 sheet at `x=18mm; y=12,51,90,129mm`; every rect 104×34mm.
- Resulting nominal cut rectangles: `x=20mm; y=14,53,92,131mm`, size 100×30mm.
- Between artwork: 5mm. Between nominal cut rectangles: 9mm.
- Last artwork ends y=163mm, 27mm above barcode-start y=190mm. All images inside published usable borders.
- With max artwork height 188mm, 34mm artwork height, minimum gap 5mm, maximum vertical count = `floor((188+5)/(34+5)) = 4`. Thus 5-up **cannot** meet this same generous 2mm inside bleed and 5mm image gap in 140×200mm.
- Five-up remains a different, lower-bleed strategy, not approved for replacement or order.

### Files (GitHub branch `object-lab/sticker-001-proof-20261108`)
1. `104x34-AUTO-CUT-INWARD2-SINGLE-ARTWORK-NOT-APPROVED.svg` — upload-source candidate, exact original logo path.
2. `140x200-4UP-INWARD2-ARTWORK-LAYOUT-NOT-APPROVED.svg` — layout study; four black artwork rectangles.
3. `140x200-4UP-INWARD2-CUT-OVERLAY-REVIEW-DO-NOT-PRINT.svg` — magenta mathematical cutline overlay, **never send as production art**.
4. `STICKER001-300DPI-EXPORT-LAB-UNAPPROVED.html` — offline browser self-contained exporter; creates 104×34 single PNG and 140×200 4-up reference PNG with 300dpi-equivalent pixel dimensions and a 300dpi pHYs metadata chunk.
5. `verify_4up_inward2.js` — offline Node.js source identity and sheet dimensional tests.

### What was actually tested
- Vector path identical to official main logo at every placement — PASS.
- Sheet rectangles, artwork gap, safe area, barcode clearance and 4-up max proof — PASS (tool-side calculation).
- Browser exporter script JavaScript syntax — PASS.
- PNG pHYs injection/verification logic with synthetic PNG chunk data — PASS.
- Full browser SVG raster/download on a real browser — **NOT RUN** during this cloud-only update, remote PC was offline.
- Vendor editor upload, cutline preview and real dimensions — **NOT VERIFIED**.
- Chosen yupo+matte option, quantity, actual cart total and 3,000KRW shipping inclusion — **NOT VERIFIED**.
- Finished product master owner signature — **NOT APPROVED**.

### Next legitimate steps
1. Open exporter HTML locally, create `104x34 ... PNG` and inspect actual alpha + print resolution.
2. Enter Publog editor (no payment), upload that single file, manually set display size to 104×34mm and cut direction **inside 2mm**, inspect resulting 100×30 cut.
3. Duplicate the **single image** four times, confirm 5mm image gap, barcode safe area, yupo or removable-yupo + matte, and quote including postage and tax.
4. Ask owner **one** approval question only when the final total, quantity and exact product are independently verified. Otherwise stop. No ordering, paying, sending or storing customer data without explicit approval.

**Safety**: first product is for indoor personal belongings; this is not a claim of compatibility with automotive painted surfaces.
