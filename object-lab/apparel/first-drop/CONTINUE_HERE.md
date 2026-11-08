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
