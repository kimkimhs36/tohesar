# Asset provenance — Cinematic World 001

## Existing TOHEŞAR works (read-only copies)
Copied without image edits from kimkimhs36/tohesar main commit `d0c3419d1cf9a04842e700775310dabed8de5bed` on 2026-10-11:

- `assets/wordmark-hd.png`
- `assets/cedilla-icon.svg`
- `assets/yokohama-arrival.webp`
- `assets/yokohama-portrait.webp`
- `assets/yokohama-interior.webp`
- `assets/yokohama-bluehour.webp`

The local paths have the additional prefix `public/`. The production originals were not modified. These are existing AI-assisted visual studies, not newly photographed footage. The official wordmark is used as an image, with an invert CSS filter for the dark scene. The additional attached PNG and Continuity Book were inspected for brand context; neither was modified or uploaded into the site.

The previous LAUNCH 001 media were not accessed or edited. No content is represented as POSTS 010–013 or a newly approved publication. No third-party music recording is used.

## Car Concept

- Work: **Car Concept**
- Model/textures: **Eric Chadwick**, **Darmstadt Graphics Group GmbH**, 2024
- License: **Creative Commons Attribution 4.0 International**
- Primary source: https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept
- License: https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/CarConcept/LICENSE.md
- License terms: https://creativecommons.org/licenses/by/4.0/
- Source binary: https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CarConcept/glTF-Binary/CarConcept.glb
- Source license and attribution were verified in the repository README and embedded GLB copyright field.

Changes: silver body material; muted interior; toned-down lamps; glass changed from transmission to reflective opaque shading; removed source logo artwork by removing emissive artwork texture references and license-plate base color map; removed unused material variants; deduplicated and welded; resized textures to maximum 1024² and converted to WebP; meshopt compression and vertex quantization. Geometry is not represented as original TOHEŞAR design or a Porsche. Original copyright remains in the GLB metadata. The concept car and the archival 911 are different vehicles. No endorsement by the source authors or Khronos is implied. Trademark rights are not granted by the CC license.

Rebuild helper: `scripts/prepare-model.mjs INPUT.glb OUTPUT.glb`. Tool dependencies are @gltf-transform/core, @gltf-transform/extensions, @gltf-transform/functions, meshoptimizer and sharp, installed separately for preparation; they are not shipped in the application runtime.

## Original procedural work

Harbour, overpass, bridge approximation, skyline, bench, cup, bicycle, mooring fittings, fallback unbadged coupe, camera route, asphalt shader, water shader, sky shader, contact-shadow texture and original synthesized ambience were authored for this experiment. The harbour is an interpretation, not a geographic survey. The fallback coupe is a shape study, not a licensed or dimensionally faithful manufacturer model.

## Dependencies

- Three.js 0.180.0: MIT, https://github.com/mrdoob/three.js/blob/r180/LICENSE
- Three.js Reflector, GLTFLoader, MeshoptDecoder and BufferGeometryUtils are bundled from that release.
- Vite 7.1.9: MIT, build-time only.
- Noto Sans KR subsets: SIL Open Font License 1.1. Full license in `public/assets/fonts/OFL.txt`. The packaged subsets cover Korean copy used by the experiment; native Apple system fonts remain preferred.

No generated-image API, paid generation credits or external audio files were used.
