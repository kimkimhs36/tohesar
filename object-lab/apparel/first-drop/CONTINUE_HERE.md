# TOHEŞAR OBJECT LAB — RESUME POINT (2026-11-09)

## Start here
This is the **latest source backup for APPAREL FIRST DROP R02**. This feature branch is not main and not publicly released. Source-of-truth art master approval remains pending. We have not ordered, paid, contacted outside vendors, or provided personal info.

GitHub branch: `object-lab/apparel-first-drop-r02-20261109`
Repo: `kimkimhs36/tohesar`
Source vector: repository `assets/wordmark.svg`, git blob SHA `e9b299f8d797625b3704103c08ea1aede5c5ea05`. Original logo d path MUST remain exact; never redraw Ş or recreate branding text.

## Windows local full snapshot
Computer: TEAM-BKIT
Folder: `C:\Users\kimki\Documents\TOHESAR-FIRST-DROP-ATELIER`
Archive: `C:\Users\kimki\Documents\TOHESAR-FIRST-DROP-ATELIER\TOHESAR-FIRST-DROP-LATEST-R02-BACKUP.zip`
Archive size: 5,822,059 bytes. ZIP contains 77 files; integrity checked.
Archive SHA256: `f0965ae1cb9cac272880a2e4316cb5ff7e04d4a48b347ac31bc8663a5f8d9e74`.
This zip contains screenshots, PNGs and PDF preproduction technical packs (not all binary files are on GitHub).

## Source backup on this branch
- `INDEX.html`: FIRST DROP collection showcase for 4 concepts.
- `SAMPLE-LAB.html`: offline sample workflow with 01 vs 04, proposed POM vs actual measured values, price input, gates and local-only data. No checkout.
- `BRAND-ORIGINAL.svg`: identical official website source logo asset.
- `06_SIGNATURE_R02/04R02-ATELIER.html`: separate 04.R02 editorial comparison page.
- `06_SIGNATURE_R02/04R02-{A,B}-{FRONT,BACK}.svg`: exact source-logo path / color and construction variant drawings. Images can be rendered from SVGs if needed; local zip also has .png.
- `06_SIGNATURE_R02/04R02-DETAIL-STUDIES.svg` and `06_SIGNATURE_R02/build_signature_r02.py`: component art and reproducible artwork generation script.
- `05_OFFSET_SHELL_ENG/04-FRONT-BACK-ENGINEERING-R01.svg`, `04-TECH-SPEC-DRAFT.json`, `04-PROPOSED-{BOM,POM}.csv`, `04-SEWING-ORDER.csv`, `build_offset_shell_r01.py`: technical draft. NOT final cuttable pattern.

## Current design decision
- **01 SHADOW UNIFORM**: best low-risk first physical sample, 82mm original front wordmark on supplier-chosen blank, after actual supplier/size/price confirmation.
- **04 OFFSET SHELL R02**: separate custom cut-and-sew design; 2 front panels with curved diagonal join, simple unprinted back, small low-front original wordmark and side tab.
- Two R02 treatments: A MONOLITH / TONAL preferred as restrained main; B PETROL / INTERRUPTION exploration.
- 04 construction cannot be accomplished with standard print-on-blank; requires patternmaker consultation and sample first.
- 12 provisional POM targets, 9 provisional BOM components, and 16 sewing/validation steps in source materials, NOT physical measurements or approved tolerance/grade. User signature garment master not approved.
- All source claims are internal proof. No physical sample, no certified garment price or production acceptance. No orders or vendor outreach.

## Work after PC power-off
1. Can continue reviewing/editing source SVG, HTML, PY, and specs via this GitHub branch using connected GitHub tools without accessing the remote PC.
2. To regenerate raster images, reconnect TEAM-BKIT and execute existing build scripts (Windows Python 3.12 with Pillow and resvg_py available on that device) or run a comparable local environment. Running the showroom files straight from GitHub without restoring local PNG/packaging images will not supply all imagery.
3. Use local zip as full fidelity recovery when remote computer is reconnected.
4. Next meaningful task: compare A/B with real material feasibility; source blank/actual quoted supplier for 01; patternmaker feasibility for 04 after user approves any outreach. Do not fabricate quotes.
5. DO NOT create unrelated apparel concepts simply to increase counts; optimize actual product design and prototypes.

## Sticker 001 is separate
The 100x30mm black/ivory original wordmark small-run sticker remains handled under `object-lab/sticker-001-proof-20261108` with a max 50,000 KRW budget, vendor editor/cutline and all-in total not yet verified. No purchase without explicit approval. Clothing budget is NOT implicitly 50,000 KRW.

**Safety of backup:** GitHub contains source, local zip contains full visuals. Do not claim files have been merged into main, deployed, ordered, or manufactured.

## Latest independent development milestone — 2026-11-09 / FIRST DROP VALIDATION LAB
Cloud GitHub branch now includes **three new artifacts** (after the earlier full local snapshot):
1. `01-SHADOW-SOURCE-LOCKED-FRONT.svg` — official logo path preserved in one first-sample garment illustration.
2. `DROP-VALIDATION-LAB.html` — designed multi-file internal research app, using original SVG assets, three-option anonymous product preference testing, locally stored votes, CSV export, fully blank supplier-quote unit economics with fixed-cost break-even, production gates and links to relevant vendor catalogue.
3. `DROP-VALIDATION-PORTABLE.html` — self-contained ~98 KB offline-capable version with **six inline SVG image occurrences**, no broken relative asset paths, JavaScript syntax compiled successfully. This is the simplest file to download and open on another computer. Local storage may behave differently under some file:// browser policies; users can export CSV and JSON to preserve tests.
`INDEX.html` on this GitHub branch also links DROP CONTROL and the portable version.

Official price reference (not checkout): [Oprintme short-sleeve catalogue](https://www.ohprint.me/apparel/store/tshirt-shortsleeves/overview), observed 2026-11-09, lists UA 20s heavyweight oversized at **KRW 26,500~** and Comfort Colors washed relaxed at **KRW 21,500~**. These are public starting prices, **not** manufacturer-confirmed TOHEŞAR printing/shipping/tax totals. No one-piece selected option, fabric gsm, logo print acceptance, or payment verified.

**Environment boundary:** R02 feature branch was updated through the connected GitHub app while remote PC availability became unreliable. These latest cloud additions are not guaranteed to be in the earlier TEAM-BKIT ZIP snapshot. Restore latest HTML and source SVG from this branch when the PC reconnects. No public website deployment or main merge was performed.

**Business next action:** (1) test garment preference with real people without collecting identity information, (2) confirm a suitable first-sample blank's complete price and print area in a vendor editor, (3) decide on 01 sample after approved master and explicit order consent, (4) keep bespoke 04 as patternmaker-led development. Do not treat anonymous sample feedback as actual preorders or demand commitments.


## QA milestone — 2026-11-09 / STICKER AND APPAREL GATE UPGRADES

### Sticker 001 production engineering
Working sticker branch: `object-lab/sticker-001-proof-20261108`.
- Official Publog cutter supports inner/outer 0.5, 1 or 2mm offsets. Given desired final sticker 100×30, 104×34mm black/ivory artwork + **inner 2mm** offers nominal 100×30 and 2mm black trim bleed. See `object-lab/sticker-001/104x34-AUTO-CUT-INWARD2-SINGLE-ARTWORK-NOT-APPROVED.svg`.
- A cautious 140×200 sheet 4-up uses artwork y=12/51/90/129, 5mm graphic gaps, safe barcode clearance. Exact original SVG logo path verified across 4 copies. This is a candidate only, NOT vendor editor accepted.
- `object-lab/sticker-001/STICKER001-300DPI-EXPORT-LAB-UNAPPROVED.html` embeds source-locked single and sheet SVGs, implements browser PNG export with 300dpi pHYs metadata and alpha checks. JS syntax and synthetic pHYs chunk tests pass; full browser raster/download did not run while TEAM-BKIT remote was offline.
- `object-lab/sticker-001/verify_4up_inward2.js` and `4UP-INWARD2-PRINT-GATE-AND-QC-20261109.md` record repeatable geometry and source checks, options and remaining release gates.
- Publog website source: https://www.publog.co.kr/sub_fancy/diy_sticker.s2.asp?opt1=syn&opt2=9 . Actual yupo+matte checkout total and cutter interpretation remain UNVERIFIED. No orders.

### Apparel preference and economics regression
- Portable test tool at `object-lab/apparel/first-drop/DROP-VALIDATION-PORTABLE.html` includes source-locked vector illustrations, local-only anonymous votes, CSV download, blank-first cost estimator, fixed-cost breakeven and internal release gates. It is not a sales page.
- Added `verify_drop_validation.js` which exercises product selection, one-click duplicate blocking, score stats, local storage and synthetic direct-cost/margin/fixed-cost arithmetic without any personal or actual vendor data.
- Tool-side deterministic mock-DOM exercises showed **one recorded synthetic 04A vote, 100% 4–5 score ratio for the single test record, reset between respondents, 27,000 KRW synthetic direct cost, 13,000 KRW synthetic contribution and 3-unit fixed-cost recovery**. These are **TEST FIXTURES**, not user sales metrics or real costs. Full browser rendering remained untested this cloud-only run.

**Operational next action:** Prioritize completing one exact actual vendor editor preview and an all-in quote rather than producing further status/review documents. If the remote PC is offline, continue GitHub source development and keep vendor verification PENDING. Preserve both feature branches and explicit user approval gates.


## 2026-11-09 / NEW one-piece DTF route and physical 82mm print-scale proof

- **Verified source evidence newly saved:** `vendors/01-SHADOW-REAL-ONE-PIECE-PRICE-ROUTES-20261109.md`, researching **WEFORM + BECANVAS pigment 32s double-ply**, exact source URL, advertised single left-chest DTF +₩2,000, shirt ₩15,000, ordinary shipping ₩3,000. **₩20,000 is component arithmetic only, never a selected charcoal+size checkout total.** WEFORM publicly lists PNG upload ≤10MB but no upload was executed; a web variant displays SOLD OUT. Require actual live inventory/size and full option check.
- **Alternative confirmed from a different retailer:** BODATEE SKU 1000000842 visibly lists charcoal and S–3XL with flat measurements, 275gsm pigment cotton, 1–5 qty shirt ₩16,900, domestic shipping ₩5,000, VAT-inclusive listed pricing. **₩21,900 is before printing**. Its printed ordering path requires membership/artwork proof after order intake; we did not log in, select, upload, message or buy.
- **New tangible non-vendor print check:** `exports/01-shadow-uniform/SHADOW01-A4-82MM-PAPER-SCALE-PROOF-UNAPPROVED.svg` — 210×297mm physical-size A4 art, original wordmark `d` copied verbatim, ivory original fill, 82mm logo canvas and 100mm calibration bar. Script verified its source equality with `assets/wordmark.svg`. This is a paper ruler proof only, NOT actual DTF, factory color, manufacturer approval or physical sample. **Existing 600DPI PNG+production intake ZIP untouched.**
- **Next single blocker:** WEFORM true charcoal size/in-stock state + accepting our **original 82mm source-locked PNG** for 1× left-chest DTF + exact total with taxes/delivery. If unavailable, pivot BODATEE. Do not proceed through private registration/order placement/third-party upload or contact without owner authorization. No order, checkout, PII, stock-confirmation, wearable sample, or washing QC claimed.


## 2026-11-09 / VERIFIED A4 PDF PAPER PROOF + original 82mm DTF geometry CI

**Actual repository changes and checks (not actual apparel manufacturing):**

1. Original source-locked 82mm check now reproducible using `node object-lab/apparel/first-drop/verify_82mm_dtf_preflight.js` (read-only). Cross-checks `assets/wordmark.svg` blob SHA1 `e9b299f8d797625b3704103c08ea1aede5c5ea05`, full unchanged candidate `d` path, physical width 82mm, ivory fill, even-odd compound fill, hollow 84mm² fixture. GitHub Actions `.github/workflows/object-lab-shadow-dtf-preflight.yml` verified and passed: https://github.com/kimkimhs36/tohesar/actions/runs/42578882595
2. Actual geometric output preserved in `exports/01-shadow-uniform/SHADOW01-82MM-DTF-VECTOR-PREFLIGHT-20261109.json`: original has **8 contours, 979 edges**, 82mm artboard width, **81.556mm filled-ink width**, **416.792mm² filled area**. Independent DTF *reference-only* 0.5mm threshold: horizontal scan has **1.188% narrow-area fraction**, vertical **3.491%**. Narrow corner tapers count in these figures; **DO NOT equate them with actual unprintable line failure**. Reference https://help.housedtf.com/portal/en/kb/articles/artwork-guidelines-18-9-2024 . THIS IS NOT WEFORM'S ACCEPTANCE STANDARD. Original paths and the separate vendor 600DPI logo PNG were not modified.
3. A true **one-page A4 PDF**, not a mock SVG: `exports/01-shadow-uniform/SHADOW01-82MM-A4-PRINT-AT-100PCT-UNAPPROVED.pdf`. Draws actual unchanged original path as PDF **vector** with correct even-odd compound fill, canvas 82mm, physical 100mm calibration bar and independent 20mm square. PDF Git blob SHA1 `e7f4297b6c62779228a917cbed9b8aa240bde2b6`, 12,198 bytes. Intended usage: print on A4 at **100% / actual size**, **NO fit-to-page**, measure the printed 100mm line before evaluating 82mm size. PDF is **paper-only**, not the factory upload master or approval of color/transfer.
4. CI **actually rendered PDF via PDFium**, 1191×1684 px, dark substrate sample RGB (48,51,49), original ivory-rendered pixels 12,363, A4 MediaBox correct, 100mm calibration line tested, render passed. Rendered preview permanently stored at `exports/01-shadow-uniform/SHADOW01-82MM-A4-PDFIUM-RENDERED-PROOF-UNAPPROVED.png`, 120,583 bytes, Git blob `ce51af6130d3c216149616cb8ff007e9334fc869`. CI: https://github.com/kimkimhs36/tohesar/actions/runs/42578882595 . The preview is **PDFium output**, not a garment photograph. Paper has not been physically printed.
5. Seller facts rechecked: WEFORM product publicly offers ₩15,000 blank + ₩2,000 left-chest DTF + ₩3,000 standard shipping = **₩20,000 component arithmetic only**, not a size/color-verified or all-in checkout. The store asks product color/size selection before PNG upload. BODATEE same pigment charcoal product lists **₩16,900 for 1–5** and **₩14,900 for 30+**, so do **not** quote its headline ₩14,900 for a one-piece order. Brotherco pigment `10장제작/왼가슴인쇄포함` ₩22,000 is explicitly ten-piece pricing; unsuitable as a 1-unit quote, and under 10 is consultation-only. Product printer files, stock availability, exact final payable, owner master approval, external upload, sample order, delivery, wash test: **NOT completed**.

**Only next priority**: exact product configurator and genuine pre-checkout price (1× *charcoal* chosen size, left-chest one 82mm original Ş ivory, VAT, delivery) with a seller-generated upload/preview where permitted. If WEFORM unavailable, use BODATEE or 11st identified BECANVAS charcoal, without repeating prior failed static page. Since browser interactivity is unavailable in chat and TEAM-BKIT remote is offline, **do not fake this gate or advance to order approval**. No supplier messages, external uploads, payment, personal-data use, or `main` mutation without owner consent.


## 2026-11-09 / SHADOW SAMPLE LAB R03 — physical garment sizing + actual Chromium proof

### Real material change, not another concept mock
- Modified the **existing** `SAMPLE-LAB.html` rather than inventing a new site or redoing the brand master.
- The initial tab now opens **01 SHADOW UNIFORM**, not 04. Added actual BODATEE supplier's six-size flat garment chart S–3XL to compare shoulder / half-chest / sleeve / body-length of **a personally measured favorite T-shirt**, not the user's body measurements. Blank/invalid self-measurements remain unknown; all deltas are marked **not purchase recommendations, stock or production certification**.
- Added **WEFORM BECANVAS** supplier product link and ₩15,000 blank / ₩2,000 one-left-chest DTF / ₩3,000 normal delivery **published arithmetic = ₩20,000 only**, explicitly not a selected color/size checkout quote. At BODATEE, corrected a price conflict: its *specific SKU page* advertises **delivery free (plus region-specific extra)** while a *generic seller FAQ* mentions ₩5,000 base under 20 pcs. Shipping for one configured SKU therefore **UNCONFIRMED**; do NOT quote old ₩21,900 as certain.
- Fixed a broken hero PNG reference by pointing it at the **existing SVG**, and fixed a nonexistent 04 techpack PDF link by pointing it to the actual 04 technical JSON. Added already-created **A4 82mm actual-size PDF proof** link and product-specific sample acceptance gates (sample delivery; exact original Ş; heat press marking on pigment dye; surface touch; pre/post wash, photography).
- Source of truth record for the vendor conflict: `vendors/01-SHADOW-REAL-ONE-PIECE-PRICE-ROUTES-20261109.md`. 04 OFFSET SHELL independent pattern construction untouched; sticker PR #35 untouched; no main/prod changes.

### Reproducible tests with actual observable receipts
- Static/DOM regressions: `node object-lab/apparel/first-drop/verify_sample_lab_r03.cjs`.
- **Actual Playwright Chromium desktop/mobile**: `node object-lab/apparel/first-drop/verify_sample_lab_browser_r03.cjs`, automatically exercised on GitHub Actions; **real source SVG loads**; 01 default; size M vs owned tee gives shoulder +4cm/chest +3cm/length +2cm/sleeve +1cm; local persistence survives reload; 04 independent tab still works; no JS errors.
- A real mobile overflow bug was caught: CSS grid min-content caused a **461px page on 390px device** and original test falsely compared innerWidth (which expanded). Fixed CSS min-width of grid children and updated test to compare actual Playwright **390px device viewport**. Verified **scrollWidth = 390px** with no overflow. Desktop 1440px passed.
- GitHub Actions successful browser+unit run: https://github.com/kimkimhs36/tohesar/actions/runs/42580332858 .
- Real persisted Chromium screenshots (NOT generated visual mockups):
  - `exports/01-shadow-uniform/sample-lab-browser-proof-r03/SHADOW-R03-DESKTOP-1440.png`
  - `exports/01-shadow-uniform/sample-lab-browser-proof-r03/SHADOW-R03-MOBILE-390.png`
  - `exports/01-shadow-uniform/sample-lab-browser-proof-r03/BROWSER-R03-QC.json`
- Browser screenshot save also solved an actual CI race: pinned ubuntu-24.04 for Playwright 1.55 compatibility (ubuntu-latest had switched to ubuntu-26.04); added CI serialisation and safe GitHub rebase before pushing, with no forced overwrite.
- Authentic wordmark untouched; SVG/DPI/PNG preproduction original proofs from prior run intact.

### Next SINGLE physical blocker
**Obtain one actually configured and verified vendor proof, not another UI/review app.**
1. On WEFORM's verified product page https://oasisent1.cafe24.com/product/%EB%B9%84%EC%BA%94%EB%B2%84%EC%8A%A4-%ED%94%BC%EA%B7%B8%EB%A8%BC%ED%8A%B8-%EB%B0%98%ED%8C%94-%ED%8B%B0%EC%85%94%EC%B8%A0-32%EC%88%98-2%ED%95%A9/10462/category/95/display/1/ confirm selected **washed charcoal + measured size + 1 quantity**; 82mm ivory **original Ş PNG** at exact dimensions; single left-chest DTF fee; actual shipping + VAT + total **in seller system**.
2. If WEFORM has SOLD OUT or no suitable color/print area, pivot to BODATEE SKU 1000000842 or another 1-piece matched-pigment seller, without presenting generic prices as final checkout.
3. Given browser interaction unavailable in chat, TEAM-BKIT Remote Desktop is **OFFLINE**; supplier chooser/PNG upload/payment was NOT executed and cannot be certified by CI. Never contact sellers/upload source externally, provide PII, order or pay without explicit owner approval. Garment final master remains unapproved; no physical sample received/worn/washed.


## 2026-11-09 19:23 KST / REMOTE CHROME LIVE VENDOR 1× CHARCOAL ADVANCE

**This run is actual seller configurator interaction and evidence, not more generic web/catalog research.**
- Remote TEAM-BKIT connection confirmed ONLINE. Isolated real Google Chrome launched with Puppeteer. No existing browser account/session, user data, external messages or seller artwork uploads accessed.
- **WEFORM**: actual live product #10462 selected `차콜 (2226)` + test size `M (2244)`, resulting shirt subtotal 15,000 KRW. Chose actual DTF option. The print-location UI remained blank and `선택된 인쇄 위치가 없습니다` persisted; its separate native option still lists left-chest +2,000 KRW, but it did not register. Conditional 20,000 arithmetic is **NOT final usable quote**. In that browser, no print-position proof or 82mm upload acceptance. Stop retrying same broken UI.
- **BODATEE**: SKU 1000000842 color swatch `차콜` selected in real color/quantity pane. Input `data-size=M,data-optno=47433`, test quantity 1, **actual dynamically calculated seller subtotal 16,900 KRW for 1 shirt**, print/packaging 0, not shipping. Size M just a test, **not a user choice**. Print + VAT/delivery total, actual stock, 82mm original upload, seller final proof **UNKNOWN**. Seller 2XL/3XL +3,500 KRW, differing from WEFORM's +3,300 KRW.
- Ohprintme Printstar detail opened as tertiary fallback, but it isn't a verified washed-charcoal substitute.
- **NEW preserved screenshot evidence on this GitHub feature branch**:
  - `vendors/real-browser-proof-20261109/BODATEE-CHARCOAL-M-ONEPIECE-16900.png` (real seller UI, not illustration; blob `cabdeffea2bcdfa7a772900144abe8c94422e9ad`)
  - `vendors/real-browser-proof-20261109/WEFORM-CHARCOAL-M-DTF-POSITION-PENDING.png` (real active DTF UI showing empty position; blob `bd42facb274566cd6ace37655eb52ed6047ea4ca`)
  - Written source-selector evidence `vendors/SHADOW01-REAL-BROWSER-SELECTOR-20261109-KST.md`.
  - More raw JSON and original screenshots/scripts remain on user's **local remote computer** at `C:\Users\kimki\Documents\TOHESAR-FIRST-DROP-ATELIER\07_VENDOR_REAL_ORDER_GATE\` (not committed unless listed above).
- No original artwork/path `assets/wordmark.svg`, SVG/600DPI candidate, 04 construction, sticker PR #35, `main` or production deploy was modified. No order, payments, addresses, contacts or external upload executed.

**ONE NEXT BLOCKER**: find a seller that can actually accept a **single washed charcoal pigment blank + 82mm unaltered ivory wordmark at correct scale**, return a **real ink-inclusive VAT+shipping precheckout total** and a preview that preserves Ş. BODATEE is current active pivot; its print options may require account/after-order artwork proof. Do not ask for purchase approval without proven total. If interactive supplier cannot provide no-PII estimate, state and pivot rather than endlessly re-testing UI.

