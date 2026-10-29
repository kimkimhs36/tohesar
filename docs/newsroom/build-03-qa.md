# BUILD 03 verification — 29 October 2026

Base: `6fcdc4a`, newsroom/complete-newsroom-02. Production and its configuration were not changed.

## Changes and corrections

The home page connects the existing Giulia design study and Yokohama visual essay to the newsroom, with image attribution and AI illustration disclosure. The Mission S page now has search and a newsroom link. Search displays publisher names; an obsolete BMW search link that redirected to the newsroom home was removed. A duplicated F40 label was corrected. The browser test's stale error-message assertions were updated.

The collector validates RSS and redirect hosts, uses a per-source limit, and adds Autoblog. BMW RSS and RSS2 currently redirect to HTML, and old BMW story links redirect to the newsroom home; those cached items are excluded. The tested snapshot has 45 items (15 each Porsche, Motor1, Autoblog), with BMW unavailable and overall status partial. This is headline metadata, not copied article text or publisher images. Similarity matching remains conservative; it cannot reliably identify every differently worded report of the same event.

## Verification

- `python3 -m unittest discover -s scripts -p 'test_news.py'`: 14 passed.
- `python3 scripts/test_edition.py`: passed, 45 sourced items.
- `python3 scripts/test_browser.py`: 42 Chromium viewport/page checks and interactions, 503 and stale-data fallback passed.
- `python3 scripts/test_reading.py`: search, article navigation and back, save, share fallback, archive and news filters passed.
- Chromium screenshots: [390px before](build-03-captures/before-390.png), [375px](build-03-captures/after-375.png), [390px](build-03-captures/after-390.png), [430px](build-03-captures/after-430.png), [1024px](build-03-captures/after-1024.png). These are emulated viewports, not iPhone photographs. Actual iPhone Safari and WebKit remain unverified; the downloaded WebKit could not run because system libraries were unavailable. Field performance remains unmeasured.

## Deployment observation

`tohesar.com` served GitHub Pages; Pages API reported `main` / and legacy build type. The scheduled [Pages workflow](https://github.com/kimkimhs36/tohesar/actions/runs/40828658645) successfully collected and deployed an artifact, and the live JSON generation time matched that run, newer than main's committed JSON. `www` redirects to the apex. The API's legacy setting and successful artifact deployment coexist in observed evidence; reconcile settings before changing them. Vercel review projects are separate; the domain was not listed there. The Vercel production branch was not established. The BUILD 02 `news-snapshot.yml` is not on the default branch and its schedule is not active there. Any release must review the Pages workflow and ensure the new collector and UI reach the same artifact; a Vercel preview alone does not update Pages.

Production merge/deployment, any domain/DNS or deployment branch change, and choice of release path require owner approval. The current branch is for review.
