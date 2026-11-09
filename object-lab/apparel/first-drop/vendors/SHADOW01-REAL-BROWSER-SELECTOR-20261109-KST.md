# TOHEŞAR OBJECT LAB — 01 SHADOW UNIFORM / REAL SUPPLIER SELECTOR 2026-11-09
**Evidence captured by an authorized Chrome installation on TEAM-BKIT remote Windows computer, 2026-11-09 ~19:09–19:16 KST. This is seller UI testing, not vendor acceptance, physical print, final quote, reservation, cart, payment or order.**

## Advance over previous public-price research
Actual Chromium (Puppeteer) inspected **real product selectors** for three publicly reachable candidates without login, entering personal information, sending messages, uploading artwork, adding to cart, or purchasing. Each page returned HTTP 200. Screen captures + machine-readable DOM evidence were saved locally to `C:\Users\kimki\Documents\TOHESAR-FIRST-DROP-ATELIER\07_VENDOR_REAL_ORDER_GATE\`. Those paths are on the user's remote PC, **NOT committed GitHub files or universally accessible URLs**. Never fabricate a downloadable GitHub PNG from their existence.

### WEFORM × BECANVAS 32수 2합 pigment, product #10462
Visited exact seller page:
https://oasisent1.cafe24.com/product/detail.html?product_no=10462

**Directly observed (Chrome, not a search excerpt):**
- Actual first option select `#product_option_id1` displays **차콜**, value `2226`, enabled among 6 colors (black, charcoal, blue, khaki, brown, burgundy).
- Second select `#product_option_id2` includes **S/M/L/XL, all without stated surcharge**, value `2244` for **M**, **2XL and 3XL +₩3,300**.
- Selected **charcoal + M** only as a **test variant**, NOT user-approved size. Seller dynamic item summary showed **shirt subtotal ₩15,000**, and publicly displayed **ordinary delivery ₩3,000** for orders below ₩100,000.
- Selected `빠른 인쇄 (DTF)` successfully: blue/active radio style. Its own additional option list contains **왼가슴 +₩2,000** (`addproduct_option_id_10596_1` value `P0000PRO000A`). Uploaded file format guidance says **JPG, PNG, AI, PSD, max 10MB**, but **no original artwork was shared with seller**.
- **Important live UI blocker:** After selecting DTF the custom '2. 인쇄 위치 선택' box remained **visibly blank** in headless Chrome; summary said `선택된 인쇄 위치가 없습니다.`. Selecting the separately existing Cafe24 native '왼가슴' dropdown did **not** register a custom print position. Clicking local `옵션선택` (NOT purchase/cart) left total at zero/no position; no page JS exception or alert appeared. **This is an observed failure in this tested browser, not proof that checkout is universally broken.**
- Consequently the ₩15,000+₩2,000+₩3,000 = **₩20,000 remains conditional arithmetic**, **NOT** a tested payable one-piece checkout quote. *82mm actual DTF print area*, stock allocation, VAT treatment at checkout, supplier proof of accurate Ş, garment master approval are all **not verified**.
- Saved local screenshots:
  - `PUBLIC-WEFORM_BECANVAS-NO-ORDER.png` (live seller base selector)
  - `WEFORM-CHARCOAL-M-SELECTED-NO-CART.png` (actual chosen color+size subtotal)
  - `WEFORM-CHARCOAL-M-DTF-PRINT-OPTIONS-LOWER.png` (DTF active; empty print location UI)
  - `WEFORM-M-DTF-POSITION-GATE-AFTER-OPTION.png` (unresolved gate)
- Saved local browser captures:
  - `PUBLIC-SELECTOR-EVIDENCE-20261109.json`
  - `WEFORM-CHARCOAL-M-SELECTOR-PROOF.json`
  - `WEFORM-CHARCOAL-M-DTF-LEFT-CHEST-NO-ORDER.json`
  - `WEFORM-M-DTF-POSITION-GATE.json`
- Do **not** spend more runs forcing WEFORM's blank custom location unless there is a real verified new capability or site fix.

### BODATEE BECANVAS pigment, SKU 1000000842 / pivot
Seller page: https://m.bodatee.com/goods/goods_view.php?goodsNo=1000000842

- Opened live **색상 & 수량 설정** panel in Chrome without cart/order confirmation.
- Observed clickable **차콜** swatch `li.color_choose[title="차콜"]`, with style reference RGB-ish `#565656`. This is a web swatch, **not physical dye/washed color measurement**.
- Body explicitly labels **16,900원 / 1장 소량가** while a larger **14,900원 / 30장이상 할인가** appears in the selection drawer. Never quote ₩14,900 as a one-piece final price.
- Publicly described **275gsm, 100% cotton, pigment dye, S–3XL**, transfer printing availability and a 1-piece path. Its print quality, exact charcoal inventory, and one-logo print+delivery all-in final total still unverified. Previous sources conflict about shipping (product detail 'free' vs general policy ₩5,000), so actual seller checkout controls.
- Captured `PUBLIC-BODATEE_BECANVAS-NO-ORDER.png`, `BODATEE-COLOR-SIZE-SELECTOR-NO-ORDER.png`, related selector JSON in the same local folder.
- Seller warns that very thin strokes may be modified for printing; our original brand `d` path/Ş may **not** be altered without explicit owner approval.

### Ohprintme Printstar 14s check
- Actual page https://www.ohprint.me/products/701001001105 responded HTTP 200 and confirmed size selection takes place at the design-editor stage.
- This is **not** equivalent to approved washed pigment-charcoal SHADOW 01; keep as backup for testing, not force substitution simply because editor is accessible.

## Physical release checklist after current real screen inspection
| Gate | Real state |
| --- | --- |
| Official original path preserved / 82mm candidate exist | YES in existing GitHub assets |
| Current actual WEFORM charcoal selector exposed | YES |
| Test size M price dynamically displayed | YES / unapproved test size |
| DTF type visibly selectable | YES |
| LEFT CHEST extra fee option listed | YES / custom position not accepted |
| Real left-chest added to seller payable order | **NO** |
| Successful original 600DPI PNG vendor upload / 82mm Ş visual proof | **NO** |
| Vendor-confirmed unit quote including print + tax + shipping | **NO** |
| Chosen wearer size and actual stock reservation | **NO** |
| Owner approved final garment artwork | **NO** |
| Order/payment/address/external communication | **NO** |
| Physical sample delivered/worn/wash tested | **NO** |

**Next meaningful action:** Within seller's non-committal interface, test BODATEE charcoal + an illustrative one-piece size and print options to get actual **ink+delivery charge** or switch to another credible 1-piece manufacturer with an actually functioning selector. If login or external logo upload is required, do not silently submit unapproved artwork or PII. Obtain user product-master approval and actual color/size/total evidence before ordering. Do not merge into `main` or use sticker's ₩50,000 budget for clothing.

**Original identity:** repository `assets/wordmark.svg` source Git blob `e9b299f8d797625b3704103c08ea1aede5c5ea05`. Existing 600DPI and preproduction ZIP are on separate Object Lab branches; unchanged in this run.


## SECOND CHROME PASS — BODATEE quantity 1, new browser screenshots preserved in GitHub
Observed 2026-11-09 ~19:21 KST on TEAM-BKIT in an isolated browser session:
- Clicked the **차콜** chip in the supplier's size+quantity panel; actual `input.cntInp[data-color="차콜"][data-size="M"]` existed with option ID **47433**, no displayed size surcharge. Entered **1** as an **illustrative test quantity only**.
- The **seller's own live dynamic total** became: **총 상품금액 (장당 16,900원) 16,900원**, **총수량 1장**, **인쇄/포장 0원**, **총 합계금액 16,900원**. This is **blank-shirt subtotal before print and shipping**, NOT a delivered or printable checkout. No account, cart commit, personal address, artwork upload, external message, payment, or order.
- BODATEE charcoal size S/M/L/XL use zero displayed size option surcharge; **2XL/3XL +₩3,500** in this seller, which differs from WEFORM's own +₩3,300.
- Selected product base evidence survived real page interactions and is more informative than stale 30-piece headline ₩14,900. Seller may still reject inventory or change price at checkout.
- Actual source screenshots now **committed in GitHub** (rather than only local PC):
  - [BODATEE real 1× charcoal M calculated 16,900 KRW blank subtotal](../vendors/real-browser-proof-20261109/BODATEE-CHARCOAL-M-ONEPIECE-16900.png), binary Git blob SHA `cabdeffea2bcdfa7a772900144abe8c94422e9ad`.
  - [WEFORM DTF print-location UI is empty even after choosing charcoal/M and print type](../vendors/real-browser-proof-20261109/WEFORM-CHARCOAL-M-DTF-POSITION-PENDING.png), Git blob SHA `bd42facb274566cd6ace37655eb52ed6047ea4ca`.
- Screenshot/source-image creation does not prove actual garment texture, real sample delivery, print quality, usable logo upload or supplier print acceptance.
- **Next verified blocker remains printed 1-piece final cost**: BODATEE dynamically priced blank 16,900 KRW + unresolved print + conflicting delivery guidance, together with supplier approval of the 82mm **unchanged Ş** artwork. Do not ask the owner to pay based on a blank-subtotal preview.
