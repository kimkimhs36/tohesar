# 01 SHADOW UNIFORM — two-tier make decision R01 (2026-11-15)
Status: **INTERNAL DESIGN/PRODUCTION DECISION CANDIDATE — UNAPPROVED**. This document is not an order, supplier quotation, or physical product QA.

## Design problem resolved
The existing 01 front is **an 82 mm warm-ivory original wordmark on a ready-made washed-charcoal blank**. This is a credible minimal CORE, **not** a proprietary luxury cut-and-sew garment. The historical seller-listed 8178 blank is **275 gsm**, cotton 100%, 32s 2-ply; do not describe it as 400+ gsm heavyweight or silently replace it with a non-equivalent blank. The distinction must come from honest restraint, print precision and measured fit until a separate signature sample exists.

## Decision: maintain TWO separate products/proof paths
| Gate | CORE A — first-piece validation | SIGNATURE B — separate future custom sample |
| --- | --- | --- |
| Objective | Test charcoal/ivory, print legibility, physical fit and wash at one-piece quantity | Develop identity beyond logo via fit block, measured neckline, drape, finishing |
| Silhouette | Seller's existing oversized tee, **no proprietary pattern** | Patternmaker-created block from measured reference, separate approval |
| Textile | Seller statement: cotton 100%, **275 gsm**; no physical verification | Proposed alternative 300–360 gsm cotton jersey **only if swatch/shrink and drape pass**; no selected supplier |
| Construction | Factory blank seams, labels, hem, collar **unchanged** unless vendor proves otherwise | Candidate refined rib recovery, shoulder/neck tape, consistent side-seam finish and minimal side tab, all require cut-and-sew sample and factory signoff |
| Branding | Exact source-locked original Ş path; warm ivory, nominal 82 mm visible-ink goal; left chest | Same master only; optional interior edition/care system subject to real manufacturing capability |
| Manufacturing | 1pc candidate MARPPLE SKU 8178, anonymous UI evidence dated 2026-11-09/10 | Separate cut-and-sew partner/MOQ, quote, BOM, pattern, grading, QC all **NOT CONFIRMED** |
| Approval | Specific authorization to upload source art **separate** from purchase authorization | Design direction, supplier contact, sample cost and order all separately require approval |

## CORE A — measured seller statements, NOT physical measurements
Historical 8178 size-chart values (cm; seller's 1–3 cm manufacturing tolerance):
| Size | body length | shoulder | chest flat | sleeve |
| --- | ---: | ---: | ---: | ---: |
| S | 68.5 | 52 | 55 | 21 |
| M | 71 | 54 | 58 | 21 |
| L | 73.5 | 56 | 61 | 22 |
| XL | 76 | 58 | 64 | 23 |
| 2XL | 78.5 | 61 | 67 | 24 |
| 3XL | 81 | 64 | 70 | 25 |

Do not choose sample size on behalf of founder. Physical garment POM, rib recovery, wash shrink, seam slippage and drape **NOT RUN**.

### Artwork control (existing tested math, not new supplier proof)
Source PNG: 2500×575 RGBA, bbox [4,4,2491,569], visible alpha width 2487 px. 82.00 mm **canvas** width yields 81.5736 mm alpha-bbox width. 82.42863 mm **canvas** is a mathematical candidate for 82.00 mm alpha-bbox width, only if vendor editor sizes the full canvas. This is **not** the physically perceptible ink edge or an accepted print width. Do not crop/redraw the master; test editor sizing only after owner permits original-logo upload.

**Placement rule for first physical proof:** measure print centroid from wearer's left shoulder high point and center-front line on an actual sample, record both distances in mm and compare photo against garment ruler. Do not invent a fixed left-chest offset from an illustration; test print-area constraints in seller proof. Preserve original ivory and Ş.

### Dated cost observation (2026-11-09, not a current quote)
Seller displayed charcoal M blank 15,700 KRW; anonymous generic **native text** test displayed 23,700 KRW, shipping line 3,000 KRW. 26,700 KRW = generic-text item + listed shipping arithmetic only, **NOT** price for uploaded TOHEŞAR artwork, tax/fees, or checkout. Seller price, stock, artwork method and proof need a fresh read. One-piece feasibility for labels/tabs/garment dye **unproven** and excluded from CORE A.

## SIGNATURE B — authored design hypothesis, not a vendor promise
Hypothesis B1: a slightly more structured neck opening and compact rib with controlled body length creates more recognizable TOHEŞAR proportion than adding a large print. Competing hypothesis B2: keep the exact blank silhouette and add tonal edge detailing. Choose **B1 for independent patternmaking exploration**: edge decoration risks looking like random premium trim, while fit can be measured in a repeatable way. Counterexample: dense 350+ gsm fabric may drape too rigidly or feel hot; do not lock GSM before handfeel/wash swatches and a wearer movement test.

**Proposed test protocol:** buy/obtain permitted reference blank and separate swatches only after owner approval; measure before wash, after 1 and 5 washes; shoulder, chest flat, body length, neck opening, collar rib recovery and hem twist; wear test arms raised, seated, layered. Record tolerances as sample observations before setting factory specs. Pattern pieces, notches, seam allowance, sewing order, trims, country-of-origin/care labels, full BOM and unit cost all **PENDING**.

## Decision gates / explicit stop conditions
1. CORE A only progresses after owner authorizes uploading the original logo to the selected vendor; do **not** equate this with permission to order.
2. Capture vendor image proof with artwork visible, measured placement, print method, opaque ivory on charcoal, accepted printable zone, size, all-in payable amount and estimated lead time. If any are unavailable, mark HOLD, not PASS.
3. Obtain distinct purchase authorization after reviewing proof/price. No cart, checkout, contact, or personal information without permission.
4. CORE A is not "premium custom silhouette" even after a successful print. SIGNATURE B is not a 1-piece vendor option.
5. Physical print adhesion, fit, care compliance, wash shrink, fabric hand and side-tab sewing remain **NOT RUN**.

## Source ledger
- Historical seller: https://www.marpple.com/kr/product/detail?bp_id=8178 (do not treat live price as verified this run)
- `object-lab/apparel/vendor-gates/marpple/VERIFIED-SIZE-CHARTS-4SKU-20261110.json`
- `object-lab/apparel/vendor-gates/marpple/EDITOR-NATIVE-TEXT-01-05-07-20261110.json`
- `object-lab/apparel/01-shadow/vendor-export/README-MARPPLE-01-SHADOW.md`
- `object-lab/apparel/01-shadow/vendor-export/01-SHADOW-VISIBLE-INK-82MM-CORRECTION-20261114.md`

**No external supplier upload, messaging, cart, order, payment, physical sample, wash test, merge or deployment.**
