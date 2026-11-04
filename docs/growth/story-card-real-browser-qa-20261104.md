# TOHEŞAR STORY CARD STUDIO — Real-device remote browser verification

**Date:** 2026-11-04 KST  
**Repository:** `kimkimhs36/tohesar`  
**PR:** #27 / `feature/owner-stories-growth-pilot-20261104`  
**Status:** Tested in Windows desktop browser engines, **not yet launched on production**.

## Actual executed validation

Testing on the authorized `TEAM-BKIT` PC using Playwright, with the Owner Stories branch served locally on loopback (no public form submission).

| Browser engine | Viewport | Card page | Local photo selected | Tone + crop controls | PNG 1080×1920 | Runtime errors | Unexpected non-GET network |
|---|---:|---|---|---|---|---|---|
| Chrome | 320px | Pass | Pass | Pass | Pass | 0 | 0 |
| Chrome | 390px | Pass | Pass | Pass | Pass | 0 | 0 |
| Chrome | 1024px | Pass | Pass | Pass | Pass | 0 | 0 |
| WebKit | 320px | Pass | Pass | Pass | Pass | 0 | 0 |
| WebKit | 390px | Pass | Pass | Pass | Pass | 0 | 0 |
| WebKit | 1024px | Pass | Pass | Pass | Pass | 0 | 0 |

### Verification details

- Test input: repository's existing licensed Alfa Romeo Giulia editorial image (`journal/assets/giulia/profile-800.webp`) as a stand-in for an owner-supplied photo, with sample Audi A5 B8 text.
- The tested PNGs had native dimensions **1080×1920**. Chrome exported about 1.90 MB; WebKit about 1.43 MB for the selected sample. Image pixels changed after uploading the picture and choosing monochrome tone.
- `story-card-page-webkit-390.png` visually checked: responsive heading, usable editor, photo preview, PNG button, readable CTA.
- `story-card-export-webkit-390.png` visually checked: photo placement, legible car title, editorial masthead, branding and owner-stories address.
- No POSTs or non-GET requests observed during editing or PNG download.
- Downloads and browser scripts saved **only on the PC** under `Documents/TOHESAR_REMOTE_TEST_20261104/`. Nothing was submitted to the real owner inbox.
- Actual iPhone Safari hardware export/share sheet remains to be checked; Playwright WebKit is a useful proxy, not an equivalent guarantee.
- User-visible Story Card Studio is reachable from `/owner-stories/` on this PR. Do not use production `tohesar.com` as a public launch claim.

## Release constraints
- Preserve current `main` and the original Cinematic World/Genesis experiments.
- Require one real iPhone/iPad check for save/share and actual photo formats before the public rollout.
- Avoid tracking or storing owner photo data; retain local-only canvas workflow.
- Do not enable the optional `owner-stories-service` server API without verified domains, secret configuration, rate limits and privacy review.
- Do not claim a campaign result until there is a real owner collaboration and attributable site traffic.

## Success measure after launch
A shareable story card is an **acquisition mechanism**, not proof of growth by itself. Measure unique shared-link visitors, owner submissions, actual published collaborations and repeat shares. Prioritize creative quality and real collaborations over adding more speculative features.

## Art direction revision — two published-in-branch visual layouts

- Added a **CINEMATIC** full-bleed mode and **GALLERY** print-like, ivory framed layout. The second is deliberately photo-book/editorial rather than an OEM+ / tuning-era theme.
- Added independent horizontal and vertical picture crop positions, without uploading any photos.
- On authorized PC, fetched latest isolated branch into clean dedicated worktree `Documents/TOHESAR_STUDIO/owner-stories-pr27` using portable Git; original Genesis worktree untouched.
- Ran direct browser tests in Chrome + WebKit, viewports **320, 390, 768**. For each engine and viewport, verified **both design modes**: 12 PNG exports at exactly **1080×1920**, 12 successful render transitions, no horizontal overflow, **0 page JavaScript errors**, 0 non-GET requests.
- Visually inspected `story2-webkit-390-gallery.png`: ivory margin, full-width framed photography, TOHEŞAR masthead, clean large model typography and readable caption, no clipped title/footnote in the sample.
- Image export files and screenshot references are in local `Documents/TOHESAR_REMOTE_TEST_20261104` only. They are QA artifacts; the real OWNER STORIES public gallery is **not deployed**.
- Test image is licensed editorial photography from existing repo and NOT represented as a real owner submission; photo publishing and actual collaborator identity still require rights checks.
