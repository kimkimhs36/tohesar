# TOHEŞAR EDITION 004 — News discovery, source filters, mobile reading

Date: 2026-10-28. Based on main SHA `5ddc6818`.

## Confirmed pre-existing baseline
- EDITION 003 has been merged into `main`, with both Pages deployment and news refresh workflows reporting success.
- Existing pages include home, news, archive and Ferrari F40, Porsche Mission S and Porsche 911 essays.
- Last captured main news snapshot: 2026-10-27 23:55:53 UTC; 3 publisher sources each returned 20, 18 and 20 entries, capped to 45 in reader.
- Previous local Lighthouse (not today's new test): Performance 90, A11y 100, Best Practices 100, SEO 100; mobile simulated LCP 3.5s.
- GitHub Pages still has competing legacy branch publishing vs custom Actions deployment; only repository administrator can switch Settings → Pages → Source → GitHub Actions. A successful Actions run does not by itself prove fresh JSON wins on the public domain.

## Changes in this edition
1. The original news index gets **text search**, source picker and category picker. News is progressively revealed **12 items at a time**, rather than immediately listing 45 on mobile.
2. Category labels are inferred strictly from RSS title keywords, not claimed as verified editorial classification or facts. Categories: new-cars, design, technology, motorsport, motorcycles, industry.
3. The source ingestion script writes `classification: headline-keywords` alongside `fact_checked: false` for transparency.
4. Existing old `ORIGINAL` category snapshots can still be filtered client-side using a fallback title-only heuristic.
5. Global search now loads the attributed headline index on demand even from the homepage and article pages (previously it only searched saved, baked-in editorial titles outside the news page).
6. The original article source attribution, news timestamps, local saves, share controls, browser history, CSS-only atmospheric visuals and all main root files remain unchanged.

## Testing and release checks
- GitHub Actions: `.github/workflows/edition-news-qa.yml` executes offline Python RSS tests, HTML/asset provenance test, Node JavaScript syntax check, and asserts the complete filter wiring.
- Python unit test `test_headline_topic_inference_is_labelled_not_fact_checked` adds keyword and metadata checks.
- Before merge: ensure branch QA succeeds and inspect PR diff, especially zero edits to root `index.html`, `CNAME`, `symbol/` or legacy `assets/`.
- After merge: verify main Pages deployment workflow completes and the news desk URL `https://tohesar.com/edition/news/` remains accessible; no actual physical iPhone Safari claim.
- Status labels remain stale-aware and publishers are source links, not TOHEŞAR-verified news.

## Known constraints
- Real-time browser APIs cannot run on GitHub Pages. This is source ingestion at scheduled deploy time, not live streaming.
- No automatic human-reviewed Korean reporting or article text copying is enabled.
- Page Source setting remains a required admin change for reliable scheduled freshness. Avoid committing feed snapshots every few minutes just to work around it.
- Filter rules are best-effort grouping, not supervised semantic classification.
