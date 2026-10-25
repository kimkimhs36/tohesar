# TOHEŞAR V3 — production run 001

Date: 2026-10-25. Branch: `redesign/tohesar-v3-newsroom-20261025`.

## Implemented

- Astro static newsroom: responsive iPhone home, iPad lead/latest split, full article templates with restrained Warm Press typography.
- Original wordmark and Se-diyu signature only; locally optimized real photographs with file-page license evidence, complete credits, and full proportions.
- Latest, Features, all seven Subjects, Archive, body-text Search with format/subject filters and query URLs, empty/error states.
- Reader size preferences, local saved links, share/copy fallback, accessible native photo dialog, reading progress, no-JS reading/navigation.
- Native cross-document photo View Transitions with ordinary-link and reduced-motion fallbacks.
- Typed file-based draft/review/published workflow; incomplete publication fails schema validation. Rights and expiry checks; source and correction history.
- Unique metadata/canonical/OG, conditional Article JSON-LD, generated RSS/sitemap/robots, home-screen manifest/icons. Demos excluded from structured article data and feeds.

## Editorial status

Three **unpublished review fixtures**, not a live news feed. Manufacturer text references await editorial re-verification. No invented reporters or publication dates. Unverified Renault 2026 story is absent from the generated site. Unfilled subjects and film/photo sections are explicit empty states.

## Validation so far

- Astro content/type checks and static build pass.
- Content/rights/publication/preview-feed/identity tests pass.
- Chromium 15/15 and WebKit 15/15 initial browser suite passed, covering eight widths (375, 390, 430, 768, 834, 1024, 1194, 1440), search/save/resize, photo keyboard/focus behavior, no-JS, storage denial, and axe WCAG A/AA checks on home/article/search.
- Initial Lighthouse mobile lab: performance 62, accessibility 100, best practices 100, SEO 69 (preview intentionally noindex); LCP 6.9 s, TBT 0, CLS 0. A font-delivery optimization follows this finding; final measurements will replace this status below.

## Deployment target

New Vercel project `tohesar-v3-run001`, ID `prj_HsWYfI1hIgDoB176wAefwLhEozPP`, team `teambkit`. Manual **preview** deployment only. No existing project's settings or deployment aliases changed. Automatic Git deployment is disabled in this branch's config.

## Known limits

No physical iPhone/iPad was available. Playwright WebKit is engine/device-context coverage, not actual iOS Safari. Core Web Vitals field data and real-device home-screen installation remain unmeasured. No admin UI, auth/sync, offline article cache, live news integration or automatic publishing. File-based editing is documented in README. Existing V2.4 files remain as provenance outside `dist/`.

## Follow-up

Finish final post-font browser/visual/performance checks; deploy the reviewed SHA to the isolated preview and verify its HTTP routes/headers; record the exact preview URL and results. Real publication requires human editorial clearance of article facts, author/editor and date, plus explicit production authorization. No production release is part of run 001.
