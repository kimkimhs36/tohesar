# TOHEŞAR · STICKER 001 R03 — REAL PRINT ART QA & HANDOFF
**2026-11-10 KST · source-preserved revision · NOT VENDOR APPROVED · NO ORDER**

## Material outputs

1. [100×30mm *nominal trim preview*](STICKER-001-R03-CENTERED-100x30-TRIM-UNAPPROVED.svg) (SVG, original 92mm wordmark)
2. [106×36mm *provisional 3mm full-bleed print candidate*](STICKER-001-R03-CENTERED-106x36-3MM-BLEED-UNAPPROVED.svg) (SVG, original wordmark path)
3. [ACTUAL rendered 300dpi PNG](exports/STICKER-001-R03-CENTERED-106x36-300DPI-UNAPPROVED.png)
4. [Generated QC data](exports/STICKER-001-R03-CENTERED-106x36-300DPI-UNAPPROVED.qa.json)
5. [Reproducible image generator](export_sticker_centered_r03.py) and [7 unit/regression tests](test_export_sticker_centered_r03.py).

Original website vector Git blob: `e9b299f8d797625b3704103c08ea1aede5c5ea05`, **exact original shape of Ş maintained**. Original production candidates NOT overwritten; this is an alternative to review. The original vector is an existing project asset in a public repository, not an external vendor upload.

## Why R03 materially improves cut robustness

Original nominal artwork box: **92 × 21.15419297mm**, original trim **100 × 30mm**. Previous ink-box vertical position `y=5.400mm` produced **3.44580703mm** minimum (bottom) nominal margin.

R03 centers it at `y=(30−21.15419297)/2=4.422903515mm`. The centered design's minimum rectangular *artwork box* clearance is **4.422903515mm on all four sides** (left/right remain 4mm, so the ACTUAL global minimum is **4mm**, not 4.422903515mm). **IMPORTANT correction:** any improvement statement about overall minimum MUST account for the left/right 4mm limit. Under the conservative rectangular-box model the old global minimum was 3.44580703mm and the new global minimum is **4.000mm**, a net improvement of **0.55419297mm**. Vertical limiting margin specifically improves by **0.977096485mm**.

At hypothetical cut registration drift **3mm**, global minimum artwork clearance is **1.000mm** (the horizontal sides limit); vertical minimum clearance is **1.422903515mm**. At >3mm of drift, the 3mm black bleed no longer guarantees coverage regardless of ink clearance. Hypothetical cut displacement is not a certified cutter tolerance.

**NO additional ink scaling or re-lettering.** The 106×36 bleed variant moves nominal trimmed art +3mm to x=7mm, y=7.422903515mm. It intentionally contains **NO die-cut/cutline path**. Rounded-corner vendor requirements, image alignment, trim-specific safe zones and physical cutting accuracy are still unknown. Do not upload the file to an outside vendor without separate approval.

## Actual tested binary outcome

- **PNG rendered:** 1252 × 425 pixels at nominal 300dpi (106×36mm canvas), black `#10110F`, ivory `#F8F2E7`.
- Source Git blob: `e9b299f8d797625b3704103c08ea1aede5c5ea05`.
- PNG SHA-256: `da9043612fa1b2ecf901636683ff89c82e29f8c9a3357818b84de32c3d5201a4`.
- PNG file size: **31043 bytes**.
- Approximate visible ivory bounding box: `85, 90, 1164, 334` pixels.
- [GitHub Actions R03 test run #42750804140](https://github.com/kimkimhs36/tohesar/actions/runs/42750804140) completed successfully, **7 unit tests PASS**. The prior run #42750659356 failed due to overly strict background-corner pixel assertion; code corrected to an interior sample and independently rerun.
- Generated binary and QA are saved on feature branch from a successful *push-triggered* run, not on main. Render visually inspected in ChatGPT; physical print not tested.

## Manufacturing and permission gates

- **01 SHADOW UNIFORM remains the priority for first wearable sample.** It is waiting for separate owner authorization to put the original 82mm logo in a vendor editor, chosen size and true printed one-piece quote. Sticker R03 does NOT replace first apparel sample.
- Sticker R03 is **printer-independent 3mm full-bleed artwork**. The separate Publog method `104×34mm + inward 2mm auto-cut` is **not the same cut route**; do not use this 106×36 file for that preset without adapting per shop instructions.
- Sticker printing vendor selection, color profile, exact die-line and registration, cutting radius, quantity, tax/shipping-inclusive quote and master approval are all pending.
- No vendor contact, brand logo upload to third-party, personal details, cart, order, payment, main merge or website deploy.

**Next actionable production blocker:** identify the chosen printer's actual cutline + bleed specifications and its allowed registration tolerance, then validate *this exact source-locked* R03 asset in its editor **only after narrow owner approval**. Keep the prior assets and variants available until an actual printer proof settles the format.
