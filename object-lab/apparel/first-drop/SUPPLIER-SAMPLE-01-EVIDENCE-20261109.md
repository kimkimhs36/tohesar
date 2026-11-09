# 01 SHADOW UNIFORM — sample supplier evidence / 2026-11-09

**Status:** supplier public catalog verified, **not** a vendor-editor proof, print approval, or checkout quote. No order, payment, personal information or outside contact.

## Exact product decision gates
- Goal: 1 × washed charcoal heavyweight/relaxed shirt; official original 82 mm ivory vector chest mark; one sample, no batch.
- A. UA 20수 헤비웨이트 오버핏 티셔츠 — official KR listing **₩26,500~** (catalog, observed 2026-11-09). Need product detail URL, available charcoal option, size, print-method and final total.
- B. 컴포트컬러즈 워싱 릴렉스핏 티셔츠 — official KR listing **₩21,500~** (catalog, observed 2026-11-09). The washed material/appearance is more concept-aligned; **do not assume charcoal color is available** until selector verified.
- C. **New verified fallback** 프린트스타 14수 릴렉스핏 티셔츠 — official individual product page lists **₩18,900 / 1장**, 7.4oz (250g/m²), 100% cotton except moku grey 80/20 cotton/polyester, double stitching, sizes S–3XL shown with white selected. **Not proven washed or charcoal**, so fallback only if the first two fail color/fit/price gates. Exact individual source: https://www.ohprint.me/products/701001001105 (search-indexed product detail, crawled Nov 2026).
- D. UA 17수 오버핏 티셔츠 — official individual product page lists **₩18,900 / 1장**, 5.6oz (190g/m²), 100% cotton, S–XL shown with white selected. Reject as primary: not heavyweight or washed; only use if all heavier blanks unavailable. https://www.ohprint.me/products/701001001135
- Official Korean catalog: https://www.ohprint.me/apparel/store/tshirt-shortsleeves/overview (observed Nov 9, 2026). Korean listing differs from Japanese locale; never use JP currency/prices.
- Individual product pages state color and size selected during the **design editor** stage; **this is the real outstanding blocker**, not vector generation. They advertise free delivery at **₩50,000+**, but that does not establish the delivery fee below the threshold or final order total.

## Existing production files / no redesign
- Source-locked original chest vector and 300/600 DPI transparent PNGs exist in GitHub `object-lab/print-production-studio-20261109/object-lab/production-studio/`.
- Verified generated 300 DPI PNG SHA256: `bdb0e96737350f4715274acd25f24f3d711cb81d62606265c6e3ce6e4b01ccf7`.
- Verified generated 600 DPI PNG SHA256: `cb41377e235346bd8786029e89edeb5567bcd61006a8226d0800184b9e3e847c`.
- Original website source identity **does not constitute user approval of apparel master**.

## Next step, not completed
1. In Korean product editor, check real charcoal/washed color availability and exact size/measurements, upload the 600 DPI PNG, set chest logo at 82 mm, capture vendor preview/acceptance and exact print region.
2. Read item + ink/printing charge + VAT + shipping **all-in single unit total** from pre-checkout, without entering personal data.
3. Ask the user one approval question only with those confirmed details. Never imply this document proves a checkout price.


## 2026-11-09 / new real 1-piece published-price route — Brotherco TEST-ONE
**New evidence, not a final checkout confirmation.** Source: https://brotherco.net/test-one (official, checked 2026-11-09).
- Dedicated **one-piece sample** service, `프리미엄 티셔츠 + 단면 인쇄` price **₩20,000**, explicitly **VAT included** on this page.
- Published shipping **₩4,000**, so **₩24,000 is the mathematical subtotal only for the base 1-piece package**, if no other options or fees are applied.
- The page separately lists **색상변경 +₩5,000** and says **오버사이즈 별도추가금**. Whether washed charcoal is an option, whether the color surcharge applies, and the precise oversized charge remain **unverified**.
- Production intake described as KakaoTalk conversation. **No message has been sent.** Brand original vector 82 mm + print-placement visual can be supplied only after explicit user permission for external messaging.
- Different Brotherco page https://brotherco.net/vendingmachine advertises a **different 30,000 KRW, VAT-excluded 1-sided print package + 4,000 shipping**, with conflicting 20,000 and 30,000 headlines on that page itself. **Do not silently combine or substitute package quotes.**
- **Suitability:** public low-volume pricing and already-generated original logo assets make this a genuinely useful route for 1-piece print-process testing. But unknown fabric make/weight, precise garment color, blank size chart, editor preview, final checkout, and full extras mean it is **NOT** an approved 01 SHADOW UNIFORM production base. Do not call it washed charcoal or a perfect match.
- Existing known artwork is already generated and CI-verified (no need for new redrawing): GitHub branch `object-lab/print-production-studio-20261109`, paths `object-lab/production-studio/exports/01-shadow-uniform/SHADOW-UNIFORM-01-82mm-IVORY-600DPI.png` and `SHADOW-UNIFORM-01-CHEST-82mm-CANDIDATE.svg`; logo geometry preserved. Owner-approved **garment master equivalence still pending**.
- Rejection rule: if test-one service has no suitable dark garment or cannot deliver exact 82 mm original ivory print, do not compromise the product vision just to secure this lower public starting total.

### Comparison / decision state
| Route | Published price | VAT | Shipping | Actual tested editor / print | Key unresolved need |
| --- | --- | --- | --- | --- | --- |
| Brotherco TEST-ONE | ₩20,000 for base 1-piece + 1 print | Included on TEST-ONE listing | ₩4,000 | **NO** | Actual color, oversized charge, fabric, printed logo QC, no-contact policy |
| Ohprintme Comfort Colors washed relaxed | ₩21,500 starting | Verify final seller checkout | Verify final seller checkout | **NO** | Washed charcoal specifically offered? 82mm upload acceptance |
| Ohprintme UA 20s heavyweight oversized | ₩26,500 starting | Verify final seller checkout | Verify final seller checkout | **NO** | Dark color, exact size and print total |
| Ohprintme Printstar 14s relaxed | ₩18,900 advertised 1-unit white page | Verify final seller checkout | Verify final seller checkout | **NO** | Dark color, no washed finish proven |

**Release gates:** `base-listing-verified: YES`, `published-shipping-known: YES (TEST-ONE)`, `selected-SKU-color-size-verified: NO`, `82mm preview: NO`, `approved-apparel-master: NO`, `actual delivered checkout: NO`, `owner authorization/order/payment/PII/contact: NO`, `sample received/worn/wash-tested/photo: NO`.

**Next legitimate move:** verify a suitable dark/washed **actual garment option**, correct size and a vendor-generated preview/price with no personal data, or pivot from TEST-ONE to Ohprintme. Do not send any KakaoTalk messages without explicit prior approval. Never infer a full checkout from published package math.
