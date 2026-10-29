# TOHEŞAR — ART DIRECTION 009

Branch: `feature/tohesar-art-direction-009`  
Exact baseline: `b7a5d0b22fd21d9264064b4ff4afb42658520132`  
Deployed application source: `8e5791fac28b97f203c87dd700707f4ada7cc1f5`

The final documentation commit records release evidence after deployment. Obtain final branch HEAD with `git rev-parse HEAD`. The review deployment stays pinned to the application source above.

## Review

- https://tohesar-art-009-review.vercel.app/
- https://tohesar-art-009-review.vercel.app/journal/issues/001/
- https://tohesar-art-009-review.vercel.app/journal/design/giulia/
- https://tohesar-art-009-review.vercel.app/journal/design/giulia/#proportion-study
- https://tohesar-art-009-review.vercel.app/docs/art-009-review/
- https://tohesar-art-009-review.vercel.app/journal/
- https://tohesar-art-009-review.vercel.app/journal/issues/

New project `tohesar-art-009-review` / `prj_XiOic9JMDsTjgENdwYVQkel5JJBM`, team `team_PVgfk8zxTMeeUcglxP59fh17`. Deployment `dpl_5gsapx3E2KhEhYV5GytYcQFjPBhm` is READY. Build took about 11.5 seconds. The stable alias is the production environment **of this isolated review project only**. No official domain or existing review project was used as a release target.

## Actual visual changes

The Issue jacket, 911 frame, F40 horizontal spread, Giulia proportion plate and Jaguar profile are recomposed. Miniature Atelier keeps its three-car arrangement. The closing echoes the continuity of the first plate. Giulia's article opens on side proportions; the study uses brighter paper, a wider photograph, lighter masking, fine observation marks and filled progress segments. Journal has a serif mast and wider 911 frontispiece; Archive presents the single real issue as a publication jacket.

[ART_009_VISUAL_AUDIT.md](ART_009_VISUAL_AUDIT.md) records the weaknesses, accepted changes and rejected crop. The review room offers twelve identical-size BEFORE/AFTER pairs in both engines; the ten required scenes plus the final and static scenes. BEFORE was rendered from an untouched worktree at the exact baseline, not recreated from memory. Each image is available at native 390 × 844. Additional 320, 430, iPad landscape 1180 × 820 and desktop 1440 × 1000 evidence is linked from the room.

## Validation

- Six publication safety tests pass: draft editions/stories excluded, bad references and duplicate/unverified sources rejected. No status changed.
- `publish.py check`, `build`, `preview` operate normally. Two builds produce identical generated page hashes; 557 local destinations/anchors pass.
- Chromium / Playwright WebKit: 54 route/viewport checks, menu, article navigation, Atlas search/filter/history, forward/reverse study, reduced motion and no-JS pass.
- Additional responsive captures: 80 checks in both engines, including five study positions at every size, with photo/caption/control bounds inside the viewport. No broken images or horizontal overflow.
- Existing 005–006 motion regression: 22 checks pass, including reverse motion, navigation/history, modal, reduced motion and no-JS.
- Review room: twelve pairs, both engine buttons, decoded images and mobile overflow check pass.
- Public HTTPS: the same 54 checks pass. Thirteen core HTML, CSS, JS, data and review-image responses match committed bytes. See `art-009-review/deployed/`.

## Preservation

95 protected cover/brand/image/miniature/motion/data files are byte-identical to 008. All 36 original Giulia paragraphs remain present. Original 911, F40 and Type 01 manuscripts were not edited. Image rights and credits stay visible; the manufacturer's profile image uses the existing JLR source and licence. Giulia's hero credit now identifies the actual Pexels profile, with the exact model-year/trim limitation retained.

`content-index.json`, `issues.json`, `news.json` and all image-source data are unchanged. No fictitious Issue 002, CMS, backend or new runtime framework was added. Changes to generated Issue/Archive/Giulia pages live in the generator/template sources and `art009.css`. Rebuilding retains the design. COVER 004 and its assets/animations are untouched.

Remote main remains `8e2960ec70254f83033d8a808c3ea0eacd6eceb6`; 008 remains `b7a5d0b22fd21d9264064b4ff4afb42658520132`. The old 008 stable Issue page was fetched and matched the baseline byte for byte. No force push, branch overwrite, official-domain change or production-site release occurred.

## Remaining limits

Physical iPhone Safari, older iOS and hardware battery/thermal performance remain untested. All phone/iPad labels describe rendering viewports, not physical-device tests. The Pexels side photograph's exact model year and trim remain unknown. Observation guides are not measured geometry. Existing 911 visual fiction is still disclosed; no new AI car images or background replacements were made. Core commissioned implementation, review, branch push and isolated deployment are complete.
