# TOHEŞAR / Sculptural homepage

Branch: `experiment/main-homepage-redesign-001`. Main homepage only; WORLD, symbol gallery, heritage, and journal destination pages remain independent.

## Checkpoint 01 — Editorial foundation
- Rebuilt the homepage with an oversized original wordmark, ivory studio opening, sculptural silhouette, and rust-colored typographic manifesto.
- Full-bleed Yokohama feature, asymmetrical visual studies, working story dialogs and full-screen navigation.
- Reused the approved imagery, Cedilla silhouette, self-hosted typography, metadata and real destination links.
- Static HTML/CSS/JS; no build step. Preview by serving the repository root.

Original homepage preserved verbatim at `archive/main-homepage-before-redesign-20261014.html`.
Checkpoint 01: `8cbf43a` (initial direction).

## Checkpoint 02 — Living identity
- Added real WebGL Cedilla geometry using the approved contour and inward bevels.
- Custom chrome reflections, floating motion, pointer response, scroll-linked rotation, pause control, offscreen suspension and vector fallback.
- Desktop (1440px) and mobile (390px) rendered with no uncaught page errors.
- Homepage fonts and module paths work at a GitHub Pages project base path.
- Checkpoint 01 was deployed READY to an isolated Vercel preview before the user requested GitHub-only previews. No further Vercel deployments will be made.
- GitHub-only preview blocker: creating `kimkimhs36/tohesar-homepage-preview` returns `GraphQL: Resource not accessible by integration (createRepository)`. Production Pages settings remain untouched; awaiting a separately provisioned preview repository.

## Checkpoint 03 — Cinematic rhythm
- Typographic opening reveal, staggered full-screen menu, gallery entrances and slow photographic parallax.
- Magnetic circular links, page reading progress, fine paper grain, and deeper chrome reflection contrast.
- Reduced-motion preferences respected; native scrolling preserved. No automatic sound.
- Existing imagery and copy identify imagined/generated visual studies; no fabricated published stories added.
- Preview hosting remains blocked on separate GitHub repository creation permission. No production configuration changes made.


## Revised delivery — standalone /experience/
The user changed the product scope after checkpoint 03. The new design now lives at
`experience/index.html`, with its own assets in `assets/experience/`.
The official root homepage was restored verbatim from main, then given one
EXPERIENCE navigation link. No shared styles, original imagery, WORLD files,
existing experiments, Pages settings, or domain files were changed.
No separate repository will be created. Vercel is no longer used.

Current review URL after production publication: https://tohesar.com/experience/
(This is an intended URL, not a claim that the branch is deployed.)
Local preview: `python3 -m http.server 4173` then `/experience/`.
