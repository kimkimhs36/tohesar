# Se-diyu Evening Gallery (2026-10-13)

Scope: `/symbol/` only. Exact new evening gallery HTML, new Three.js metal sculpture renderer, CSS, contour, vendored runtime, and licensed local fonts copied from the existing `experiment/tohesar-next-generation` branch (snapshot `482feb0a799d64881b2525f32934983e21c4b299`). The previous published `/symbol/index.html` is preserved verbatim at `archive/symbol-before-evening-20261013.html`.

Brand identity: the approved Se-diyu silhouette is unchanged. Homepage `/` and Cinematic World `/world/` are untouched. Publishing the standalone symbol page does not merge PR #4.

Third-party dependency: Three.js r180 (MIT), licensed under `next-generation/vendor/three/LICENSE`. DM Sans and Instrument Serif fonts (SIL OFL 1.1), license files under `next-generation/fonts/`. The established TOHEŞAR wordmark and Se-diyu original logo are inherited from existing `/assets/`.

Verification: static dependency path inspection completed. A physical-device browser validation of the published route remains necessary; do not claim browser acceptance test results from PR #4 also apply to this isolated release.

Rollback: `archive/symbol-before-evening-20261013.html` and this release commit's parent preserve the original route. Restore the previous `symbol/index.html` if needed.
