# TOHEŞAR V3

A static, Korean/English motoring and machine-culture journal. Warm Press editorial design, original TOHEŞAR identity, responsive licensed photography, semantic HTML, minimal JavaScript.

**Branch:** `redesign/tohesar-v3-newsroom-20261025` · **Status:** unpublished preview. Never deploy this branch to `tohesar.com`, main, existing V2.x projects or BKIT.

## Run

Node 22.12+ (Vercel: Node 24). From a clean checkout:

```sh
npm ci
npm run dev
npm run build
npm test
npm run preview
```

The build runs Astro's type/content checks. Output is `dist/`; old V2.4 root HTML/CSS/JS remain for provenance and are not deployed. See [architecture/audit](docs/V3_ARCHITECTURE.md) and [run status](V3_STATUS.md).

## Verify

```sh
npx playwright install chromium webkit
npx playwright install-deps webkit
npm run test:e2e
```

Playwright defaults to `/usr/bin/chromium` in the managed workspace; set `CHROMIUM_PATH` to another Chrome binary when needed. WebKit tests use Playwright's installed engine, not an actual iOS device. `TEST_BASE_URL=https://… npm run test:e2e` checks an existing preview without starting a server. Automated tests and screenshots do not replace physical Safari checks.

## Edit and publish content

1. Create `src/content/articles/<slug>.json` using the existing complete schema. Begin with `status: draft`; drafts are never rendered.
2. Check primary sources. Record documents and verification states. Confirm photo owner, actual license, permitted usage, attribution and expiry in `content-assets.json`; import the local photo in `Photo.astro`.
3. `review` + `demo: true` permits a clearly identified fixture in this preview. It does not publish the article. Review content without demo remains hidden.
4. Real publication requires `demo: false`, `status: published`, actual author/editor/publication date/canonical, verified primary sources and cleared photo rights. Schema/build checks reject incomplete promotion.
5. Record corrections; update `modified_at` honestly. Build and verify article, discovery/search, metadata, image credits and feed output.

The default `PUBLICATION_MODE` is preview. `PUBLICATION_MODE=published` excludes all review fixtures. Changing this mode does not authorize production deployment. This preview deliberately has no Article schema, RSS items or sitemap article URLs for demos. Unique titles, descriptions, OG, canonical and manifest are present.

## Deployment isolation

New project only: `tohesar-v3-run001` in team `teambkit`. `vercel.json` disables automatic Git deployments. Use a manual deployment with **target preview** and the exact reviewed branch commit. No custom production domain or main promotion.

The site uses browser-local saved links and font preferences. No login, trackers, paid API, newsletter form, service worker or backend is implied. Clearing browser data clears saved links. Photography licenses are documented in [the registry](content-assets.json).

## Fonts

Self-hosted Noto Serif KR/Sans KR under SIL OFL are subset to the current source/content corpus, with variable weights 400–650. Georgia/native Korean fonts remain fallbacks. After introducing new Korean copy, regenerate committed WOFF2 files with `npm run fonts` (Python `fonttools[woff]` and Brotli required); normal Vercel builds use those committed files and do not download fonts. Licenses ship under `public/fonts/`. Regenerate fonts before final QA when copy changes.
