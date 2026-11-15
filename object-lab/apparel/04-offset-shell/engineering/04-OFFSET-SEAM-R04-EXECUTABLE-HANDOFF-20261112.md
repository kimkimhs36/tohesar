# 04 OFFSET SHELL — executable pre-cut screen R04 (2026-11-12 KST)

This closes a concrete reproducibility gap in [R03 differential shrinkage research](04-DIFFERENTIAL-SHRINKAGE-SEAM-GATE-R03-20261111.md): that note described six Python tests but did **not commit** the script. R04 adds a runnable, stdlib-only implementation and eight embedded unit tests.

**Command:** `python object-lab/apparel/04-offset-shell/engineering/offset_seam_shrinkage_gate_r04.py --test`

**Hypothetical case:** `python object-lab/apparel/04-offset-shell/engineering/offset_seam_shrinkage_gate_r04.py --a-mm 620 --b-mm 620 --a-shrink-pct 2 --b-shrink-pct 3`

**Measured in this run:** eight independent local Python unittest cases passed on an equivalent locally authored implementation before the GitHub commit. The committed combined-file version has **not been independently rerun after upload**; do not report committed-file test PASS until executed from HEAD. Arithmetic for synthetic equal 620 mm walks, 2% versus 3% shrinkage: 607.6 mm vs 601.4 mm, mismatch 6.2 mm; internal provisional limit 2 mm => screen FAIL.

**Gate:** HOLD / NO CUT regardless of numerical screen. No physical A/B fabric swatches, diagonal sewing-line measurements, selected block size, resolved 710 mm hem datum, maker signoff or production pattern exist. Test values are hypothetical. No logo upload, seller contact, order, payment, main merge or deployment.

**Next material action:** physically measure the shrinkage of two intended fabrics *along the seam tangent*, walk actual A/B seam-line curves and resolve the hem datum with a patternmaker. If not accessible, prioritize 01 SHADOW original-logo supplier proof only after separate owner approval; do not repeat more synthetic quote-gate versions.
