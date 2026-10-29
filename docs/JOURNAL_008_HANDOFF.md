# TOHEŞAR — THE FIRST ISSUE / BUILD 008

Branch: `feature/tohesar-first-issue-008`  
Exact baseline: `160d8f406a0f3307836aa1124a2758b730a9945a`  
Application / deployment source: `eb40133595dfce8d13c605a67bc93fdc94402cd3`

## Published review

- [Independent review](https://tohesar-issue-008-review.vercel.app/)
- [ISSUE 001 — THE SHAPE OF DESIRE](https://tohesar-issue-008-review.vercel.app/journal/issues/001/)
- [Giulia — 아름다움이 비율이 되는 순간](https://tohesar-issue-008-review.vercel.app/journal/design/giulia/)
- [The Proportion Study](https://tohesar-issue-008-review.vercel.app/journal/design/giulia/#proportion-study)
- [Issue Archive](https://tohesar-issue-008-review.vercel.app/journal/issues/)
- [Phone-size screenshots / review room](https://tohesar-issue-008-review.vercel.app/docs/issue-008-review/)

Project `tohesar-issue-008-review` / `prj_qL8JbCyu2FbRAc0y1BKA6qxBQHoJ`, team `team_PVgfk8zxTMeeUcglxP59fh17`. Deployment `dpl_2Manut9DYFXgoqeC6SRL5emefMve`, READY, about 6.5 seconds build. The stable review alias is the production environment **of this new isolated review project only**. No official domain is assigned. No existing project's deployment was promoted or replaced.

## Actual work

ISSUE 001 has an edition date (2026-10-29), editor's letter, freely selectable contents, five ordered editorial spreads, transitions and closing. Different compositions serve the 911 curve, F40 planes, Giulia proportion, Jaguar GT and original miniature graphics. Existing articles are linked rather than duplicated. The opening is a journal publication; COVER 004 remains the brand gateway.

Giulia is a substantial original Korean five-chapter essay, covering stance, surfaces, face, Italian design lineage and a critical conclusion. It separates verified manufacturer facts from visual interpretation, distinguishes 952 from the historical Giulia, and distinguishes early lamps from the 2023 update. Photo and model-identification limits are visible, not hidden.

The natural-scroll Proportion Study keeps a real side photograph unchanged while a moving observation aperture, bonnet/cabin/rear guide paths and five captions direct the eye. It is reversible, passive-scroll/rAF driven, without continuous animation, scroll capture, 3D or vehicle morphing. An unannotated static full frame, complete notes, reduced-motion, short-landscape and no-JS alternatives are available. Text and controls occupy their own reserved areas.

Issues are generated from `journal/data/issues.json`, including their chapter order, dates, status, visual and content IDs. `content-index.json` has **six** published editorial/art entries. Giulia uses the existing Curves classification; no artificial GT classification was added to the sedan. Nine news records remain a separate data source; Atlas joins them for **15** searchable records. All published indexed stories receive related links from the metadata. The existing 911 lead, Jaguar invitation, F40, Visual Culture, Atelier and all old news are retained.

Three newly verified news releases: Alfa Romeo sports-saloon heritage exhibition (21 October), Hyundai/RISD Motion Rewild (21 October), BMW/AFMAC/Zeitz MOCAA Art Car exhibition (15 October). Original release dates and registration dates are distinct. Original six news records retain every previous field and value, with operational metadata added.

## Next publication

See [ISSUE_008_PUBLISHING.md](ISSUE_008_PUBLISHING.md).

```sh
python3 scripts/publish.py new-issue 002 --title 'NEXT EDITION'
python3 scripts/publish.py new-story new-design-note --title '새로운 디자인 이야기'
python3 scripts/publish.py new-news manufacturer-topic-yyyymmdd
python3 scripts/publish.py check
python3 scripts/publish.py build
python3 scripts/publish.py preview --port 8000
```

The commands generate drafts and never promote status or deploy. Editors write and verify sources/rights, explicitly change status, build, inspect, commit and deploy to an isolated review. Article body-file authoring needs one manuscript and one metadata record; Atlas, related stories and common navigation rebuild from those records. No CMS, user accounts, crawler or external-key dependency was added. A second draft edition is exercised in disposable tests and never appears as a published edition.

## Verification

- Publication safety: six automated tests pass. Missing content references, duplicate source URLs and unverified news publication are rejected; drafts remain out of public listings; repeat builds are identical. Unpublishing an edition with remaining inbound references is blocked by link validation.
- 555 local destination/anchor checks across 11 active journal pages pass.
- Chromium 154 / Playwright WebKit 26.5: 54 focused route/viewport checks (320, 390, 430, 844 landscape, 1440 desktop), zero broken images, horizontal overflow or page errors.
- Cover → Journal → Issue → Giulia → related story → browser back; archive menu; Atlas query/form/refresh/history; five forward/reverse study scenes; static notes; no-JS and reduced motion pass.
- Existing 006 regression suite: 22 focused checks, including the original 911/F40/collection motions, reverse scroll, modal, navigation/history and reduced motion, pass. Only fixed news-count assertions were changed to derive expectations from the expanded data.
- Public HTTPS: the same 54 checks pass in both engines. Twenty deployed routes/assets/data files match the committed source byte for byte. See `issue-008-review/deployed/checks.json` and `deployment-result.json`.
- WebKit was run using a local launcher and extracted Debian libraries outside the repository. No browser/runtime dependency was added to the website.

## Preservation

75 baseline files were compared byte for byte: cover root/CSS/JS, original assets, original brand SVGs, COVER assets/fonts, Yokohama, original miniatures and existing car motion scripts. All original paragraph markup from 911, F40 and Type 01 remains present. Previous branches were not rewritten or force-pushed.

Remote checks: `main` remains `8e2960ec70254f83033d8a808c3ea0eacd6eceb6`; COVER 004 LIVE remains `24de81762bfa63f7281928df82b15d5daba0829b`; 007 remains `160d8f406a0f3307836aa1124a2758b730a9945a`. The canonical 007 review Journal HTML still matches its original deployed source `8d93d0f...` exactly. Official `tohesar.com` was not a deployment target.

## Sources, limits and remaining verification

See [ISSUE_008_SOURCES.md](ISSUE_008_SOURCES.md) and `journal/data/giulia-image-sources.json`. Vauxford's 2017 early Quadrifoglio photos use CC BY-SA 4.0; Owen.outdoors' side photo uses Pexels License. Original downloads are retained separately from optimized WebP files. Rights, credits, original links and transformations are visible in the article. No AI-generated Giulia imagery is used.

The Pexels source does not specify the exact side-photo model year or trim. Its early 952 exterior is observable; the article explicitly keeps the undocumented details unverified. It is not presented as the same trim/individual car as the 2017 Quadrifoglio. Exact production dates and measured geometry are not claimed. This provenance limitation remains; no invented specification was supplied to fill it.

Physical iPhone Safari, older iOS, battery/thermal behaviour and hardware performance remain untested. Mobile viewport/WebKit screenshots do not substitute for a physical-device claim. Automated news collection and the P2 backend/CMS features were outside this release. Core pages, interaction, static publishing, integration, push and independent deployment are delivered.

The final documentation-only commit records public verification and this handoff. The deployed application remains the exact source commit shown above. Obtain the branch's final HEAD with `git rev-parse HEAD`.
