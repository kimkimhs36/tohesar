# TOHEŞAR OBJECT LAB — MARPPLE live charcoal vendor gate, 01 + 07

**Observed 2026-11-09, Korea-local (isolated TEAM-BKIT Google Chrome / anonymous).** **Stock and prices are ephemeral**: verify again immediately before the owner decides on a sample. No logo/PNG uploaded to supplier, no login, vendor contact, cart, checkout, payment, or order.

## Not more catalog inference — real interactive supplier configurator

| State observed in MARPPLE editor | 01 SHADOW blank candidate | 07 AFTERIMAGE CREW blank candidate |
|---|---|---|
| Official product | [BeCanvas pigment oversized tee](https://www.marpple.com/kr/product/detail?bp_id=8178) / bp_id 8178 | [BeCanvas pigment oversized crewneck](https://www.marpple.com/kr/product/detail?bp_id=9337) / bp_id 9337 |
| Color selected live | **차콜 / charcoal**, option `51557` | **차콜 / charcoal**, option `54710` |
| Size controls after selection | **S, M, L, XL, 2XL, 3XL all enabled** | **S, M, L, XL, 2XL, 3XL all enabled** |
| Displayed 1-unit product price, without artwork added | **KRW 15,700** | **KRW 26,900** |
| Displayed delivery fee | KRW 3,000 | KRW 3,000 |
| 2XL/3XL displayed surcharge | KRW 4,000 | KRW 4,000 |
| Condition noted by seller | cotton 100%, 275 g/m², pigment-washed | cotton 70% / polyester 30%, 400 g/m², pigment-washed French terry |
| Print included? | **UNKNOWN**; no print content entered | **UNKNOWN**; no print content entered |
| Owner-approved all-in total | **NOT VERIFIED** | **NOT VERIFIED** |

**Arithmetic only**: 15,700 + 3,000 = **18,700 KRW** for 01; 26,900 + 3,000 = **29,900 KRW** for 07. These are NOT print-inclusive, tax-confirmed or final payable quotes. Never label either as a sample invoice or final print cost.

### First-visit overlay bug solved

The vendor's built-in tutorial popup **“이미지 업로드”** covered the color selector. Clicking the selectbox while the overlay was open failed and left the initial default colors appearing sold out (01 khaki; 07 sand beige). After closing the visible onboarding overlay and selecting **charcoal** in the actual color dropdown, all six sizes became enabled on BOTH products. **Do not conclude all stock is unavailable from the default-color state.**

Saved on TEAM-BKIT at `C:\\Users\\kimki\\Documents\\TOHESAR-FIRST-DROP-ATELIER\\07_VENDOR_REAL_ORDER_GATE\\`:
- `marpple-8178-onboarding-fix.cjs`, `MARPPLE-8178-CHARCOAL-AFTER-OVERLAY-NO-ORDER.json/.png`
- `marpple-9337-onboarding-fix.cjs`, `MARPPLE-9337-CHARCOAL-AFTER-OVERLAY-NO-ORDER.json/.png`
- Earlier failed selector probes (before overlay fix) are **superseded** by these successful charcoal-configurator results.

### Artwork files now genuinely generated, rendered, QA-checked, and backed up in GitHub

**01 SHADOW, garment candidate 8178**
- `01-SHADOW-82MM-IVORY-PRINT-MASTER-UNAPPROVED.svg`: official vector unchanged, 82mm physical width.
- `01-SHADOW-82MM-IVORY-TRANSPARENT-2500PX-UNAPPROVED.png`: actual PNG artifact **2500 × 575 px**; alpha corners transparent, shape bbox confirmed, approximately 774 DPI metadata. Git blob `899d2014d8c247fe7e7774b65b6371c6315f72f9`.
- `01-MARPPLE-PREFLIGHT-QA.json` and `export_marpple_01_shadow.py`: reproducible source hash, path check, dimensions, alpha test; generator was run successfully on user's PC.

**07 AFTERIMAGE CREW, garment candidate 9337**
- `07-AFTERIMAGE-82MM-ONE-SURFACE-PRINT-UNAPPROVED.svg`: new original design with official path still exact, edition line and three afterimage strokes. One proposed front print surface.
- `07-AFTERIMAGE-82MM-TRANSPARENT-2500PX-UNAPPROVED.png`: real **2500 × 954 px** transparent PNG, rendered and validated on TEAM-BKIT. Blob `af363e005f3e0f4f8248408845307659dd6fee33`. Text in the added 07 line must be checked from the raster print master, not treated as supplier-proofed typography.
- `07-AFTERIMAGE-ART-QA.json`, `export_marpple_07_afterimage.py`: reproducible QA.
- `07-AFTERIMAGE-LOOKBOOK-STUDY-UNAPPROVED.svg/.png`: **editorial simulation, NOT real garment photograph or approved pattern**. Generated PNG 1400 × 1000, corrected to keep inset art fully inside frame; PNG blob `eaf86431a608165c47785d391b88fc4be7351e0b`.

Official logo source: `assets/wordmark.svg`, Git blob `e9b299f8d797625b3704103c08ea1aede5c5ea05`; the official path's SHA256 is `b7d36711e60d94465d0587e4a4e4100fba1217a2157865995717ca8c23b0d93d`. The original Ş was **not** recreated as a font. Do not rebuild it from typed text.

## The actual remaining factory gate — DO NOT SKIP

1. On user approval of *external upload*, upload **only the approved transparent PNG** to the vendor editor in a controlled anonymous session. Nothing uploaded yet.
2. Confirm print area, true 82mm width on selected physical size, **left-chest offset measured from seam/collar**, and exact Ş fidelity in seller preview. PNG file DPI metadata alone cannot enforce physical print size.
3. Read live item + design/print + setup + VAT + delivery + lead time, and any positioning service/special instructions. **Unknown print charges cannot be assigned zero.**
4. Obtain explicit user approval for artwork master, size, amount, and any purchase before proceeding. No payment or PII before approval. User has not approved any production master.
5. Physically inspect delivered sample for pigment wash, opacity, print edge, shrinkage, fit and wash durability; no garment received to date.

**Priority:** 01 SHADOW first one-piece physical sample. 07 AFTERIMAGE is a second independently designed option. 04 OFFSET SHELL is cut-and-sew and must not be mistaken for supplier print-on-blank. 05 NIGHT SHIFT ZIP and 06 AFTER HOURS long sleeve remain independent drafts. No merge into main or deployment made by this work.
