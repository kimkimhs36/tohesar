# Next Generation — asset and dependency provenance

All original photographs/AI-assisted visual studies, wordmark, approved cedilla outline, model binaries and license files remain unchanged from main `6c5ec183992332d1d44b35edc8f86ea14f1ce1a5`. These visual studies are not documentary photography. Original code is preserved in Git and the previous entry points are copied verbatim to `archive/next-generation-baseline/`.

- Three.js r180 (0.180.0), MIT: vendored unmodified from the npm release. Only the standard WebGL build and the used addon dependency closure are included. License at `vendor/three/LICENSE`.
- DM Sans and Instrument Serif: Google Fonts distribution, SIL Open Font License 1.1. Font binaries converted losslessly from TTF to WOFF2. License files in `fonts/`. Local fonts and modules remove third-party runtime availability requirements.
- Noto Sans KR originals and original license remain in `world/assets/fonts/`.
- Porsche 911 Carrera 4S model: Lionsharp Studios, optimized derivative by webtrackerxy. CC BY-SA 4.0. Existing binary unchanged; runtime materials adjusted. All original source links and requirements remain in `../world/ASSET_PROVENANCE.md`, with visible attribution in the new World experience.
- New harbour and exhibition geometry, environments, studio reflection arrangements and brushed material maps are procedural work for this rebuild; no third-party HDR environment is used.

New generated editorial study provenance will be recorded here before the final checkpoint.

## New coastal editorial study

`images/coastal-study.webp` is a new AI-assisted fictional editorial image generated for this rebuild with `image_gen.imagegen`. The untouched generated PNG is preserved at `images/coastal-study.png`; the deployed WebP is a format/compression export. It is visibly captioned as an AI-assisted study. This is not documentary photography, a surveyed location or a claim of manufacturer endorsement. Exact prompt and known tool metadata limits: `images/coastal-study.provenance.md`.
