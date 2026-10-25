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

## Final verification

- `npm run build`: passed; Astro 32-file diagnostics: 0 errors, warnings or hints. 19 HTML pages plus generated feeds/index.
- `npm test`: **5/5 passed**, including editorial promotion gates, rights records, unpublished feeds/schema, original identity, and all generated internal links.
- `npm run test:e2e`: **34/34 passed** (17 Chromium + 17 WebKit), including widths 375/390/430/768/834/1024/1194/1440, iPhone touch/landscape, iPad portrait/landscape proportions, full-text/URL/filter/empty search, saved links and type persistence, native photo dialog Escape/focus, no-JS navigation, denied local storage, reduced motion and automated WCAG A/AA checks on home/article/search.
- Local screenshots in `docs/qa/` were regenerated after font optimization with all lazy images decoded and visually inspected. They are browser renders, not physical-device captures.
- Final **isolated localhost** mobile Lighthouse: **performance 85, accessibility 100, best practices 100, SEO 69**. FCP 2.7 s, LCP **3.7 s**, TBT **0 ms**, CLS **0**. SEO is intentionally reduced by unpublished noindex; LCP still exceeds the 2.5 s aspiration. Initial performance was 62 / LCP 6.9 s. A concurrent-run result was discarded as a timing comparison because other browser tests created CPU contention. Summary in `docs/qa/lighthouse-mobile-summary.json`.
- Font optimization: common CSS 182 KB → 25 KB; Korean WOFF2 total ~300 KB, replacing many subset requests. Site JS ~5.5 KB raw (~2.6 KB gzip including search). Field CWV/INP have not been measured; TBT is not INP.
- Deployed HTTP check: **25/25 expected statuses** (23 successful resource/page responses, 2 intentional 404s including excluded Renault), recorded in `docs/qa/preview-http.json`.
- Deployed Chromium smoke: home → F40 → save → body-text search for 탐부리니; one matching story, no page errors. Preview HTML and HTTP `X-Robots-Tag` both retain noindex. Feeds contain no demo items.

## Deployment result

- Stable preview: https://tohesar-v3-run001.vercel.app/
- Immutable preview: https://tohesar-v3-run001-kgx04ky7z-teambkit.vercel.app/
- Project: `tohesar-v3-run001` / `prj_HsWYfI1hIgDoB176wAefwLhEozPP`, team `teambkit`.
- Deployment: `dpl_CoSDcJ62eKsL2uzqDsjCp3Y65mNg`, **READY**, **preview** (Vercel API `target: null`), Astro, Node 24, build-to-ready ~27 s.
- Deployed application SHA: `4ac2c083db72b9dc722ed3a9bc86f03a5c60790f`. A later documentation-only commit records final QA; it does not change the deployed application.
- Deployment API behavior: the initial explicit `target: preview` request was returned as production **inside the new isolated project only**. After checking the official API documentation, a second deployment omitted `target` as documented and returned the correct preview environment. The new project's stable alias was assigned to that verified preview. The initial deployment was left intact; no deletion was performed. No existing production, domain, V2.x project or BKIT settings/aliases were changed.
- Verified remote refs at completion: main `0e5607d8069c09e2082b738ce032e830dc4e0660`; V2.4 editorial `fb7faaa83a95ff322921ea3f266b302405e81efc`; V2.4 reading `6c27e6cba614948d02c602bd60f45aaf02ab1bdd` — unchanged from the starting evidence.

## Known limits

No physical iPhone/iPad was available. Playwright WebKit is engine/device-context coverage, not actual iOS Safari. Core Web Vitals field data and real-device home-screen installation remain unmeasured. No admin UI, auth/sync, offline article cache, live news integration or automatic publishing. File-based editing is documented in README. Existing V2.4 files remain as provenance outside `dist/`.

## Remaining work

1. Human editorial verification of article facts, actual author/editor, publication dates, source documents and final image use before genuine publication. Three demo essays remain review-only.
2. Physical iPhone/iPad Safari, VoiceOver and home-screen installation checks; field performance measurement. Continue optimizing LCP from the measured 3.7 s lab value toward the brief's aspiration.
3. Populate real licensed news/photo/film content; add an authenticated CMS only if the publishing team needs it. Current file-based workflow is operational and documented.
4. Any production launch is a separate, explicitly authorized task. This run has no production-domain release.
