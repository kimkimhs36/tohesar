# TOHEŞAR 013 — actual visual audit

All evidence is an actual browser render. The baseline is untouched 011 (`fb3e7a6a8ca689b43fd4f780eca5b4dc1a455970`), served independently from a detached worktree. No photographic asset was generated for this build.

## Observations and revisions

The existing Yokohama began with a large English serif masthead, beige paper and generous inter-chapter spacing. The new opening gives the full 850×1050 portrait room beside a restrained title and Korean deck; the phone stacks that composition without cropping the car. The SVG wordmark was initially too pale on lilac paper. Its original file remains intact; a page-specific CSS filter now prints it in dark ink.

Arrival lets the bridge's long horizontal line and the short roof curve coexist at the original photographic ratio. Blue Hour changes to a deep blue paper with clear captions. The following paper picks up the photograph's blue and moves toward lilac. Actual Korean paragraphs occupy that same paper as small illustrated cars; no miniature showcase replaces the story. The first render reused the complete Drift palette. Yellow/red cars interrupted the blue-hour relationship, so the new City layout selects five existing forms in lilac, blue, rose and sage. Original layouts remain unchanged. The first upper blue car crossed a chapter label; its authored position was moved above that label.

The interior image changes scale within the wallpaper chapter. A feathered paper area protects its adjacent copy without a visible card. The entire 1428×532 Afterglow photograph remains visible, followed by a taller departure image and a direct 911 continuation. Phone Journal discovery is a compact image/copy spread with a visible reading link. These opening, prose, transition, Journal and landscape-tablet screenshots were opened and visually inspected.

## Evidence

Open `editorial-013-review/index.html` for before/after, photographic composition, actual prose/wallpaper, photo-to-paper and paper-to-photo joins, start/middle/end scroll poses, Journal discovery, iPad landscape and desktop. All original-resolution captures are linked individually. `checks.json` records both engine versions, all five commissioned sizes, responsive overflow, loaded images, reverse scroll, reduced motion, no-JS, route health and Journal→Yokohama→911→Back navigation. `final-composition-checks.json` records the final authored car placement and orientation-resize checks.

## Publishing and preservation

`publish.py check/build` pass. Existing publication-safety tests pass, including second-build idempotence, unpublished drafts and invalid source rejection. `preservation.json` checks 137 pre-existing image/font/brand/data/motion/template files and existing article prose against 011. The original Yokohama document is byte-identical in `journal/partials/yokohama-001-original.html`; its generated archive adds only a base URL so its original relative resources continue to resolve. All four existing wallpaper layout arrays remain unchanged.

## Limits

These are Chromium and Playwright WebKit viewport tests, not physical iPhone or iPad Safari tests. Real Safari toolbar/touch dynamics, older iOS, heat and battery use remain unverified. The original 012 brief was unavailable; the preserved 012 commit implements the living-magazine core inferable from the supplied 013 brief, without claiming unknown acceptance criteria were checked. AI imagery is disclosed in the opening, captions and colophon. Existing 911/F40/Giulia/Type01 prose and distinct image credits remain intact.
