# TOHEŞAR Editorial Radar 037 — hourly, read-only newsroom research

## Why
TOHEŞAR already has a tested 036 Korean editorial publisher and a scheduled RSS wire refresh, but the two must **never be connected by blind automated publishing**. The missing piece is a repeatable, review-only candidate shortlist, produced without altering the public site.

## What this ships
- `scripts/news_candidates.py`: read a fresh, source-labelled RSS snapshot and the current Korean curated-news records. Require a recent successful/partial refresh, strict publisher source identity, HTTPS and actual article paths, date freshness, no `fact_checked=true` claims, no duplicated source URL, and no title already covered. Rank automobile design and cultural news ahead of low-value business headlines. Balance publishers; return at most eight candidates with **mandatory independent-review checklists**.
- `scripts/test_news_candidates.py`: 15 isolated, deterministic tests (duplicate URLs, unverified status, stale feeds, trusted hosts, ranking, source diversity, missing data, future dates).
- `.github/workflows/editorial-radar.yml`: scheduled hourly and manually triggerable; runs tests and publication checks, fetches into `$RUNNER_TEMP`, creates a 3-day GitHub Actions **artifact outside the public checkout**, and uses `contents: read`. It does **not** commit, edit public pages, require an LLM API key, or deploy.

## Review-to-publication handoff
1. Download or inspect the latest `tohesar-radar-<run id>` Actions artifact (JSON). The file is **not** a verified article and never makes itself public on TOHEŞAR.
2. AI or editor opens the original official press announcement; confirms actual event date, car/model and claims, source URL, and photo rights. Do not treat feed classifications as factual claims.
3. Write independent natural Korean text and place only a fully verified item in a new editorial branch of `journal/data/news.json`, using the existing schema.
4. Run `python3 scripts/news_pipeline.py build`, `python3 scripts/news_pipeline.py check`, `python3 scripts/publish.py check`, and `python3 scripts/publish.py links`. Open PR, await all tests, then merge. The 036 publisher and GitHub Pages checks prevent HTML/data drift and unverified publication.
5. Skip publication on slow news days; no forced quota. Long-form essays still require editorial review.

## Operational details
- Minimum editorial relevance score is 10 by default; low-value business/job-cut headlines are omitted from candidate artifacts even when recent. The cutoff affects **review selection only**, not any published article or newsroom RSS page.
- GitHub cron is best-effort and may run late. Code checks timestamp freshness rather than assuming cron precision.
- An all-source outage preserves an old snapshot, but the radar rejects stale or unconfirmed refreshes.
- The source feed may be partial if some publishers fail; the report explicitly records the snapshot state and never claims cross-source factual verification.
- Hourly tasks consume Actions minutes; monitor rate limits and usage, tune the schedule if the reported value is low. No action automatically resumes the paused ChatGPT Production Run.
- Official original URLs remain links to their sources; no copied article body, photos, or copyright-sensitive material goes into candidate artifacts.
- Preserve 032 art direction, Jaguar/F40/Giulia/911 prose, SEO 034, and previous site backups.

## Commands
```bash
python3 -m unittest discover -s scripts -p 'test_news_candidates.py' -v
python3 scripts/news_pipeline.py check
python3 scripts/news_candidates.py \
  --wire edition/data/news.json \
  --curated journal/data/news.json \
  --output /tmp/tohesar-candidates.json
```

The last command reads the repository's checked-in snapshot; if it has become stale, returning zero candidates is expected. In Actions, an isolated fresh scan runs before triage.
