# TOHEŞAR V3 — IMPLEMENTATION BRIEF (2026-10-25)

## Source of truth and preservation
Repository: `kimkimhs36/tohesar`.
Development branch: `redesign/tohesar-v3-newsroom-20261025`; based on experimental V2.4 SHA `fb7faaa83a95ff322921ea3f266b302405e81efc`.
Do NOT modify `main` or its production domain `tohesar.com`. Do NOT alter other preview branches, Vercel projects, or BKIT repositories. New V3 preview project / isolated deployment only.
Reference preview: https://tohesar-press-v24.vercel.app/
Existing identity: https://tohesar.com/symbol/ and existing `assets/cedilla-icon.svg`, wordmark assets.
This is a **new V3 editorial product**, not a patch to old Memory Alloy homepage.
**Memory Alloy and its abstract metallic object are permanently rejected from the new visual design.** Never reintroduce those assets in hero/intro/logo/transitions. Old production files may remain archived untouched, but V3 must not import their abstract object. Original confirmed Se-diyu symbol is allowed, unchanged.

## Signed-off decisions
- Product: true, maintained motoring + machine culture publication. Automotive at center, with motorsport, motorcycles, fixed gear bicycles, aircraft, cinema, design and history.
- Information architecture: Newsroom + Journal + Se-diyu signature. Main navigation: Latest, Features, Subjects, Archive, Search; About/editorial policy via footer/menu.
- Subjects: Automobiles, Motorsport, Motorcycles, Bicycles, Aircraft, Film & Machines, Design & History. Content formats: News, Feature, Design File, Archive, Film, Photo Essay. Keep content type distinct from subjects.
- Visual language: authoritative classical European motoring press plus polished contemporary interactive web; never template-like, fake sepia, oversized type, repeated cards, fake luxury slogans or over-labeled content.
- Palette starting point: Warm Press surface #F1EEE5 / ink #191A18 / selective burgundy #6A261F. Technical blue #29435A is restrained secondary option, not dominant. Must test on real photography rather than treating these as immutable final UI values.
- Retain existing TOHEŞAR wordmark; reuse original Se-diyu silhouette only. Treat Se-diyu as publisher signature/favicon/endmark, not ubiquitous decorative 3D overlay.
- Priority: iPhone Safari FIRST, iPad Safari responsive portrait/landscape SECOND, desktop functioning THIRD. iPad shares content and natural fluid responsive editorial layout, no separate iPad site. iPhone must never be cramped or one huge headline.
- Homepage: primary lead feature with real car photograph, clear headline/deck; compact text-led Latest stream near top; secondary feature; journal, design file, archive and photo/film sections. iPad landscape may show lead ~2/3 and latest ~1/3.
- Article: category/subject; clear 2-3 line title; deck; author/date; properly credited full-proportion hero photo; readable Korean editorial body and intentional photographs; source/correction info; related reading and archive connection. Avoid repeated tiny metadata chips.
- Motion: restrained polished transitions. Home hero -> article hero if supported via cross-document View Transitions with robust navigation fallback. Indicative timings: small feedback 140-180ms, menus 220-320ms, photo->article 320-450ms. No forced splash/loading, parallax loops, scroll hijacking. Support prefers-reduced-motion.
- Product requirement: readers actually can find, read, search, and revisit published articles. SEO-friendly unique URLs and full semantic HTML. Lightweight HTML-first static build, minimal JS, responsive real photography, dynamic features progressively enhanced.

## Core editorial integrity
- Use only verified genuine articles and authoritative source material. No fabricated reporting, invented publication dates/credits, fabricated bylines, wrong model photo, placeholder articles presented as published news.
- Any content requiring licensing must have documented photography rights; otherwise omit photo or clearly place under a separately flagged internal *nonpublished* sample fixture. Do not treat a publicly-viewable manufacturer image as automatically reusable.
- If fewer licensed articles are available, build excellent templates with internally flagged unpublished fixtures. The main public preview must clearly label unverified demo content and must not pretend to be a functioning live newsroom populated with real news.
- Article model: title, deck, slug, content_type, subjects, marque/model/era optional, published_at, modified_at, author/editor, hero metadata (credit, owner, licence, source, usage, attribution, expiry), source_documents, correction_log, canonical, social_image, related_articles, status draft/review/published.
- Publisher review workflow: discovery -> verify primary sources -> assess image rights -> edit -> publish, with corrections tracked; no auto-publish of raw AI drafts.

## Implementation program (continue autonomously within this branch; deliver demonstrable software, not another study)
1. Audit repo and V2.4 layout. Extract good existing editorials and identity files; preserve provenance and do not copy unrelated old landing assets.
2. Create durable content schema, route map, shared components, typography system, responsive image behavior, asset/license registry. Prefer a lean static-generation tool when warranted (Astro is an option, not a mandate). Do not introduce a heavy SPA or WebGL for the general site.
3. Build an exceptionally polished **iPhone homepage and one full article** first using source-backed content or clearly labeled demo fixtures. Validate widths 375/390/430 CSS px, line breaks, image proportions, safe areas, no horizontal overflow, tap targets; then expand to iPad 768/834/1024 portrait and landscape, desktop.
4. Expand to Latest stream, Features, Subjects, Archive, article pages and a real text search index with empty states. Editorial formats should have different layouts: dense text-led News, spacious long Features, large photos for Photo Essay. Provide navigation/back/search that work without JS whenever possible.
5. Add semantic SEO: unique title/descriptions, OG, canonical, Article/NewsArticle JSON-LD for actually published articles, sitemap, robots, RSS, image alt/captions, correct publish/modified dates. Make sure OAI-SearchBot is not needlessly blocked; never claim indexing guarantee.
6. Add accessible subtle motion including optional View Transitions and reduced-motion fallback only after static baseline is beautiful and functional. Defer complex Se-diyu 3D to explicit /symbol/ optional experience.
7. Add web manifest with original Se-diyu icon, home-screen styling and progressively enhanced local saved reading only after core publication is reliable. Push/auth/personalization are optional future work, not urgent.
8. Build tests and verify mobile Safari behavior where possible, or state coverage limitations truthfully. Performance: target LCP <=2.5s, INP <=200ms, CLS <=0.1 in field; treat optional JS <100KB as aspirational budget, not a guarantee.
9. Deploy a **new isolated V3 preview**, NOT production, when access permits. Provide preview URL, branch SHA, what changed, actual test results, known limitations; never claim deploy success if not verified.

## Delivery behavior for Codex
Work proactively and write code. Do not stop after planning or return a generic plan. Inspect repository first, choose sound implementation, implement in meaningful commits, and run appropriate checks. If blocked by a missing permission, complete all possible local work, push this branch, and report exact blocker. No destructive overwrite of production; no rewriting history or force pushing. Prioritize visible, useful quality over ornamental complexity. Put practical instructions in README/V3_STATUS.md for follow-up sessions.
