# BUILD 02 verification

Base: BUILD 01 `aff6c362d051bd54c5959a910faca5f778f243cf`, backed up remotely before further changes. Production was not modified.

On 29 October 2026 the collector successfully fetched Porsche and Motor1; BMW redirected to an HTML page and is reported unavailable. The resulting local snapshot has 45 items, including retained BMW cache. `python3 -m unittest discover -s scripts -p 'test_news.py'` passed 11 tests; `python3 scripts/test_edition.py`, JavaScript syntax checks, and `git diff --check` passed.

Headless Chromium rendered cover, journal, edition, news, archive, F40, and Genesis at 375, 390, 430, 1024, and 1440 pixels; no horizontal overflow, page errors, or failures among loaded images were observed. Cover to Journal and browser back, news search, archive filter and reset, story search, save/reload/delete, contents and share/copy fallback were exercised. Captures in `build-02-captures/` show 390px Chromium and 1024px edition. Lazy images not yet loaded are not covered by the image check.

Actual iPhone Safari, field performance, and deployed scheduled updates remain unverified. The current public domain served main's HTML, while this branch is a review build. Feed links and dates are ingested data, not fact-checked articles. Publisher photographs are not automatically reused. Similarity grouping is restricted to exact normalized titles and does not establish that differently worded articles cover the same event.
