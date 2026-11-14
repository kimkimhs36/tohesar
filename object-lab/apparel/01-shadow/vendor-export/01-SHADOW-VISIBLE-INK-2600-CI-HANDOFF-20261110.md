# TOHEŞAR / 01 SHADOW — 2600px actual raster production preflight
**10 Nov 2026 KST · internal digital file COMPLETE · NOT PRINTER APPROVED**

## New material artifact, not another mockup

A real **2600 × 598 RGBA PNG** was rendered from the exact official `assets/wordmark.svg` outline (including original **Ş**) by GitHub Actions, image/audit generated and committed to PR #38's feature branch. Never replace the original 2500px art; this is an independently testable *candidate*.

- [New actual PNG](exports/01-SHADOW-IVORY-82MM-CANVAS-2600PX-VISIBLE2500-UNAPPROVED.png)
- [Generated QA JSON](exports/01-SHADOW-IVORY-82MM-CANVAS-2600PX-VISIBLE2500-UNAPPROVED.qa.json)
- [Reproducible offline vector-to-PNG exporter](export_vendor_visible_ink_2600.py)
- [Six regressions incl. negative old-raster counterexample](test_export_vendor_visible_ink_2600.py)
- [Cloud image test + artifact + non-force commit workflow](../../../../.github/workflows/object-lab-01-visible-ink-2600.yml)

### Actual CI/generated image facts

| Field | Actual |
|---|---|
| Source Git blob | `e9b299f8d797625b3704103c08ea1aede5c5ea05` |
| Original path SHA-256 | `b7d36711e60d94465d0587e4a4e4100fba1217a2157865995717ca8c23b0d93d` |
| PNG size | **2600 × 598px** |
| Visible nonzero alpha bbox | `[4,4,2591,591]` |
| Visible ink width | **2587px** |
| Transparent margins L/T/R/B | **4/4/9/7px** |
| Nominal artwork canvas width | **82.000mm** |
| Visible ink width *if canvas* displayed at 82mm | **81.590mm** |
| Embedded nominal source raster density | **805.36dpi** |
| PNG SHA-256 | `a075632cb8ce37e244884716b93cba8f3a2149d512aee8e3a8c50c4b1bb5a0be` |
| Generated PNG file bytes | **63,038** |
| Generated commit | `f67b649409b0519fcd2c0f288df3c719d582e760` |

The old 2500px-canvas candidate actually contains only 2487px of non-transparent horizontal artwork. **Hypothesis falsified**: a 2500px PNG canvas doesn't necessarily satisfy a guideline calling for 2500px **excluding transparent margins**. The new vector-rasterized candidate does. This improves format compliance **without modifying/redrawing original paths or merely upscaling the previous PNG**.

### Original supplier guideline and limitations
MARPPLE [image preparation FAQ](https://www.marpple.com/kr/faq/image-preparation) recommends the longest visible dimension at least 2500px and 150dpi, with transparent margins minimized and PNG for transparency. Its page has internally awkward legacy wording around CMYK PNG versus PNG-24; this QA **does not** assert CMYK acceptance. Retain RGBA for editor compatibility and verify actual uploaded result only after separate explicit owner approval.

**Not tested**: supplier original image upload/editor, 82mm *physical visible* width, ink method/underbase on pigment washed charcoal, edge definition, washing, size, 1-unit image-logo quote, VAT/shipping total, vendor accepted proof, and physical production. The image alone does not prove how a printer handles source DPI or fabric.

### Narrow next physical blocker

1. **Owner decision for original-logo third-party upload** to MARPPLE editor for anonymous 01 preview. This is separate from supplier messaging, order and payment.
2. Confirm 01 SHADOW sample size independently; historical M is **QA only**.
3. If specifically approved, test actual left-chest printable region and visible mark width under chosen fabric/print method; capture price with original image rather than generic text.
4. Require final explicit approval for any order/payment separately. Nothing in this file grants it.

**Safety:** no branding sent to vendor, vendor contacted, cart opened, order, payment, personal data, main merge, or website deployment.
