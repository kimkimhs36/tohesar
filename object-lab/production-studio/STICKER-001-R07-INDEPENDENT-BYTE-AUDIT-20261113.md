# Sticker 001 R07 — independent repository-binary inspection (2026-11-13 KST)

Status: **HOLD — internal technical audit, NOT supplier approval or a print proof.**

## Method / provenance

- Read the **actual GitHub PDF blob**, not the generator's self-reported JSON, from PR #35 HEAD `3905645124e429b7743b10574fd67cf2d256d64d`, path `object-lab/production-studio/exports/STICKER-001-R07-LAYERED-110x40mm-UNAPPROVED.pdf`.
- Requested base64 from GitHub, independently decoded the full byte stream using a separate ECMAScript base64 decoder, then parsed visible PDF dictionaries/operators and the xref pointer. No original logo uploaded to any vendor.
- Source PDF binary size: **23,217 bytes**; PDF header **%PDF-1.5**; terminal **%%EOF**; startxref **22980** points to literal `xref`.

## Independent results (actual bytes)

| Check | Observed | Outcome |
|---|---|---|
| Header / EOF / xref target | %PDF-1.5 / %%EOF / 22980 -> xref | PASS (basic structural check) |
| PDF page objects | exactly one `/Type /Page` | PASS |
| Layer group dictionaries | exactly two `/Type /OCG` | PASS |
| Page MediaBox | 0 0 311.811024 113.385827 pt = approximately 110 x 40 mm | PASS |
| Embedded fonts | no `/Font` token | PASS (no embedded fonts) |
| Embedded raster image XObjects | no `/Subtype /Image` token | PASS (no raster image objects) |
| PDF launch / URI / JavaScript actions | no `/Launch`, `/URI`, or `/JavaScript` tokens | PASS (basic text scan) |
| Named spot/separation color | no `/Separation` or `/DeviceN` token | **FAIL for supplier-specific spot-color requirement if required** |
| Actual output device/color calibration | stream uses numeric `rg` operators (RGB fill); no independent CMYK separation / ICC proof | **NOT PRINT-APPROVED** |

**Important:** The page content stream includes an edge-to-edge dark rectangle (`0 0 311.811024 113.385827 re f`), which may be intentional full-bleed artwork. This is not a verified physical bleed/cut tolerance or a supplier-approved background. This independent check does **not** validate rendered appearance, vector clipping, colorimetric accuracy, or print/cut registration.

## Manufacturing decision / next non-repetitive step

1. Before vendor submission, verify the chosen printer's **actual** cutline spot-color and PDF export rules. An OCG named `반칼` and M100 CMYK stroke are not equivalent to a spot-color separation if the printer requires one.
2. Run an independent PDF renderer/visual inspection and verify both layer visibility and trim-to-art clearance. **NOT RUN** in this execution (binary not transferred to a renderer; no desktop/Acrobat test).
3. Re-export to the supplier's exact print specification, then get explicit owner approval before any proprietary artwork upload. No cart, order, payment or contact was performed.

The 01 SHADOW physical sample remains the primary blocker: owner-selected size, permission for vendor upload of the original 82 mm logo, and a genuine one-piece quote. Do not count this PDF audit as physical progress.
