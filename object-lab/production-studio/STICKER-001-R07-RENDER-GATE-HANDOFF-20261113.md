# Sticker 001 R07 — independent renderer gate handoff (2026-11-13 KST)

Status: **UNAPPROVED / no vendor upload / no print approval**.

## New execution, distinct from previous byte-only audit
- Created `verify_sticker_r07_independent_render.py`, an independent MuPDF reader for the **actual committed PDF**. It checks single-page physical size 110×40mm (0.05mm tolerance), two named OCG layers (`인쇄`, `반칼`), 300dpi output raster dimensions and nonuniform pixel bytes.
- Added `.github/workflows/object-lab-sticker-r07-independent-render.yml`, which runs the script on GitHub-hosted Ubuntu with pinned PyMuPDF 1.26.7 and uploads the rendered PNG and QA JSON as review artifacts.
- GitHub Actions run **43398911590** was observed `in_progress` after commit `c0c6c566a0ed97fede3daee342abe5d453e8e98b`; **do not claim PASS until this run completes**.
- Local execution against the real PDF: **NOT RUN** (container internet DNS blocked binary download). Independent raster and visual acceptance: **PENDING CI and human review**. Spot-color separation, calibrated CMYK, PDF/X, supplier acceptance: **NOT VERIFIED**.

## Next single action
Check [independent render run](https://github.com/kimkimhs36/tohesar/actions/runs/43398911590). If it fails, fix actual renderer/parser problem, do not call it a passed proof. If it succeeds, inspect the uploaded PNG and compare trim/bleed and two layers visually; no supplier upload without explicit approval. 01 SHADOW still requires owner-selected sample size and separate original-logo upload permission before a genuine quote can be obtained.
