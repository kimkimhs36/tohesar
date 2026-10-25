# V3 implementation and V2.4 audit

## Baseline and isolation

- Started from the requested branch at `70ccdb1754c82acddace5626e711f516d8f16521`, containing the approved brief, based on experimental V2.4 `fb7faaa83a95ff322921ea3f266b302405e81efc`.
- V2.4 had four manually duplicated HTML articles, `story-data.json`, `site.js`, and successive `style.css`, `art23.css`, `iphone-editorial.css`, `press24.css` overlays. Home and article imagery/bylines/alt text diverged; several related links used different images than the leads.
- Main was `0e5607d8069c09e2082b738ce032e830dc4e0660` when work began. No checkout edits, commits, force pushes, aliases, or deployments target main, tohesar.com, V2.x projects, or BKIT.
- Original V2.4 root files remain in Git for provenance but are not inputs to Astro's `dist/`. The old Renault article and old JavaScript cannot be reached in the V3 build. No existing files were deleted.
- Only `assets/wordmark.svg`, `assets/cedilla-icon.svg`, `assets/cedilla-favicon.svg` were retrieved read-only from main. Their vectors are preserved under `public/identity/`; CSS renders the original light wordmark in ink. No Memory Alloy or old abstract object is imported.

## Application structure

Astro 5 static generation; no SPA/router runtime or database. Every article, listing and subject has semantic, complete HTML. Native cross-document View Transitions name only the F40 lead/hero, with ordinary navigation and reduced-motion fallbacks. No scroll hijacking, forced intro, or animation framework.

- `src/content/articles/*.json`: typed source of truth, including complete body, workflow state and corrections.
- `src/lib/schema.ts`: strict content formats and subjects; publication checks.
- `content-assets.json`, `docs/evidence/*`: image author, owner, license, attribution, source, usage, changes and verification evidence.
- `src/lib/publication.ts`: visibility and image rights/expiry gate.
- `src/layouts`, `src/components`: shared masthead, footer, credits, image pipeline and text rows.
- `src/styles/global.css`: Warm Press tokens, local fonts, iPhone-first reading, iPad/desktop columns, print and reduced motion.
- `src/lib/reader.ts`: local saved links, bounded text sizing, photo dialog, sharing and progress. None are required to read articles.
- `src/lib/search.ts`: local full-text search; multi-term, NFKC/case normalization, subject and format filters, query-string restoration, empty/error states. Text is rendered without innerHTML.
- `src/pages/{rss.xml,sitemap.xml,robots.txt}.ts`: publication infrastructure; fixtures never become feed entries or Article JSON-LD.

## Content integrity

F40, 911 and 916 are **review fixtures**, not published journalism. No invented writers or publication dates. Existing manufacturer source links remain marked pending; this run verifies image license pages, not all factual claims in the essays. The Renault 2026 claim is excluded rather than repeated as news. Unrepresented subjects and photo/film sections explain that nothing is published yet.

Local photographs are real. Rights evidence records source-page excerpts and SHA256 of the retrieved HTML. Full image proportions are retained; only format and resolution change. Captions correct V2.4's conflicting location/image descriptions. CC BY-SA remains applicable to the F40 photo, not the entire site.

## Operating constraints

This run is a publication foundation and working preview, with a file-based review workflow. No authenticated CMS, automatic reporting, push notifications, account sync, offline article cache, or fabricated catalog. A web manifest and original identity icons support home-screen use; no service worker is installed. These distinctions must remain explicit in future reporting.

The default build is an unpublished preview (`noindex`). `PUBLICATION_MODE=published` enables only cleared published records, but it is **not authorization to deploy to production**. Production also requires reviewing the preview-specific HTTP noindex header, canonical base and project target. This run does not change them.
