# TOHEŞAR — FIRST IMPRESSION 002 / HANDOFF
Date: 2026-10-28
Branch: `experiment/first-impression-002-20261028`
Stable existing version (not changed): https://tohesar-first-impression.vercel.app/first-impression/
New route when deployed: `/first-impression-002/`

## Rationale
The owner supplied six iPhone screenshots of `FIRST IMPRESSION 001`. They showed:
- The hero typography dominating the first impression instead of the automobile.
- The Ferrari F40 photograph looking like an isolated rectangular image card on mobile.
- A news module dominated by oversized, untranslated English wire headlines.
- Repetitive section headings and over-explanations, despite subtle gradient atmosphere being directionally useful.

## Implemented in 002
1. A photo-first hero with actual licensed F40 source, high contrast on the car and a cinematic dark-to-light atmosphere. The iPhone layout places photography in the initial viewport.
2. An ambient duplicate of the same F40 photograph blurred **behind** the sharper, complete-car original on mobile (not a synthetic car, no third-party rehosting), with subtle gradient masking to prevent a hard box.
3. A restrained header, accessible disclosure menu, appropriate mobile touch area, and article link.
4. News opened with concise Korean previews of Porsche Mission S (Oct 15) and BMW Concept 7 Protection (Oct 12). These are editorial summaries of **verified manufacturer statements**, not live auto-generated articles.
5. Original-language live RSS wire remains available behind an optional disclosure using the existing `/api/radar` (Porsche Newsroom, BMW PressClub, Motor1); the page does not hallucinate translated titles.
6. Porsche 911 editorial, photo credits, and deep links remain accessible. The existing Wordmark / Se-diyu marks are used; no new logo and no Memory Alloy.
7. Small CSS-only animated gradient fields, no 3D/WebGL and reduced-motion fallback.

## Independent verification
The official Porsche Mission S article was verified against
https://newsroom.porsche.com/en/2026/products/porsche-mission-s-vision-model-43528.html
and BMW Concept 7 Protection against
https://www.press.bmwgroup.com/global/article/detail/T0461562EN/bmw-concept-7-protection-discreet-protection-in-its-most-sophisticated-form
Publication dates are Oct 15 and Oct 12, 2026, respectively.

## Deployment blocker: DO NOT MISSTATE AS LIVE
The new `tohesar-first-impression-002` preview project could **not** be created, because Vercel returned HTTP 402 `api-deployments-free-per-day`, with `retryAfter: 86400`. The cap is account/team-wide. The local fallback was inspected: the sandbox has neither an authenticated `vercel` CLI nor an automatically mountable Git working tree for this repository. No preview URL for 002 has been confirmed.
The GitHub branch retains the source files. Do not claim the 002 route is working on Vercel or offer an invented address. After deployment capacity is restored, deploy the newest branch SHA to an **isolated preview** and verify `/first-impression-002/`, images, CSS, and API.

## Quality gate still required
- `astro check && astro build && npm test` on latest 002 branch (not yet run).
- Execute `tests/browser/first-impression-002.spec.ts` with Playwright on Chromium/WebKit.
- Real iPhone Safari screenshots at 375/390/430px and both orientations; inspect whether F40 silhouette stays recognizable and typography does not overlap.
- Check source imagery sizes, CLS/LCP, reduced motion and touch menu.
- Never update `main`, `tohesar.com`, established V3.2, or other production projects without explicit release approval.
