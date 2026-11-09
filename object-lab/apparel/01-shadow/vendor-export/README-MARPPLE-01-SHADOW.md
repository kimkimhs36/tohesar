# TOHEŞAR OBJECT LAB — 01 SHADOW · MARPPLE physical sample gate

**2026-11-09 / Internal production trial / NOT APPROVED / NOT ORDERED**

This folder contains a real, source-locked image export and evidence from a live anonymous MARPPLE product editor. Do not conflate this with a printed garment, seller-approved proof, final quote, production authorization or actual user size selection.

## Artwork that now EXISTS on GitHub
- `01-SHADOW-82MM-IVORY-TRANSPARENT-2500PX-UNAPPROVED.png`: **real binary image**, 2500 × 575 RGBA, intended physical art width **82 mm**. Alpha bounding box `[4,4,2491,569]`. Ivory `#f8f2e7`. Uploaded only to our GitHub source repository, **never to the supplier**.
- `export_marpple_01_shadow.py`: executed successfully on authorized TEAM-BKIT Windows PC. Requires `Pillow` and `resvg_py`, network access to the pinned source SVG. It rejects changed master source/path SHA-256 and validates output dimensions, transparent pixels and image alpha bounds.
- `MARPPLE-8178-LIVE-20261109-QA.json`: sanitized observed product and vendor comparison; not a sales receipt.

**Logo integrity**
- Original SVG source SHA-256: `17d4ac8b0e3f13d8b4e76e5c335a9ee42a603136401d8fa81422b70ae5337d20`
- Original `d` path SHA-256: `b7d36711e60d94465d0587e4a4e4100fba1217a2157865995717ca8c23b0d93d`
- Source: repository `assets/wordmark.svg` (original preserved, including **Ş**).
- Image width 2500 px / 82 mm gives ~774.4 PPI nominal pixel density. **MARPPLE may discard DPI metadata**. Do not infer on-garment physical width from image alone. Apply correct scale in editor and confirm via final artwork proof.

## Live seller test — what was actually observed

- Product: [MARPPLE Becanvas pigment oversized T-shirt / product 8178](https://www.marpple.com/kr/product/detail?bp_id=8178). Anonymous browser chose **차콜** and test size **M**, quantity 1. Selection only; not the user's intended size.
- The color-specific six size controls **S/M/L/XL/2XL/3XL were enabled** when observed on 2026-11-09. 2XL/3XL showed **+₩4,000**.
- Product editor displayed **₩15,700 unit** and **₩3,000 base shipping**. **₩18,700 is mathematical item+base-shipping sum only, NOT a fully printed quote.** Seller could charge for printing, setup, special placement or other tax/shipping differences.
- **Cart button became enabled** when charcoal was selected. We DID NOT click it, start checkout, upload the original logo, or enter any contact details.
- **Native text design tool opened successfully in a separate test**, demonstrating basic editable graphic surface, but this is not an official-logo mockup or a price quote for official image art.
- Contrast: [Becanvas pigment oversized sweatshirt / product 9337](https://www.marpple.com/kr/product/detail?bp_id=9337) displayed ₩26,900 + ₩3,000 shipping but **all charcoal sizes were disabled/sold out**. Do not recommend 07 crewneck on that specific SKU until stock recovers.
- The seller's instructions say editor image uploads support **PNG/JPG**, with vector originals via post-order support. **No supplier logo acceptance or true print position was proven**.
- All stock/price data is dated, dynamic, not a guarantee of availability.

## Remaining non-negotiable gates

1. Owner explicitly approves testing original branding in a third-party editor **before any upload**.
2. Place official `82 mm` logo at a measured left-chest position in the product editor, verify **Ş**, no white rectangular background, and no print-area violation.
3. Confirm whether custom-logo printing affects unit price, any setup cost, actual shipping/tax and total **as displayed by seller**. Do not label arithmetic as a quote.
4. Check garment size chart in centimeter measurements and ask owner to select the sample size. M in these records is **not** owner-approved.
5. Check pigment washing with ivory print, method, opacity, transfer edge, stretch, shrinkage, care and returns.
6. Owner explicitly approves final price, garment and artwork **before any order/payment**. No PII or vendor outreach without approval.

## Re-run and verification

On Windows with Python 3.12, Pillow and resvg_py installed, run:

`python object-lab/apparel/01-shadow/vendor-export/export_marpple_01_shadow.py`

A local `MARPPLE_PRINT_ART` directory is produced; exact same path and source checks gate the output. For dynamic seller stock checks, see `check_marpple_charcoal_stock_readonly.cjs` (Puppeteer required). The snapshot from 2026-11-09 is not a stock promise. Keep newly generated snapshots internal unless verified and sanitized.

No main-branch merge, site deployment, supplier upload, sample order, payment or user PII in this work.
