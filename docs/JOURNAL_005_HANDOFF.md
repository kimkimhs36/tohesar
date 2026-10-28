# TOHEŞAR Journal World 005

Branch: `feature/tohesar-journal-world-005`  
Base: `24de81762bfa63f7281928df82b15d5daba0829b` (COVER 004 LIVE)

## Shipped experience

- `/`: COVER 004 composition and scroll preserved. Only the top Journal link now opens `/journal/` through a short lavender veil. Native cross-document View Transitions progressively enhance supported browsers; standard links and CSS veil work without them. No-JS navigation remains functional.
- `/journal/`: photo-led Korean journal, featured story, attributed manufacturer news, asymmetric design features, Yokohama visual culture and miniature invitation.
- `/journal/911/`: original full Korean design editorial, official historical references, image provenance, scroll-linked original miniature, next story.
- `/journal/f40/`: second original Korean design editorial with licensed documentary photograph and Ferrari primary source.
- `/journal/news/`: three source-verified manufacturer announcements; topic filters; explicit curated snapshot, not a live feed.
- `/docs/journal-005-review/`: screenshots, original artwork review, scroll video and machine-readable checks.

## Preservation

- Original journal is byte-for-byte preserved at `/journal/legacy-004/`; original root HTML at `archive/home-before-journal-005.html`, also available through base Git history.
- `journal/yokohama/`, `edition/`, existing brand SVGs, cover CSS and cover scroll JS are untouched.
- Official `main`, `tohesar.com`, existing COVER 004 branch and existing Vercel projects were not changed. New branch pushes do not match the existing main-only Pages deployment trigger.
- Cover pixel comparison at 390 × 844: zero changed pixels at start and end of original scroll sequence.

## Motion

`journal/assets/miniature-motion.js` measures the sticky article plate and SVG curve on resize/font readiness. A passive scroll event schedules one requestAnimationFrame; scroll position maps directly to SVG path length, with a small tangent-based body tilt. No perpetual animation loop, inertia integration, scroll interception, WebGL or 3D library. Backwards/fast scrolling is deterministic. Art stays in a reserved track, outside text and hit targets. Three explanatory scenes follow progress; an actual F40 link continues the reading journey. `prefers-reduced-motion` removes the extended sticky scene and presents all captions and the static car.

One original car design was produced, not three. AI-assisted full-resolution transparent source: `creative/journal-world-005/miniature-source.png`; optimized asset: `journal/assets/miniature-coupe.webp` (78 KiB). Existing Yokohama imagery is clearly identified as AI-assisted visual fiction, not documentary photography or exact model evidence.

## Content updates

Edit `journal/data/news.json`, keeping title, manufacturer, topic, original publication date, source URL, concise summary, image conditions and status. Verify primary sources before setting `status: published`. Run `python3 scripts/build_journal_news.py` to regenerate static news in both pages. All news is readable without JavaScript. Current source check date: 2026-10-28. Collection automation/CMS/accounts were intentionally outside scope.

## Validation and remaining limits

- Chromium 154 and Playwright WebKit 26.5: 50 responsive page checks across 320, 390, 430, 768 and 1440px; no horizontal overflow or broken images.
- Full cover → journal → article → F40 journey, back history, direct load/reload, unsupported-native-transition fallback, no-JS navigation, news filters, reverse scroll, landscape rotation and reduced motion pass.
- Native transitions now consume cancellation promises and never intercept pointer events, including rapid history/rotation. Captions are swapped without overlapping text.
- 106 local asset/link references checked. Brand/cover/Yokohama source preservation verified against the base.
- Actual physical iPhone Safari, battery/thermal behaviour and older iOS versions have not been tested. Browser-engine verification is not a real-device claim.
- News is a manually verified three-item snapshot, not comprehensive real-time coverage. Only one miniature design is commissioned in this build.

## Local review

Run `python3 -m http.server 8000` in the repository, then open `/`. Run `node scripts/verify_journal_005.cjs` with Playwright installed and browsers available. The test accepts `BASE_URL`, `REVIEW_DIR` and optional `WEBKIT_EXECUTABLE_PATH`. This cloud host needed locally extracted WebKit libraries; no project runtime dependencies were added.

## Build commits

- 005.1 `e83bbc9`: gateway and preservation
- 005.2 `89131c7`: journal and curated news
- 005.3 `b99ef12`: Korean 911 and F40 editorials
- 005.4 `1a8379b`: original miniature art
- 005.5 `b0dceca`: scroll motion
- 005.6 `aa6ae56`: integration, review artifacts and completed browser checks.

## Isolated deployment — READY

- Public review: https://tohesar-journal-005-review.vercel.app/
- Journal: https://tohesar-journal-005-review.vercel.app/journal/
- Review room: https://tohesar-journal-005-review.vercel.app/docs/journal-005-review/
- Additional verified review alias: https://tohesar-journal-world-005-review.vercel.app/
- Project: `tohesar-journal-005-review` / `prj_QulgEvdY72JSr0TPWedS00OwgrsY`
- Deployment: `dpl_HmhvBap3PYH41dQQ1b1qXvrb37DX`
- Deployed source: `aa6ae56b0a4a5b3e3168ab7157711f0910886bd0`
- Environment: production **of the new isolated review project only**; static HTML/CSS/JS, build approximately 3.2 seconds. Existing production projects/domains were not modified.
- Post-deploy: eight public routes return HTTP 200; cover → journal → 911 → miniature → F40, history, reload and reverse scrolling pass; no page errors. See `docs/journal-005-review/deployment-result.json`.
- Final branch commit adds only this completed deployment record and the JSON result; the deployed application source remains the tested 005.6 commit above.

Remote branch heads checked after deployment: `main` remains `8e2960ec70254f83033d8a808c3ea0eacd6eceb6`; COVER 004 LIVE and the untouched editorial-005 experiment remain `24de81762bfa63f7281928df82b15d5daba0829b`. The existing cover review project still points to its original `dpl_4642JKEtTXXMRZUQYF3jcKVMnzAe` deployment.
