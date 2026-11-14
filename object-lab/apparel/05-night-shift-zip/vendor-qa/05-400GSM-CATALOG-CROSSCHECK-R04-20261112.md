# TOHEŞAR Object Lab / 05 NIGHT SHIFT ZIP — independent 400gsm catalogue cross-check R04

**2026-11-12 KST · Read-only public supplier research · NOT supplier-confirmed model identity, approved techpack, printed quote or order.**

## New factual manufacturing progress

The original MARPPLE candidate **SKU 9362** is publicly described as a **BECANVAS pigment oversized two-way zip hoodie**, **70% cotton / 30% polyester**, sizes S–3XL. Its own current text description **does not state GSM**. The previous object-lab documentation correctly marked its 400gsm target unverified.

Three separate public catalogues provide substantially stronger *product-family* evidence:

| Public seller | Item | Observed fabric specification | Remaining limit |
|---|---|---|---|
| [MARPPLE](https://www.marpple.com/kr/product/detail?bp_id=9362) | SKU 9362 | BECANVAS pigment, two-way zip, cotton 70% / poly 30% | **GSM not published** in MARPPLE description |
| [BODATEE](https://www.bodatee.com/goods/goods_view.php?goodsNo=1000001018) | Seller item 1000001018 | BECANVAS pigment french terry oversized **two-way zip, 400gsm, 70/30** | Independent seller ID; no canonical manufacturer code |
| [CROOM](https://croom.kr/) | BECANVAS pigment french-terry oversized two-way zip product listing | **400gsm** | No explicit MARPPLE SKU ↔ model mapping |
| [Brotherco](https://www.brotherco.net/shop_view/?idx=127) | BECANVAS pigment oversized hoodie | **400gsm, 70/30** | Does not itself confirm the same precise zipper SKU |

**Finding:** a 400gsm version of the closely matching named BECANVAS pigmented two-way zip product is corroborated by independent retailers. **Still NOT VERIFIED:** that MARPPLE SKU 9362 corresponds to the identical manufacturer model, dye lot or measured physical 400gsm garment. Similar BECANVAS two-way zip products at **360gsm and 380gsm** also exist (CROOM); brand + zipper alone is insufficient. Do not mislabel this catalogue corroboration as a factory certificate.

## NEW conflict discovered in seller-size data

Compare MARPPLE SKU 9362's 2026-11-10 verified chart in `object-lab/apparel/vendor-gates/marpple/VERIFIED-SIZE-CHARTS-4SKU-20261110.json` with BODATEE item's publicly printed chart in dimension order **length / shoulder / flat chest / sleeve**, all in centimetres.

- S: 69 / 62 / 58.5 / 55 in both sources.
- M: 71 / 64 / 61 / 56 in both.
- **L: MARPPLE 73 / 66 / 63.5 / 57; BODATEE 73 / 66 / 53.5 / 57.**
- XL: 75 / 68 / 66 / 58 in both.
- 2XL: 78 / 70 / 68.5 / 59 in both.
- 3XL: 81 / 72 / 71 / 60 in both.

**23/24 individual dimensions agree; L flat-chest disagrees by −10.0cm (BODATEE minus MARPPLE).** BODATEE's L value is lower than both its own M (61cm) and XL (66cm), suggesting a possible catalogue typo, **not proof**. Do not silently correct supplier data, select size L based on 53.5cm or treat a numerical match as same maker ID.

## Executed validation and commercial boundaries

A local Python stdlib cross-seller calculator tested the 24 POM values above: 23 matches / one −10cm exception. **7/7 independent regression tests PASS** in a real local container, checking mismatch detection, bad composition, changed dimension order, size omissions, NaN/bool rejection, and fail-closed production status. The machine-readable catalogue evidence snapshot is now also committed at `object-lab/apparel/05-night-shift-zip/vendor-qa/05-BECANVAS-CATALOG-EVIDENCE-R04-20261112.json`. The independently executed Python calculator and its seven regression tests remain **local companion artifacts, not GitHub-tracked code**; do not claim GitHub CI executed them. Vendor real-Chrome, GitHub CI, physical fabric testing and checkout were **NOT RUN**.

BODATEE publicly lists **41,600 KRW** per blank for 1–5 units (VAT included as stated) and **5,000 KRW** listed base delivery. Their simple 46,600 KRW sum is **not** an actual TOHEŞAR artwork-print quote, nor confirmed payable total. MARPPLE's saved generic-text test S 35,900→43,900 KRW, listed shipping 3,000 KRW, remains a dated **placeholder-text observation**, not a genuine logo quote. No verified current stock/size, printing method, underbase, zipper clearance, logo placement or physical sample.

## Decision and exact next action

**State: PUBLIC CATALOGUE EVIDENCE IMPROVED / 05 PRODUCTION HOLD.** Verify a **manufacturer style code** that explicitly connects MARPPLE 9362 to a particular **400gsm** BECANVAS item, resolve L chest **63.5 vs 53.5cm**, then verify an original ivory 82mm logo can be printed entirely on the single left-front panel away from zipper and pocket. Prefer public documents; vendor contact or original-Ş upload requires separate narrow owner permission. No shopping cart, order, money, buyer data, vendor communication, main merge, or site deployment.

**01 SHADOW remains the first wearable sample priority**; keep its separate PR #38 unchanged. The existing 05 product work remains in Draft [PR #36](https://github.com/kimkimhs36/tohesar/pull/36).
