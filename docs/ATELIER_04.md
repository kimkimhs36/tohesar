# TOHEŞAR — ATELIER 04 (27 October 2026)

Branch: `experiment/v3-art-direction-lab-20261027`

## Purpose
Four **real HTML/CSS and responsive layout directions** are implemented in `src/pages/atelier.astro`, independently of the V3 newsroom homepage. This is the missing visual comparison stage following the 35-page V3 study. No design direction has been chosen as the final homepage yet.

- A / THE PRESS — newspaper-first layout and compact information hierarchy.
- B / THE FRAME — cinematic automobile photography and restrained editorial typography.
- C / THE ARCHIVE — curated magazine / archival photography and asymmetrical long-form spread.
- D / THE EDITION — modern balanced newsroom / journal / Se-diyu publisher signature.

All use the **same three existing unpublished study stories** and the **same three recorded, legally sourced photographs**. They do not pretend to be current news. Source/photography credit is retained by the shared `Photo` component, and the page is noindex.

## Comparison
Open `/atelier/` on the isolated preview. Switch the four tabs, including on iPhone/iPad. URL fragments `#view-a`, `#view-b`, `#view-c`, `#view-d` deep-link to each approach. Keyboard arrow keys/Home/End switch views. Article links connect to existing V3 story pages.
No auto-intro, WebGL, AI-created car photo or Memory Alloy object.

## Isolation
The V3 base branch and `main` remain unchanged. This branch adds only:
- `src/pages/atelier.astro`
- `tests/browser/atelier.spec.ts`
- this report

Production domain `tohesar.com` was not assigned, and no existing V2/V3/BKIT Vercel projects were changed. The new Vercel project `tohesar-v3-atelier` is separate.

## Remaining QA
Astro build succeeded in isolated Vercel. Standalone route HTTP and existing F40 article HTTP were checked. Additional Playwright tests are now included but have **not been executed by this workflow** (remote Git deployment builds by default; separate CI execution required). Real iPhone/iPad Safari screenshots and final visual selection remain pending.

**Don't use this page's general newsroom as a final aesthetic selection.** It is intentionally a design-selection laboratory.
