# TOHEŞAR / OBJECT LAB — Print Production Studio
Status: **PREPRODUCTION SOURCE-LOCKED TOOL — NOT PRINT RELEASE**
Date: 2026-11-09 KST

## What has actually been built
A **single source-controlled workbench** covering both previously separate development branches, without merging their release decisions or replacing the approved masters.

1. `STICKER-001-100x30mm-CANDIDATE.svg`: exact bytes copied from `object-lab/sticker-001-proof-20261108/object-lab/sticker-001/STICKER-001-100x30mm-ORIGINAL-GIT-VECTOR-CANDIDATE.svg` (Git blob SHA `e9e445ddc5b4e762c3d454bcf3947bde6108899c`).
2. `SHADOW-UNIFORM-01-CHEST-82mm-CANDIDATE.svg`: exact bytes copied from `object-lab/apparel-first-drop-r02-20261109/object-lab/apparel/first-drop/01-SHADOW-CHEST-82MM-ORIGINAL-PATH-IVORY.svg` (Git blob SHA `c4160648feb1d74d4b2af663b8755984a2ac77fa`).
3. `WORDMARK-WEB-SOURCE-REFERENCE.svg`: exact bytes copied from existing `assets/wordmark.svg` (Git blob SHA `e9b299f8d797625b3704103c08ea1aede5c5ea05`).
4. `TOHESAR-A4-1TO1-PHYSICAL-PROOF-NOT-PRESS-READY.svg`: physically dimensioned A4 (210 × 297 mm) proof, with nominal 100 × 30 mm sticker, 82 mm apparel logo and 50 mm ruler reference. It uses exactly the original vector path twice, not retyped text or a redraw.
5. `TOHESAR-PRINT-EXPORT-STUDIO.html`: **self-contained, offline-capable** export UI, with both actual source SVG strings embedded. PNG export supports 300 / 600 / 1200 DPI, includes pHYs pixel-per-meter PNG metadata, and permits downloading the untouched original SVG directly.

## Open/use
Save `TOHESAR-PRINT-EXPORT-STUDIO.html` locally from GitHub and open it in a desktop browser. No external services, account access, network requests or CDN dependencies are required. Pick STICKER 001 or SHADOW UNIFORM 01; select DPI; click **EXPORT PNG**. The transparent apparel artwork should remain transparent; the sticker includes its black background. Both are preproduction candidates.

For the A4 proof, download its SVG and print on A4 **100% / actual size** (turn OFF fit-to-page). Measure 50 mm ruler bar; if inaccurate, discard size measurements and adjust printer scaling.

### Pixel dimensions at target physical size
| Asset | 300 DPI | 600 DPI | 1200 DPI |
| --- | --- | --- | --- |
| STICKER 001 (100×30mm) | 1181×354 | 2362×709 | 4724×1417 |
| SHADOW 01 (82×18.854824mm) | 969×223 | 1937×445 | 3874×891 |

PNG pHYs encodes rounded pixels-per-meter; slight rounding error is inherent. The receiving vendor editor may ignore DPI metadata and rescale pixels: always explicitly set actual artwork width to **100 mm** (sticker canvas) or **82 mm** (chest logo).

## Source integrity guarantee + limitations
- Three copied source SVGs retain their original exact Git blob SHA.
- The `d` path attribute in all three source files is an identical string, including the whole existing Ş curve. No font replacement, text recreation, generative upscaler, autocorrected paths or AI lettering.
- A4 SVG proof and export studio reuse the same source `d` string.
- The export studio validates that both embedded `d` paths match its locked original at startup.
- Its source code is committed and content-verified. **PNG creation and specific browser compatibility have not been physically executed/tested in this session.**
- `pHYs` metadata is part of the client-side PNG generation implementation; manual downloaded PNG QC remains necessary. Suggested checks: actual pixel dimensions and horizontal/vertical DPI, exact rendition of Ş, print preview, transparency, and crisp edges.
- This is a digital size and visual proof only, **not** an approved CMYK/spot, bleed, contour-cut, print method or purchased product.

## Separate release criteria
### STICKER 001
- Black `#10110F`, ivory `#F8F2E7`, nominal 100×30mm.
- Independent owner-approved sticker master vs website source comparison is NOT complete.
- Vendor editability/bleed/cutline/actual sheet yield and ALL-IN checkout cost are NOT verified.
- Under KRW 50,000 sticker budget; indoor use first; do not claim vehicle paint compatibility.
- Do not presume 6 copies on 140×200mm sheet without real editor/trim proof.

### 01 SHADOW UNIFORM
- 82mm ivory source-locked chest mark on transparent artwork. Sample garment size/color, image positioning, accurate vendor print method, and actual total cost remain unconfirmed.
- Candidate public supplier starting prices are NOT full quotes. Apparel budget is separate from the sticker budget.
- **04 OFFSET SHELL** remains a separate cut-and-sew pattern-development path, **not** a print-on-blank product.

## Records and approvals
- For each product, `ready-to-upload`, `vendor-proof-approved`, `all-in-price-verified`, `user-approval`, `ordered`, `received`, `attached/worn`, `completion-photo` are **distinct** states. None of the latter 7 is confirmed.
- DO NOT order, pay, transmit PII, send vendor messages or claim production without explicit user approval.
- Next real-world action is actual vendor editor acceptance and actual final price including shipping, not another generic vendor query. Never invent an acceptance screenshot.

## Original threads preserved
- Sticker source branch: `object-lab/sticker-001-proof-20261108`.
- Apparel FIRST DROP source branch: `object-lab/apparel-first-drop-r02-20261109`.
- This production studio is a dedicated unmerged branch `object-lab/print-production-studio-20261109`, based on latest available main. It does not overwrite the source branches or deploy to the live website.

## Files and verification
All five objects are tracked in GitHub under `object-lab/production-studio/`. SHA values listed above are Git blob IDs, not SHA-256 file digests.


## 2026-11-09 — 01 SHADOW UNIFORM real raster export CI verified
- Source-locked deterministic script: `export_shadow_uniform_assets.py` (CairoSVG + Pillow). Rejects altered Git blob/path, non-original ivory, live text and changed physical dimensions.
- GitHub Actions workflow: `.github/workflows/object-lab-shadow-print-exports.yml`.
- Actual CI run success: https://github.com/kimkimhs36/tohesar/actions/runs/42545237967 (GitHub actions job export, binary artifact, and feature branch save all passed).
- Actual created and committed **binary files** (not mockups):
  - `exports/01-shadow-uniform/SHADOW-UNIFORM-01-82mm-IVORY-300DPI.png`: 969×223px, 300DPI, 22,397 bytes, SHA256 `bdb0e96737350f4715274acd25f24f3d711cb81d62606265c6e3ce6e4b01ccf7`
  - `exports/01-shadow-uniform/SHADOW-UNIFORM-01-82mm-IVORY-600DPI.png`: 1937×445px, 600DPI, 46,533 bytes, SHA256 `cb41377e235346bd8786029e89edeb5567bcd61006a8226d0800184b9e3e847c`
  - `exports/01-shadow-uniform/MANIFEST.json` contains versioned dimensions, source path SHA256, verified source Git SHA1, alpha and color QC and explicitly unapproved release state.
- Artwork: ivory `#f8f2e7`, 82 × 18.854824mm, transparent. Logo geometry is source-identical; no recreated Ş. GitHub website mark identity with owner's garment-approved master is still **NOT verified**.
- Still **NOT vendor-print-ready**: actual vendor import/print preview, selected blank color/size and one-item all-in checkout cost, shipping, placement approval, garment sample/fit/wash QC, owner order approval all pending.
- Public observed starting prices remain UA 20s heavyweight oversized `₩26,500~` vs Comfort Colors washed relaxed `₩21,500~` on https://www.ohprint.me/apparel/store/tshirt-shortsleeves/overview ; not actual selected-options totals.
- No order/payment/PII/external message; no site deployment or main merge.
