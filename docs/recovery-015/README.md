# TOHEŞAR — Aesthetic Recovery 015

Review branch: `creative/tohesar-aesthetic-recovery-015`. Base: `70d2a818c0be7f695b840fe5a2f2f0255d240b97` (main and newsroom/complete-newsroom-02). No production merge, Pages deployment, domain/DNS change or production configuration change was performed.

## What the screen comparison established

- COVER 004 (`24de817`): a single independent 911/Yokohama composition, custom wordmark, a photograph that shrinks into a frame. These are intact in the current base and were preserved byte for byte.
- Beauty 014 (`f0280c2`): Journal opens with a large 911 photograph and a peach editorial panel. The archived WebKit screenshot was inspected alongside fresh renders.
- Current (`70d2a81`): Journal puts three English RSS headlines ahead of the first photograph. At 390 × 844, the first photograph begins at y=1,151, compared with Beauty 014 at y=321. Newsroom repeatedly uses pale green backgrounds, multiple overlapping introductions, repeated Yokohama invitations and a gradient closing section.
- Older stored captures sometimes show blank lazy-loaded photo areas. Fresh renders loaded the photos correctly. That was excluded as a current defect.

## Final structure

**Cover:** no changes. Journal still opens as a separate page; the original photo, wordmark, framing code, sources and navigation are untouched.

**Journal:** a compact masthead → 911 photo with peach editorial panel → small Issue 001 jacket → Jaguar design study → an asymmetric F40/Giulia design/history pair → a portrait Yokohama spread → three curated Korean source records → Miniature Atelier. The first photograph begins at y=336 on the tested mobile view. Article bodies, all nine curated news records, original images, attribution and the full news archive remain available. The redundant Yokohama preview was consolidated into one invitation, with Visual Culture still accessible in the index and footer. The home uses one dedicated composition stylesheet rather than the previous stack of eight editorial layout layers.

**Newsroom:** its own serif masthead and clear Cover/Journal orientation → a photo-led Jaguar editorial → four automatically collected original headlines as rows → the existing two Korean briefings → two differently sized historical readings → a photographic passage back to Journal. The dedicated news page now places original-headline search/filter controls before the Korean briefing; publisher health is expandable. There is no added machine translation, fabricated news, or copied publisher imagery. The archive and article surfaces share the same paper/ink palette.

**Second visual pass:** reduced the iPad masthead height so the 911 is visible sooner; aligned the mobile publisher/topic fields; collapsed verbose collection-health text; retained 16px mobile search/select text to avoid Safari input zoom. The 140ms paper transition and reduced-motion behavior are preserved. Newsroom links participate in the same transition.

## Verification

- `python3 -m unittest discover -s scripts -p 'test_news.py' -v`: 14 passed.
- `python3 scripts/test_edition.py`: passed, 45 source-linked headlines. Its link resolver was corrected to handle site-root URLs as well as relative paths.
- `python3 scripts/publish.py check`: 1 edition, 7 stories, 9 news records; no state changes.
- `python3 scripts/publish.py links`: 1,407 destinations/anchors across 12 active Journal pages.
- `python3 scripts/test_reading.py`: search → article → back, save/reload/remove, share fallback, archive and news discovery passed.
- `node scripts/verify_recovery015.cjs`: WebKit and Chromium, 8 widths × 8 routes × 2 engines = 128 responsive checks. No broken images, horizontal overflow or JavaScript errors. Complete journeys, Cover framing, search, source/category filtering, 12→24 load-more, reset, saved reading, TOC/progress, original-source links, archive filters, HTTP 503 and stale-data handling passed. Reduced motion and useful no-JS navigation were also verified.
- A complete editorial publishing rebuild in a separate copy passed. Small guards in the older 008/010/013/014 builders preserve the authored 015 home and prevent old layout styles from returning. The Issue and news build markers remain live. The collectors and scheduled workflows were not changed. All three existing article manuscripts were compared with the base and are unchanged; only return navigation changed.
- A live collection to a **separate file** returned 45 headlines: Porsche, Motor1, Autoblog normal; BMW rejected for redirecting outside its approved HTTPS publisher boundary, as in the existing service. Overall status remains `partial`. Tracked snapshots were not replaced.
- [156 protected-file checksums](preservation.json): Cover, domain marker, original assets, source metadata/news data, news engines, collection script and workflows unchanged from the base.

Screenshots are **Playwright WebKit/Chromium emulations**, not physical iPhone/iPad Safari captures. Device Safari UI, hardware scrolling, network field performance and live scheduled job execution were not independently tested. The source-status display remains explicit about partial or stale collection.

## Review and reproduction

Serve the repository root, e.g. `python3 -m http.server 8100`. Open `/docs/recovery-015/` for interactive before/current/after comparison and `/journal/`, `/edition/`, `/edition/news/` for the actual pages. The comparison includes fresh WebKit 390 × 844 and 1194 × 834 captures, complete scrolls, original archived captures and the framed Cover state.

With Playwright and its browser dependencies installed:

```sh
BASE_URL=http://127.0.0.1:8100 node scripts/verify_recovery015.cjs
```

This cloud environment's WebKit required user-space Debian shared libraries added to its browser bundle. The host-library presence check did not recognize the local GLES library, so the tested binary was launched with `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1` **after** verifying that all required libraries loaded and WebKit rendered pages. This does not change repository code or browser security settings. Chromium used the installed `/usr/bin/chromium`. Test results are stored in [browser-results.json](browser-results.json).

Vercel preview deployment was rejected with HTTP 402 / `api-deployments-free-per-day` (more than 100 deployments; retry after 24 hours). No billing, plan, team, production domain or release setting was changed. The fallback is an isolated, owner-private Sites review copy at https://tohesar-recovery-015-review.teambkit.chatgpt.site, separate from tohesar.com. It serves the preserved snapshot and has no scheduled collector of its own. The source helper was unavailable in this environment; ordinary Git with a credential supplied through hidden stdin was used, and the documented static deployment archive (.openai/hosting.json plus dist/) was packaged from that pushed source. Credentials were not written to source or disk. The existing production collection workflow remains unchanged; a preview does not demonstrate a new scheduled deployment. Production release requires the founder's review and explicit approval.
