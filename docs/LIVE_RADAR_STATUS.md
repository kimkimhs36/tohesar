# TOHEŞAR — SOURCE RADAR & DESIGN INTELLIGENCE / RUN 002

Date: 2026-10-28. Branch `feature/live-editorial-radar-20261028`.
Preservation: main, tohesar.com, existing V2.x branches, original V3 and Atelier 04 unchanged.
Preview project: `tohesar-live-radar` (isolated Vercel project).
Preview URL: https://tohesar-live-radar.vercel.app/

## Live product delivered
- `/radar/`: atmospheric, mobile-first news reader with a responsive editorial layout, real headlines, source names, Seoul-local publication times, subject filters and search.
- `/api/radar`: real-time RSS aggregation through Porsche Newsroom, BMW Group PressClub and Motor1. Concurrent time-boxed fetches, 15-minute CDN cache, provenance and strict HTTPS-source-domain allowlist. Captures only original headline, timestamp and source URL; does not reproduce source articles or images. Returns a service-health summary, gracefully supports unavailable sources.
- Homepage `RadarPreview.astro` dynamically loads the four most recent live source headlines, otherwise provides a stable fallback to Radar.
- Main nav and footer connect to RADAR and the existing visual comparison Atelier.
- `/editorial/mission-s/`: substantial independent Korean editorial research draft based on the 2026-10-15 Porsche Mission S *manufacturer statement*, including clearly separated company assertions, design questions, original typographic layout, original-source hyperlink and explicit review-only disclosure. No original vehicle photo was fabricated or copied from Porsche.
- Responsive image/provenance system, existing editorial archives, article reader and accessibility baselines are preserved.

## Integrity and constraints
This is **not** a license to auto-publish scraped third-party articles. Feed titles/times are displayed in source language with publisher links and without auto-generated or falsely attributed summaries. The Mission S article is a review draft, not a published newsroom fact-check or an independent on-site report. Existing F40/911/916 demos are still unpublished fixtures. RSS items can change or disappear on publisher side. No user accounts, analytics/tracking, unconsented alerts or automated article publication have been enabled.

### Sources
- https://newsroom.porsche.com/rss/en/index.rss
- https://www.press.bmwgroup.com/global/rss
- https://www.motor1.com/rss/news/all/
- Official Mission S: https://newsroom.porsche.com/en/2026/products/porsche-mission-s-vision-model-43528.html

## Tests
- `tests/radar.test.mjs` contains publisher-domain allowlist, source-attribution and HTTP method tests.
- `npm test` includes both the prior content validation and new radar tests.
- Browser/WebKit tests created during prior runs remain available and should be re-run after this change.
- Deployment status and endpoints must be verified after each update. Physical iPhone/iPad screenshots remain unverified until a physical device is available.

## Next steps, separated from this run
1. Human editorial review of actual articles and photography rights, independent of RSS titles.
2. Korean headline translation/summary only from verified primary sources with human review and licensed AI/API budget.
3. Authenticated editorial CMS (do not expose an unauthenticated write endpoint).
4. Real-device Safari and Lighthouse optimization; real user feedback on typography, photographs, night hero and 4-way designs.
5. Only explicitly authorized production-domain release, never implicit from preview approval.
