# 01 SHADOW — visible ink versus PNG canvas width (2026-11-11)

**Internal geometry QA; not supplier-approved and not a print proof.**

## Source evidence and reproducible arithmetic
The existing source-locked transparent PNG is documented as **2500 × 575 px**, with alpha bounding box **[4, 4, 2491, 569]**. Pillow bounding boxes use exclusive right/bottom coordinates. Thus visible nontransparent width = 2491 - 4 = **2487 px**; left/right transparent margins = 4/9 px. This is an alpha-extent calculation, not a visual assessment of the typographic wordmark.

- If the vendor scales the **entire PNG canvas** to 82.000 mm, the visible alpha extent is `82 × 2487 / 2500 = 81.5736 mm` (0.4264 mm narrower than 82).
- If the product requirement is **82.000 mm visible nontransparent ink width**, set the complete PNG canvas to `82 × 2500 / 2487 = 82.42862887 mm` in an editor that sizes by canvas bounds.
- If the vendor editor auto-trims transparency or interprets artwork width differently, **neither scaling instruction is safe without a vendor proof**. Require an on-screen width convention and measured/approved final placement. Do not change or crop the master PNG blindly.
- At a canvas width of 82 mm, canvas height = `82 × 575 / 2500 = 18.86 mm`. This is a bounding rectangle, not visible mark height.

## Release decision
**HOLD** until the owner clarifies whether nominal **82 mm** means artboard/canvas width or visible printed logo width; for sample QA use **visible ink width** as the proposed interpretation, NOT an owner-approved revision. Supplier print technique, underbase, minimum detail and opacity are unknown. The proposed ±1 mm tolerance in the prior measurement gate is internal only.

## Falsification and limits
The naive assumption “2500 px canvas scaled to 82 mm always prints an 82 mm logo” is **false** when transparent margins are retained: it gives 81.5736 mm visible extent. The numerical result depends on the documented alpha bbox; verify the binary PNG and supplier's actual import behavior before release. No browser, real garment, physical ruler, print durability or vendor upload tests were run in this step.

## Next physical blocker
After separate permission for external original-logo upload, inspect the vendor's PNG sizing semantics and actual logo-inclusive total, then obtain a true seller proof at the owner-selected size. Do not contact/order/pay without distinct permission. Keep exact TOHEŞAR Ş and original assets unchanged.

## Run state
Read live feature branch head before writing; base observed: `d1550fe76d7c3c9ed6b108c05b79735da6284427`. This file is an additive QA note, not a new artwork variant. PR #38 remains a draft feature review, not main.
