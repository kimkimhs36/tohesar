# TOHEŞAR OBJECT LAB / 05 NIGHT SHIFT ZIP — 400gsm cross-seller manufacturing evidence
**Read-only public-source study / 2026-11-10 KST / NOT ORDER APPROVED**

## A real advancement, not another garment render
Previous 05 work left the 400gsm weight of MARPPLE BeCanvas SKU 9362 as **unknown**. Independent sellers now explicitly list a **BeCanvas pigment French-terry two-way zip hoodie, 70/30 cotton-poly, at 400gsm**. This provides a verifiable **alternative manufacturing-source route** without pretending that a second shop's listing legally certifies MARPPLE's specific SKU.

The evidence is preserved in `05-400GSM-CROSS-SELLER-EVIDENCE-20261110.json`, with executable `verify_05_cross_seller_evidence.js`.

## Source-level product comparison

| Source | What is actually shown | Decision status |
| --- | --- | --- |
| [MARPPLE SKU 9362](https://www.marpple.com/kr/product/detail?bp_id=9362) | BeCanvas pigment two-way zipper; 70% cotton / 30% polyester; S–3XL; 400gsm **not shown** in current product text | Continue to mark **9362 GSM UNVERIFIED** |
| [BODATEE item 1000001018](https://www.bodatee.com/goods/goods_view.php?goodsNo=1000001018) | BeCanvas pigment French-terry two-way zip, **400gsm**, 70/30; charcoal pictured/listed, S–3XL; **1–5 pcs display price KRW 41,600 each, VAT included in stated tier** | **Concrete 400gsm blank alternative exists**; no logo, image price, stock, shipping or production confirmation |
| [CROOM 400gsm zip](https://croom.kr/products/cprod_8ba485de52c5ae4467bfd008) | Same manufacturer and pigment/fiber/2-way product family, explicitly **400gsm**. Shown KRW 28,300 promotion is for selected **BLACK**, not a verified charcoal one-piece printed total | Secondary product-family support; **not a confirmed quote** |
| [WOORIWEAR BeCanvas PGZH](https://www.wooriwear.com/product) | Supplier-style code **PGZH**, pigment oversized two-way zip, 3 colors; 34,900 KRW starting display; **GSM not stated on indexed page** | Useful lookup identifier; not a proven mapping to MARPPLE 9362 |

**Competing hypotheses:** (A) MARPPLE 9362 is the same 400gsm manufacturer style sold by BODATEE/CROOM. (B) It is a closely named BeCanvas variant sharing the 70/30 blend and cut but differing in production specification. Similar names, even identical size charts, do **not falsify B**. Obtain an explicit manufacturer style code, care-label photo or written factory specification before asserting A. The cross-seller product family 400gsm is **supported**; specific SKU 9362 equivalence is **UNVERIFIED**.

## Independent size-chart falsification

MARPPLE's saved seller size chart (S–3XL, date-stamped 2026-11-10) and CROOM's 400gsm zip chart provide three overlapping fields: length, flat chest width, sleeve length. Automated comparison checks **18 cells, 17 exact matches**. The exception is **L sleeve**:

- MARPPLE L sleeve: **57 cm**
- CROOM L sleeve: **66 cm**
- CROOM neighboring sleeves: M 56 cm, XL 58 cm

66 cm could be a source typo or a different measurement definition; it is **not proven** to be a typo. Neither table should be silently corrected. Use MARPPLE's own size table for MARPPLE purchases; ask the chosen seller for a physical garment measurement if choosing L at CROOM. All listed charts have a potential 1–3 cm manufacturing/measurement variation and are **not wearable sample measurements**.

## Honest cost comparison / not a quotation

- BODATEE public **single-blank tier**: **KRW 41,600**, VAT stated as included. Logo printing price, setup, one-piece serviceability after design selection and shipping are unverified.
- MARPPLE 9362 previous **S-sized blank-only UI observation**: **KRW 35,900**; historical generic native-text display KRW 43,900; listed base shipping KRW 3,000. These are NOT current verified logo-inclusive payment totals.
- Arithmetic blank-display difference **KRW 5,700** (41,600 minus 35,900) is **not** a like-for-like delivered-cost saving/loss calculation until product identity, selected size, taxes, printing and shipping are normalized.
- CROOM's **KRW 28,300** black promotional display is not charcoal, logo-included, size-specific or checkout-approved.

## Manufacturing decision and user-facing sequence

1. **01 SHADOW remains the FIRST physical sample priority.** No reason to redirect the first sample budget to 05 while 01 is pending narrow original-art upload approval and 1-piece quote.
2. For 05, **BODATEE 400gsm** is a newly documented construction-spec alternative. Do not silently substitute MARPPLE 9362 or CROOM for it.
3. If owner later approves *external contact only*, seek one concrete answer: whether MARPPLE 9362 is maker code PGZH / the same 400gsm pigment garment as BODATEE item 1000001018. Send **no logo or private details**. Contact permission does not authorize any artwork upload, quote acceptance, order or payment.
4. The 05 70mm ivory original vector must fit a **single front panel** away from center zipper, pocket seams and hood drawcord, and its factory print method must be confirmed. No cross-zip one-piece logo.
5. Before ordering: owner-selected size, color-specific live availability, approved physical placement, image-logo print method/opacity, final VAT/shipping-inclusive 1-piece amount, then a separate **explicit purchase approval**. Fit and laundry tests only after a real garment arrives.

## Validation and reproducibility
- Data file: `05-400GSM-CROSS-SELLER-EVIDENCE-20261110.json` (fixed public observations with null for unknowns)
- Offline validator: `node object-lab/apparel/05-night-shift-zip/supplier-proof/verify_05_cross_seller_evidence.js`
- Expected: 18 compared cells, 17 equal, only CROOM L sleeve 66 / MARPPLE 57 discrepancy; unknown 9362 GSM preserved; all external-order gates false.
- The validator only tests internal transcribed evidence consistency. It cannot independently authenticate the vendors' claims or verify the fabric GSM by physical measurement.

**No uploaded TOHEŞAR art to any vendor; no supplier message, cart, checkout, purchase, manufacture, main merge, deployment or private-data publication.**
