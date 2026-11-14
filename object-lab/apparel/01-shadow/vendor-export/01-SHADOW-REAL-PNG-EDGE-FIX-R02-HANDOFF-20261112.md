# 01 SHADOW R02 — real source PNG anti-alias gate repaired (2026-11-12 KST)

**Status: ACTUAL TRACKED IMAGE independently DECODED/INSPECTED; 11 local Pillow regression tests PASS; updated code stored on existing Draft PR #38. Real GitHub Actions job and actual Pillow-on-original execution remain NOT CONFIRMED. Never promote to vendor approval.**

## New finding: an existing acceptance test wrongly rejected our unchanged print master

The previous `shadow_print_raster_gate_r01.py` enforced `colors == {(248,242,231)}` on **every pixel with alpha > 0**. That rejects legitimate antialiased fringe pixels where resampling produces small RGB deviations, including in the original pinned PNG. It was not previously proven by six tiny synthetic fixtures; those created only ivory pixels.

**Fresh test on ACTUAL GitHub-stored original PNG**, source Git blob SHA-1 `899d2014d8c247fe7e7774b65b6371c6315f72f9`, 44,458 bytes, RGBA 2500×575. Pulled via the GitHub connector's Base64 mode; independently decoded zlib/DEFLATE scanlines and reversed PNG filters with pure JavaScript, not a hash-only check.

- 1,437,500 total pixels; 1,042,488 fully transparent; 395,012 visible.
- Exactly **379,146/379,146 fully opaque pixels** carry true `#F8F2E7`. **Opaque mismatches = 0.**
- 15,866 partial-alpha pixels, of which **14,473** are not byte-for-byte `#F8F2E7`; 1,393 are exact.
- In the partial-alpha group, the **largest absolute single-channel RGB difference is 13/255**, alpha 16–240.
- 19 visible RGB triplets. Source alpha bbox **[4,4,2491,569]**. Its physical intended width is still 82 mm; never derive print approval from pixels.

Therefore the prior all-visible-pixels equality check would fail against the actual source, while the exact opaque ivory requirement is **satisfied**. This distinction matters before any use of image art by the supplier.

## Material code fix, not a redesigned logo

- Patched `shadow_print_raster_gate_r01.py`: alpha=255 always requires **exact** ivory; 0<alpha<255 allows only an internal **maximum channel absolute difference <=16**; alpha=0 RGB is irrelevant. It rejects color defects even one unit off in opaque artwork, and rejects obviously wrong partially transparent colors.
- The tolerance 16/255 is an *internal input-file anti-alias hygiene rule* chosen above observed source maximum 13/255; **NOT a manufacturer-approved color error, alpha-blending standard, vendor DTF/DTG determination or physical print proof**.
- Preserved prior keys expected by existing GitHub workflows. Added disaggregated counters and `opaque_pixels_all_exact_ivory`. **Original PNG, Ş glyph and other artwork remain byte-identical and untouched**.
- Updated existing `test_shadow_print_raster_gate_r01.py` with 11 cases: antialiased real-like fringe, exact limit and 1-unit-over failure, opaque 1-unit RGB mismatch, white print error, transparent background, source size, no visible mark, no opaque core, and release false flags.
- **Actually ran 11/11 synthetic Pillow tests in Python.** Confirmed the tested Python source file's Git blob `802c8ed195a68612544e755a6927ee267c49bc15` exactly matched the committed code blob. Independent real-PNG JavaScript color counts support that corrected acceptance predicate. The committed test script itself and Pillow routine applied to full real image need separate CI evidence.
- Committed `01-SHADOW-REAL-PNG-PIXEL-AUDIT-R02-20261112.json` with actual independently decoded source metrics and explicit not-done flags.

## External manufacturer facts, still not releases

MARPPLE's public [printing FAQ](https://www.marpple.com/kr/faq/printing-inquiry) says it chooses a print technique based on item/design unless a specific request is made; DTF and direct digital methods have different appearance and compatibility. The [production FAQ](https://www.marpple.com/kr/faq/production-inquiry) says the editor can display **actual print dimensions** when inserting an image and offers optional **expert placement adjustment** (placement, not automatic guaranteed logo-size approval).

For 01 BeCanvas charcoal pigment tee SKU 8178, the current product and logo **still lack any official print-method approval, true image-art 82mm placement, underbase/transfer-edge check, one-piece image-logo quote, owner-approved size or physical wear/wash sample**. Saved 2026-11-09 generic-text editor pricing must never be called a branded printed quote.

## Exact next action

1. Inspect the **actual GitHub Actions job** for `.github/workflows/object-lab-shadow-actual-png-qa.yml`, not merely the PR-commit query (which filters pull-request-triggered runs and can miss `push` jobs). Read its real log/receipt if available. If no job evidence: run the corrected script against exact GitHub PNG with Pillow on an authorized runtime and preserve full receipt. Avoid another duplicate preflight.
2. With separate owner approval for *external artwork upload*, verify original `Ş` and **82mm physical width/left-chest placement** in vendor editor, inspect method, underbase, image-logo price, shipping/tax, and owner-selected size. Permission to upload is not permission to buy.
3. Do not manufacture claims of a garment sample, production readiness, external quote, fit/wash evaluation, order, main merge or deployment.

**Safety:** No supplier contact, login, proprietary vendor upload, cart, order, payment, personal data, branch rewrite, new branch, main merge, or deployment performed.
