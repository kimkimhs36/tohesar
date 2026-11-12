# 01 SHADOW — canvas width versus visible alpha geometry (2026-11-12)

**Engineering preflight, NOT vendor approval.** Source: repository README-MARPPLE-01-SHADOW.md records transparent PNG 2500×575 px and exclusive alpha bounding box [4,4,2491,569]. Nominal artwork canvas width is 82mm. No master/logo was modified or uploaded.

At 82mm canvas width, pixel pitch = 82/2500 = **0.0328 mm/px**. Alpha bbox width = 2491−4 = **2487px**; height = 569−4 = **565px**. The nontransparent bounding rectangle therefore spans **81.5736 × 18.532mm**. Canvas dimensions are **82 × 18.86mm**. Left/right transparent margins are **0.1312mm** and **0.2952mm**, respectively. The visible alpha bbox is **0.4264mm narrower** than the 82mm canvas. To target a full 82mm alpha bbox would require a canvas width of **82.4286mm** (82×2500/2487), subject to supplier editor rounding.

**Decision:** keep original **82mm canvas** as the approved design intent until the owner explicitly revises it. Do not silently enlarge artwork to make the alpha bbox 82mm. The alpha bbox is *not* a guaranteed deposited-ink boundary: anti-aliasing and supplier rasterization/print process may alter it. Actual print width/placement, white underbase, fabric interaction and vendor acceptance are **UNVERIFIED**.

**Independent Python stdlib calculation:** executed in cloud container 2026-11-12; PASS 4/4 (bounding-box bounds, dimensions, width shortfall, invalid bbox rejection). This is a geometry calculation based on previously recorded metadata, **not** a fresh pixel scan of the original PNG. The initially mistyped expected scale value caused an assertion failure; corrected by recomputing exact 82×2500/2487 before passing. Browser/physical print checks: NOT RUN.

**Next physical blocker:** explicit permission for third-party original logo upload, owner-selected size, and seller-confirmed one-piece original-image quote. No order/payment/contact authorized.
