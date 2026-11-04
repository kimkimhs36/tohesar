# TOHEŞAR OWNER STORIES — Preview QA, 2026-11-04

## Verified directly on user's Windows PC through Desktop Commander
- Branch: `feature/owner-stories-growth-pilot-20261104`; production `main` unchanged.
- Files retrieved from GitHub raw branch and overlaid on public assets in a local Playwright Chrome network mock; this is **not a live deployment**.
- Chrome viewport 375×812, 390×844, 1024×768.
- At every viewport: homepage loaded HTTP 200, cinematic sequence preserved, new Owner Stories invitation present and visible, no horizontal overflow.
- Clicking homepage CTA navigated to `/owner-stories/` with campaign query parameters.
- On destination: Giulia hero background exists, no horizontal overflow, user-facing email submission link present.
- Screenshots written to isolated PC test folder `Documents/TOHESAR_REMOTE_TEST_20261104/owner-stories-{375,390,1024}.png`.
- Existing navigation transition script emitted `Transition was aborted because of invalid state. ViewTransition opt-in disabled` on navigation in test; navigation **did** complete. Investigate before merge. This does not establish actual WebKit or iPhone Safari compatibility.
- Browser test code and screenshots retained in temporary isolated test folder; originals and Git worktree were not modified.
- User-facing `tohesar.com/owner-stories/` is **not yet public**.

## Release gate
- [x] Isolated branch, changes reviewed via GitHub API.
- [x] Desktop Chrome 375/390/1024 viewport click tests.
- [ ] Resolve/contain transition error.
- [ ] Inspect screenshots for art-direction quality and legibility.
- [ ] Actual iPhone Safari/WebKit check.
- [ ] Explicit editorial review before promotion to `main`.

## Change scope
- `owner-stories/index.html`: opt-in car-owner editorial landing, no automated data collection.
- `journal/assets/owner-stories-pilot.css`: independent, responsive invitation style.
- `index.html` (branch only): one call-to-action and stylesheet, preserves existing cinematic hero; optional Index link.

No paid advertising, outreach, public deployment, production file overwrite or external data disclosure occurred.

## Functional follow-up (same day, remote PC)
- Corrected a missing `participation.js` and `participation.css` inclusion in `owner-stories/index.html`; corrected Open Graph metadata line breaks.
- Branch ref content on the raw GitHub CDN was briefly stale. For the final QA, the browser fixture fetched a **specific immutable commit**, `f9de26cc49bef46b9a02dcdbd114ecb2f6c1028b`, not the stale branch raw endpoint.
- Verified script fetched (HTTP 200) and executed on Chrome.
- Tested widths 320, 375, 390, 430, 768, 1024. All: homepage CTA linked to owner-stories, no horizontal overflow, 3 editorial track cards, form valid after filling, clipboard-copy status displayed and clipboard contained `tohesar@gmail.com`. Privacy-preserving client-only implementation.
- Existing homepage navigation transition warning still surfaced in these automated tests, despite successful navigation. Investigate in release QA, especially on actual iPhone Safari.
- **Not deployed to production; no user email was sent** (testing clipboard only).
