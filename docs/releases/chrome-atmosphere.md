# CHROME ATMOSPHERE

Branch: `experiment/chrome-atmosphere-001`. Standalone `/experience/` artwork.
Previous experiment is preserved on `experiment/main-homepage-redesign-001`.
Official homepage is restored exactly to main; no navigation edit is included.
WORLD and the original symbol gallery are untouched.

## Checkpoint 01 — Liquid metal, light & space
Original asymmetrical parametric chrome sculpture, physically based HDR studio
reflections, optical glass sphere, peach/blue atmospheric backdrop, and an
ivory mobile-first typographic composition. No existing photography or Cedilla
geometry is used. All rendering dependencies are served locally.

## Checkpoint 02 — Between states
- A 265svh pinned sequence connects the opening and one subsequent scene.
- Scroll physically opens the liquid loop, changes its cross-section, orbits and
  dollies the camera, moves the glass into the opening, and rotates studio light.
- Typography moves away as the camera travels; the second composition resolves
  into “Between states.” No photo galleries, repeated content, or extra sections.
- Native touch scrolling; scroll progress is smoothed with frame-time damping.
  Reduced-motion removes inertia/ambient movement. Ambient motion can be paused.
- Official main is unchanged; no production deployment or Pages changes.

## Saved result
- First scene: `eca968d` (remote push verified).
- First scroll transition: `df35515` (remote push verified).
- Source formatting and visual captures saved in the final review commit.
- Chromium portrait rendering confirmed: WebGL ready, no uncaught page errors,
  scroll reaches scene 02. Landscape composition captured at iPad dimensions.
- Actual iPhone Safari hardware verification remains pending; no extensive QA run.
- GitHub Pages serves main; this independent branch has not been published.
  No Vercel deployment or separate repository creation was attempted this session.
- Review images: `docs/previews/chrome-atmosphere/`.
