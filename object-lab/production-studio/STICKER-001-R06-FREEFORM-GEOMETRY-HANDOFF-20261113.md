# Sticker 001 R06 — actual public supplier freeform sheet geometry (13 Nov 2026)
**EXPLORATORY ONLY · UNAPPROVED · NOT A SUPPLIER SELECTION OR PRESS-READY PDF.**

## Why the previous R03/R04 artwork cannot silently be used for this different route
Redprinting's publicly published **freeform sticker sheet** guide (read-only https://www.redprinting.co.kr/ko/guide3/view/freeform-sticker) illustrates an **artwork 154×104mm → sheet trim 150×100mm → kiss cut 144×94mm**, and requires a **2mm inner safe area** from the cut contour and **≥3mm cut-to-trim** clearance and sticker gap. Its guide specifies separate printing and '반칼' layers with **M100** cut stroke, saved as PDF. These are **route-specific** public layout instructions, not evidence of logo import, pricing or actual selection.

For a **100×30mm actual kiss-cut sticker** under this *example's geometry*, the corresponding artboard must be **110×40mm**, with paper/sheet trim **106×36mm** and a 100×30mm cut contour centered at (5,5)mm. The existing 106×36mm R03/R04 export is the *printed artboard for a different 3mm bleed assumption*: if incorrectly reused as the full Redprinting sheet artwork, its cut edge would sit only 3mm from the artboard edge, whereas the published example uses 5mm. **Do not conflate trim dimension with kiss-cut sticker size.** This is not a claim every supplier uses 5mm.

## Actual new source material
- `STICKER-001-R06-FREEFORM-110x40mm-ART-UNAPPROVED.svg`: 110×40mm solid-black print artwork, original 92mm logo untouched and shifted **+2mm in X/Y** from the prior R03 source; original TOHEŞAR Ş path is byte-identical to `assets/wordmark.svg`. No magenta cutter stroke inside print artwork.
- `STICKER-001-R06-FREEFORM-110x40mm-CUTLINE-REFERENCE.svg`: *separate* coordinate-only 100×30mm rectangular cut contour at x=5, y=5. Its RGB magenta preview is **not** an approved CMYK M100 PDF printing separation. It is NOT an uploadable final cutline.
- `STICKER-001-R06-FREEFORM-GEOMETRY-QA-20261113.json`: independently inspectable measured geometry, source lineage, failure case and test assertions.

Nominal wordmark artwork rectangle relative to 100×30 kiss-cut line: horizontal inward gap **4mm** on each side, vertical inward gap **4.422904mm** top/bottom. Both exceed the **2mm source-stated safe margin** before any real printing/cutter displacement; this is only the embedded rectangular logo box, not a measured printer ink-edge or cut registration proof.

## Verification & production boundary
- **PASS 15/15** connected-runtime structural + unit geometry assertions, including path byte equality and old-sheet failure counterexample.
- **NOT RUN** independent SVG raster preview, PDF/CMYK layer export, actual supplier import or cutline acceptance, physical print/trim, sample, seller quote, or purchase.
- No external vendor artwork upload, vendor messages, cart, payment, order, changes to main, or production deployment.
- **Do not adopt Redprinting as the production site without the owner's explicit selection.** Keep the existing Sticker PR #35 draft. The current first-wearable priority remains 01 SHADOW, blocked on original logo upload approval, sample size and actual 1pc quote.

## One real next action
If the owner selects this freeform sheet process, get the precise *chosen product* template and layer/export spec, then create and preflight a real separated PDF and the supplier's price/trim proof **under separate authorization**. Otherwise leave R06 as a conditional geometry study; do not treat it as the universal sticker master.
