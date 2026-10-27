# TOHEŞAR EDITION 003 — Art direction, news integrity & GitHub Pages deployment

**Date:** 2026-10-28  | **Repository:** `kimkimhs36/tohesar`  | **Target path:** `/edition/`

## 1. The brief, not the previous design
The actual goal is a genuinely beautiful, mobile-first Korean automotive journalism site that teaches design, history and the present. Prior V3 and FI001 screenshots were dominated by oversized typography, horizontal rules, box-shaped source photographs and untranslated English wire titles. The owner asked for cinematic wonder, restrained flowing peach/blue-green light, a world that extends beyond cars, and the language of elegant Bond films (without copying protected franchise graphics). Performance and journalistic integrity must be as ambitious as aesthetics.

## 2. Research & design lessons
- [Type 7](https://type7.com/): an automotive *daily magazine* centered on human stories, high-quality car photography and cultural context, not just product announcements. **Application:** image-led hero, human-readable stories, journaling as an experience.
- [The Road Rat](https://theroadrat.com/about): collectible automotive culture, striking photography and designed editorial reading. **Application:** a deliberately paced edition, tactile but not archaic typography; avoid repeating newspaper rules all the way down the page.
- [Porsche Newsroom, Mission S (2026-10-15)](https://newsroom.porsche.com/en/2026/products/porsche-mission-s-vision-model-43528.html): the company presented a *vision model* and announced development of a new mid-engined platform. **Fact boundary:** do not pretend that specific series specifications or a launch date are confirmed.
- [BMW Concept 7 Protection (2026-10-12)](https://www.press.bmwgroup.com/global/article/detail/T0461562EN/bmw-concept-7-protection%3A-discreet-protection-in-its-most-sophisticated-form): manufacturer release on a 7 Series-based *concept*, not a claimed mass-production release.
- [GitHub Pages publishing](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site): static branch publishing does not execute the Vercel SSR endpoint; Pages Actions build workflow must be configured by the repo administrator for scheduled source collection.
- [Scheduled Actions](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows): cron executes only on the default branch; schedules may be delayed and can be disabled on inactive public repos. **Do not promise real-time streaming.**

## 3. Visual system
- **Narrative:** paper-light introduction without a tall text wall; cinematic full-viewport *actual* F40 photograph; carefully blended dark photographic vignette; a compact white newsroom; another darker photographic long-read; airier final index.
- **Color:** base `#efede5` + near-black green `#1c2925`; accents peach-warm and mint-blue; no generic neon glassmorphism.
- **Motion:** 2 slowly translating radial gradients; no Three.js, autoplay, Lottie, giant fixed blur or scroll hijacking. `prefers-reduced-motion` removes motion.
- **Typography:** existing licensed TOHEŞAR custom Korean sans/serif, locally served WOFF2 subset; avoid giant repetitive labels. Use native semantic elements and readable article line height.
- **Photography:** source F40 and Porsche 911 originals already in the repository; transfer Git blobs by SHA. Clearly attributed CC BY-SA 4.0 and CC0 1.0. No generated car presented as real.
- **Device policy:** iPhone Safari first; iPad in landscape naturally expands; desktop remains functional. Target no horizontal overflow at widths 320 / 375 / 390 / 430 / 768 / 1024 / 1440.

## 4. Architecture and feature status
- `edition/index.html`, `edition/style.css`, `edition/app.js`: fully static, no frameworks, independent of existing `main/index.html` and safe to serve under a subpath.
- `edition/story/mission-s/` and `edition/story/f40/`: real navigable Korean long-form studies with clear separation of sourced manufacturer facts from interpretation and an explicit AI-assisted editorial-draft disclosure.
- `edition/data/news.json`: *dated source snapshot* with verified official stories. Never masquerades as freshly collected if the scheduler did not run.
- `scripts/refresh_news.py`: concurrent publication architecture starts with bounded feed fetching; explicit 3-source publisher allowlist, HTTPS link validation, timeout, feed file-size limit, deduplication, recency and preservation of old snapshot when all sources are down. Headlines only; no article body or image scraping.
- `.github/workflows/tohesar-pages-news.yml`: on main push and four times per UTC day, builds a **whole-site** Pages artifact, preserving existing `CNAME` and all legacy content, refreshes JSON in build output, executes tests and requests Pages deployment. Must be enabled with **Settings → Pages → Build and deployment → Source: GitHub Actions**. Do not assume this is enabled by the code commit.
- Reading utilities: keyboard-accessible navigation, source-aware live cards, site search of available article titles and fetched headline strings, local-only saved articles via localStorage, Web Share with clipboard fallback, article scroll reading progress and accessible dialogs.

## 5. Editorial governance
1. RSS titles are *external publisher claims*, always linked to their originals. They are not TOHEŞAR reporting.
2. Korean summaries of dated primary sources are deliberately separate from RSS titles.
3. Articles require human final fact check, attribution and legal review before being declared published professional journalism.
4. No passwords, keys, scraping cookies or third-party tracking scripts in the front-end.
5. Missing feeds gracefully show the dated snapshot and direct official links, not fabricated current headlines.

## 6. Release protocol
1. Create a feature branch from `main`, adding `edition/**`, `scripts/**`, workflow and this document only.
2. Check GitHub tree paths, test local syntax / HTML references and confirm `CNAME` = `tohesar.com` remains unchanged.
3. Fast-forward main **only with verified non-destructive tree**. The existing site root remains untouched while `/edition/` is added. Do not automatically replace `/` or overwrite V3 assets.
4. Determine whether GitHub Pages is configured and externally accessible. If not, user/admin must set Pages branch source (or select GitHub Actions for scheduled feeds). Report separately: source committed, CI deployed, domain verified.
5. After actual iPhone feedback, promote the edition to the root only through an explicit review.

## 7. Future technical opportunities
- Expand licensed photography with accurate credits, image optimization (AVIF/WebP) and auto-generated responsive srcsets on a build pipeline.
- Add a reviewable authenticated editorial CMS, unpublished draft state and editorial audit log before allowing any automatic original-story generation.
- Move headlines from RSS title classifier to structured article entities keyed by canonical IDs, reviewed Korean summaries, fact-check confidence, contradiction checks and linked manufacturer sources.
- Automate WebKit screenshot comparisons and Lighthouse LCP/CLS on physical-ish emulators; do not infer beautiful real iPhone appearance from code-only tests.