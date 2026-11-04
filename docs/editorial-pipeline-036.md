# TOHEŞAR Editorial Pipeline 036 — release contract

**Status:** source-code implementation awaiting CI and review on branch `engineering/editorial-pipeline-036`. The hourly ChatGPT Production Run is intentionally paused until this contract is proven. Never treat a passing test as independent fact-checking.

## Three separate layers

1. **Unverified wire:** `scripts/refresh_news.py` fetches only external RSS/Atom headlines and links into `edition/data/news.json`. Items have `fact_checked=false`. This feed remains a clearly labelled, English-language wire; no original photographs or articles are mirrored.
2. **Verified Korean editorial records:** `journal/data/news.json` is the **single source of truth** for TOHEŞAR-authored short-news cards. Each published record requires accurate source/date/title, attribution, an editorial verification note, and image-rights information (or no image). This is the list an agent may propose edits to **only after independent source checks**.
3. **Published HTML:** `scripts/news_pipeline.py` renders the existing marked sections in `journal/index.html` and `journal/news/index.html` without changing layouts, CSS, navigation, article bodies or assets. The legacy `build_journal_news.py` delegates to this one renderer.

## Commands

```bash
python3 scripts/news_pipeline.py audit    # validate data; no write
python3 scripts/news_pipeline.py check    # fail if the two HTML pages do not match data
python3 scripts/news_pipeline.py build    # regenerate marked regions only
python3 -m unittest discover -s scripts -p 'test_news_pipeline.py' -v
python3 scripts/publish.py check
python3 scripts/publish.py links
```

`audit` does not prove the manufacturer report or image licence is authentic; it checks structure and mandatory fields only. Editors/agents must independently consult each official dated announcement and cite the actual source.

## Publication procedure for an AI agent

1. Pull and inspect the latest `main`; compare existing records and external source URLs. Never assume a previous agent has not already published the story.
2. Research a specific dated official announcement. Confirm car/model, manufacturer, event date, important specifications, and the precise URL. Distinguish press release facts from editorial interpretation. If uncertain, leave it in `review`.
3. Prepare a concise original Korean title and summary, no invented test drive, quotes, photographs or translation of substantial copyrighted prose.
4. On a **new branch**, add a record to `journal/data/news.json`. Mark `status=published` and `fact_check_status=verified` **only after actual verification**; write a meaningful `verification` audit trail and `verified_at`. If verification is incomplete, keep `review` / `pending`; the HTML generator will not publish it.
5. Execute `python3 scripts/news_pipeline.py build`, then `check`, `publish.py check`, `publish.py links` and regression tests. Compare the resulting HTML diff; only the news markers and dated/count indicators should change.
6. Push an isolated PR, await successful CI, check for new changes on `main` before merging; do not force push, merge stale results, or skip failed tests. Confirm actual GitHub Pages workflow outcome before reporting success.
7. If no meaningful fresh announcement is verified, **do nothing**. Do not manufacture cadence-based posts or fake timestamps. Preserve COVER 004, 032 art direction, SEO 034 and older articles.

## Fail-closed contract

- The renderer refuses to operate if either marker pair is missing or duplicated. It prepares **both** new documents before writing either one.
- HTML output escapes untrusted input. Duplicate IDs, near-equivalent titles, canonical source URLs, invalid dates, malformed private/HTTP source URLs and unverified published items block rendering.
- CI checks that checked-in HTML and published JSON agree; Pages deployment has the same check, so future automated agents must not bypass it.
- Validation is structural, **not** a substitute for checking underlying facts or copyright permissions.
- Multi-file atomicity is achieved by making changes on a branch and committing them together, not by a magical multi-file disk transaction.
- This milestone does **not** provide LLM research scheduling or direct automated publishing; the paused hourly agent should be re-enabled only after repeated production-safe releases.

## Known follow-up engineering tasks

- Unify the two GitHub Pages deployment mechanisms (branch-based and Actions) to avoid double deployment.
- Build a genuine review-queue job with source cache freshness and human/AI provenance notes; do not promote raw RSS items automatically.
- Add image/asset budget checks (GitHub Pages 1 GiB source/deploy limit), archive search and pagination before growing to hundreds of articles.
- Make existing large development screenshots under `docs/` stay outside the public Pages artifact while keeping source history.
