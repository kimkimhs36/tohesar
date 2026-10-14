# GENESIS 02 — Art pass C06

Research authority: *TOHEŞAR — THE NEXT GENERATION HOMEPAGE*, Scene 01–03 and still-frame quality gates.
Based on Astra's preserved GENESIS 02 commit `3962c0b32f742c5ffbad8890ff40df371d308adf`. Branch `experiment/next-generation-genesis-artpass-20261015`.

## Frame-by-frame diagnosis from saved Chromium captures
- 23–27%: oversized metal sheets dominate the portrait frame and conflict with the wordmark.
- 41%: fractured image appropriately signals a perspective-dependent reconstruction.
- 43% and 48%: white grid seams persist after alignment, weakening the reveal.

## Changes
- Gentler initial camera approach with unchanged 27% and 30% positions.
- Anamorphic fragment borders fade out as alignment resolves.
- Projected UV tiles progressively close the optical gutter at the alignment viewpoint; they **remain at unequal actual depths**.
- Refined upper-left daylight falloff makes the official wordmark readable.
- Use `window.visualViewport` safely.

## Verification status
- Syntax parsed for both changed ES modules after removing module declarations.
- **Edited version not yet re-rendered.** Saved screenshots represent the earlier Astra build.
- Real iPhone Safari, thermal/GPU behavior and WebKit remain unverified.
- Do not merge to `main` or alter the operational Pages site before on-device visual review.
