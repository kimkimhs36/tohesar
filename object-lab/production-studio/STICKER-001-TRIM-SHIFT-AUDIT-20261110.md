# Sticker 001 — cut registration versus real artwork clearance (10 Nov 2026)
**New numerical production-risk check, NOT a cutter-approved dieline.**

Existing unchanged design: 100 × 30 mm nominal sticker; provisional 3 mm full-black bleed yields 106 × 36 mm art. The original wordmark art box is at (4, 5.4) mm, size 92 × 21.15419297 mm relative to trim. Derived nominal clearances: **left 4.000 / right 4.000 / top 5.400 / bottom 3.44580703 mm**. Thus the **bottom**, not the left/right edge, is the tightest geometry.

| Hypothetical max cutter registration drift (independent X/Y) | Worst-case wordmark clearance | Black bleed still covers? | Artwork unclipped? |
| --- | ---: | --- | --- |
| 0 mm | 3.44580703 mm | yes | yes |
| 1.5 mm | 1.94580703 mm | yes | yes |
| 3 mm | 0.44580703 mm | yes, boundary | yes |
| 4 mm | -0.55419297 mm | **NO** | **NO** |

**Falsified hypothesis:** a 3 mm full-bleed design will tolerate arbitrary die-cut drift. It cannot: at 4 mm drift, paper can show and the logo may be clipped. Even at 3 mm, only 0.4458 mm clearance remains at the bottom; this is not a vendor-certified safe distance.

New standard-library executable `sticker_001_trim_shift_audit.py`, six regression tests `test_sticker_001_trim_shift_audit.py`, and cloud workflow `.github/workflows/sticker-001-trim-shift-audit.yml`. The core arithmetic was independently run in a Python environment and the four scenarios above passed; **the committed unit-test file and GitHub workflow are not claimed to have run until actual CI evidence appears**.

**Next blocker:** obtain the selected print vendor's exact cutter registration tolerance, safe-artwork inset, rounded-corner radius and contour cutline requirements *without sending proprietary artwork before permission*. If the vendor requires >3 mm safe artwork clearance after its stated drift, revise the layout only after preserving original Ş path and confirming owner aesthetic approval. No order, outreach, art upload or manufacturing approval.
