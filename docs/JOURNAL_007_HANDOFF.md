# TOHEŞAR — Design Atlas 007

Branch: `feature/tohesar-design-atlas-007`  
Base: latest 006 HEAD `c8725c19c3ed70a5a13eb6b605254df256cd0e89`

## Delivered experience

- `/journal/design/`: independent warm-paper Design Atlas. Licensed Jaguar featured photography, working form filters, name/topic search, asymmetrical story compositions, four-point design chronology and Visual Culture continuation.
- `/journal/design/type-01/`: original Korean five-chapter design editorial on the 2026 four-door electric GT. Long bonnet / front overhang distinction, low roof and body/glass hierarchy, Jaguar lineage, concept-to-production translation, material language and a balanced conclusion. Five primary sources and conditional image-use information are visible in the article.
- `/journal/design/type-01/#design-study`: Type 00 × Type 01 inspection scene. Natural scroll directly moves independent observation windows from the long front section to the cabin and then opens to the whole body. Distinct model/date/status labels and full original photo frames remain visible throughout. No warping, mirroring, scale-registration claim, opacity-only transition, wheel animation, scroll capture, WebGL or framework.
- `/journal/design/type-01/#comparison`: always-available static comparison, three interpretive notes and full-frame image links. Readers can skip motion entirely. Reduced motion / short landscape viewports use the complete static study and all captions.
- Journal keeps the original 911 lead, F40, six news records, Visual Culture and Atelier, and gains an additional Atlas / Type 01 invitation. The shared Index links to the new independent Design path on all eight active journal pages. Existing articles gain only discovery links, navigation and one source anchor; their original prose is retained.

## Static content publishing

`journal/data/content-index.json` holds the five editorial / art entries, four form definitions and optional intentional news-form annotations. `journal/data/news.json` remains unchanged, with six published records. `scripts/build_design_atlas.py` joins those sources, renders eleven static real links and an embedded search index, and generates the commissioned article's related links. News links have stable archive anchors, preserved by the existing news builder. No live fetch or external search dependency is required. JavaScript-disabled readers keep all eleven articles and links.

Search handles Porsche, Ferrari, Jaguar, 911, F40, Type 01, 곡선 and GT. Unicode/case/spacing normalization, intersecting form + query matching, friendly empty state, result counts, keyboard submit, mobile controls and reset are implemented. Typing previews results; submit/change/filter actions commit the state to `q` / `form` URL parameters. Direct URLs, refresh, browser history and back-forward restoration are verified.

Publication instructions: `docs/DESIGN_007_PUBLISHING.md`. Run `python3 scripts/build_design_atlas.py` after editing metadata. The existing navigation and news helpers remain reusable.

## Sources and photography

Fact / permission notes: `docs/DESIGN_007_SOURCES.md`. Image-level original URLs, dimensions, hashes, credit and conditions: `journal/data/design-image-sources.json`.

Type 00: official announcement dated 3 December 2024, design vision concept at Miami Art Week. Type 01: New York reveal 6 October 2026, JLR / Jaguar releases dated 7 October, four-door electric GT, production to begin in 2027. Early-2027 orders and second-half-2027 first deliveries are plans. The 2024 release's late-2025 reveal plan and technical targets are not restated as current Type 01 facts.

Six photos are sourced from the two official Jaguar individual media releases and hosted as responsive WebP derivatives under the JLR User Licence for independent non-commercial editorial use. All photo uses link to the original source and licence, disclose resize / conversion and avoid implied endorsement. Manufacturer claims and TOHEŞAR's independent observations are distinguished. New AI-generated vehicle imagery is not used. Original 911 / Yokohama visual fiction and Atelier artwork remain clearly identified.

## Verified

Review room: https://tohesar-design-007-review.vercel.app/docs/design-007-review/

- Chromium and Playwright WebKit 26.5. 34 route / viewport checks across both engines: all nine core routes at 390 × 844; the two new routes at 320 × 667, 430 × 932, 1440 × 1000 and 844 × 390.
- Real search terms and metadata-derived filter counts, empty results, query URL / refresh / history, cover → journal → Atlas → Type 01 → 911 journey, reverse scroll returning to the same progress/pose, static comparison, controls fitting the board, no-JS and reduced motion.
- Existing 006 verification also passes in both engines: 22 route / viewport checks plus reversible original 911, F40 and collection motion, modal image enlargement, news filters and native links.
- 92 local links / anchors inspected; no missing destinations. New and preserved routes have no broken images or horizontal overflow in the checked viewports.
- Public HTTPS: ten routes HTTP 200; HTML, CSS, scripts and representative comparison photos match the committed source byte-for-byte. Both browser journeys, query/history/reload and reverse scrolling pass without page errors. Deployed phone screenshots are committed with the release evidence.

The public HTTPS review exposed Chromium native document-transition cancellation rejections. For this branch, the shared travel CSS uses the existing deterministic veil instead of automatic native document transitions. Regular links/history, page transitions and reduced motion remain functional. Original cover layout, assets and scroll are untouched; 006 itself keeps its original code.

Evidence: `docs/design-007-review/checks.json`, `regression-006/checks.json`, `preservation.json`, `deployment-result.json`. Browser scripts are development tools, not website dependencies. This host needed local WebKit libraries and a launcher outside the repository.

## Preservation

COVER root HTML, original cover CSS/JS, brand SVGs, original photographs, Yokohama, original miniatures and all 005/006 car motion files remain byte-for-byte unchanged from 006. All original main article paragraph text for 911 and F40 is unchanged. Existing news JSON is unchanged. No force push or protected-branch changes.

Verified remote heads:

- `main`: `8e2960ec70254f83033d8a808c3ea0eacd6eceb6`
- COVER 004 LIVE: `24de81762bfa63f7281928df82b15d5daba0829b`
- 005: `acbb362e19661fb3333b160c936271aa5cec46d7`
- 006: `c8725c19c3ed70a5a13eb6b605254df256cd0e89`

Official `tohesar.com` and existing review projects were not deployment targets. Existing 006 preview remains at `dpl_HqVoDZs7GL1sW41jouYwrap2KpQN`, source `4c5fdfb60018bc52533566d2dee60e5e1384d761`.

## Isolated release — READY

- Project: `tohesar-design-007-review` / `prj_ui4TOGg6qKVHuKoL8OLF3ZAakZIn`, team `teambkit`.
- Public review: https://tohesar-design-007-review.vercel.app/
- Design Atlas: https://tohesar-design-007-review.vercel.app/journal/design/
- Editorial: https://tohesar-design-007-review.vercel.app/journal/design/type-01/
- Deployment: `dpl_9Zm8qbT53hTFUF59UaCUma6iGiAq`, READY, static HTML/CSS/JS, approximately 3.8-second build.
- Exact deployed source: `8d93d0f73edb65e26a822ec7e3f72e5770aa41db`.
- Environment: production of the **new isolated review project only**; no official domain was assigned or changed.

The final documentation-only branch commit adds this completed handoff, public verification JSON and deployed screenshots. The deployed application source stays at the exact commit above; obtain final branch HEAD with `git rev-parse HEAD`.

## Remaining limits

No commissioned P0 feature is intentionally a placeholder. Actual physical iPhone Safari, old iOS releases, battery and thermal behaviour have not been tested; WebKit/mobile-viewport testing is not a real-device claim. Future production delivery plans may change. News remains the existing manually curated six-record snapshot; no automatic collector, CMS, account, storefront or backend was added.
