# TOHEŞAR — THE WALLPAPER UNIVERSE / BUILD 011

Branch: `feature/tohesar-wallpaper-universe-011`.
Exact parent baseline: `72132f0dc50de7cec35cc89e7ee99b0c67c64b44`.
Application / deployment source: `ef9e2db626e25ae585b76395297b75b430bd0b49`.
The final documentation/tool-only commit records public verification after release;
obtain its HEAD with `git rev-parse HEAD`. The deployed application remains pinned
to the source above. No existing review or official site was a deployment target.

## Open the result

- Independent project: https://tohesar-wallpaper-011-review.vercel.app/
- Actual 911: https://tohesar-wallpaper-011-review.vercel.app/journal/911/#wallpaper-living
- Before/after, density, motion, artwork and device-size evidence:
  https://tohesar-wallpaper-011-review.vercel.app/docs/wallpaper-011-review/
- Issue: `/journal/issues/001/#wallpaper-issue-curve`
- Giulia: `/journal/design/giulia/#wallpaper-giulia-stance`
- F40: `/journal/f40/#wallpaper-planes`

The result is an editorial background, not a new miniature exhibition. The
opening and first chapter, second chapter, and ending chapters of the existing
911 essay carry several small cars on their paper. Korean paragraphs, original
photography, sources and continuation links remain. A feathered paper reading
layer subdues motifs behind words without placing the article in cards.

Eight new forms: Lilac Arc (round coupe), Coral Blade (wedge), Sage Longtail
(classic GT), Blue Hour (saloon), Butter Club (hatch), Rose Current (sports
coupe), Tomato Open (roadster), Mint Tour (wagon). Source sheet and eight cell
PNGs: `creative/wallpaper-universe-011/originals/`. Production/provenance:
`creative/wallpaper-universe-011/PRODUCTION.md`. Web assets:
`journal/assets/wallpaper/`. These are new AI-assisted illustrations, not
recoloured duplicates, photo cutouts, icons, or exact vehicle diagrams.

## System and motion

- `journal/data/wallpaper-artworks.json`: IDs, names, paths, dimensions, palettes,
  production metadata and responsive image variants.
- `journal/data/wallpaper-layouts.json`: authored coordinates, size, angle,
  direction, opacity and motion. Arc, Drift, Blade and Touring layouts differ.
- `scripts/build_wallpaper.py`: renders static accessible decorative markup and
  wraps the existing manuscripts idempotently. No runtime data fetch is needed.
- `journal/assets/wallpaper011.css`: paper/art/reading layers, mobile composition,
  wide sizing and feathered text protection. Art is inert and pointer-transparent.
- `journal/assets/wallpaper011.js`: native scroll to deterministic transforms,
  bounded shifts (up to ±14px horizontal / ±8px vertical), subtle rotation,
  some permanently static motifs; passive events, scheduled rAF, no idle loop.
  Same scroll position restores the same state; reduced motion clears movement.
- `scripts/optimize_wallpaper_011.cjs`: responsive derivatives from preserved PNGs.

ISSUE 001 uses wallpaper in the Curve and Small chapters through
`build_issues.py`, keeping F40, Giulia and Type 01's other spreads intact.
Giulia's Stance and Surfaces prose use Touring through `build_giulia.py`; the
unchanged body template and exact side-photo study remain independent. F40's
opening chapters use Blade. Shared style does not mean identical placements.
`publish.py build` runs all sources in order and retains the work.

The 010 Passage partial, original cars and path source are preserved. Its
prominent 911/Issue insertions are removed; the Atelier has a closed
`010 ARCHIVE / Miniature Passage` disclosure. Opening it remeasures the original
motion. The older 006 in-article form studies remain as existing functionality.

## Review and reproduction

Read `WALLPAPER_011_VISUAL_AUDIT.md` for actual observations, revisions, density
choice, all ten required evidence paths and limitations.

```sh
python3 scripts/publish.py check
python3 scripts/publish.py build
python3 scripts/publish.py preview --port 8000
# Serve the untouched baseline worktree on 8001 for real before/after.
node scripts/review_wallpaper_011.cjs
python3 -m unittest discover -s scripts -p test_publishing_008.py -v
```

The browser tools are development-only. In this container WebKit requires a
local launcher at `/workspace/webkit-libs/launch-webkit` with extracted system
libraries; set `WEBKIT_EXECUTABLE_PATH` accordingly. No such launcher is shipped
to the website. Review captures and regression receipts name both engines and
all six commissioned sizes. Hardware iPhone/iPad Safari remains untested;
older iOS, real toolbar/touch behaviour and thermal performance remain limits.

## Isolated release and public verification

Project `tohesar-wallpaper-011-review` / `prj_wAwdQVXwmF87kKdzCfzaO87J77Wc`,
team `team_PVgfk8zxTMeeUcglxP59fh17`. Deployment
`dpl_3kLHjqdmACrrZQj7dNV7wM98eoiX`, READY, approximately 7.6-second build.
The stable alias is the production environment of this new review project only.
No official domain or existing review project was assigned or replaced.

The public 911, Issue, Giulia and F40 pages were rendered in both Chromium and
WebKit with a mobile viewport. Actual prose and several background cars appear
together. Phone and iPad landscape screenshots are in
`wallpaper-011-review/deployed/`; these live captures were opened and inspected.
Forward/reverse motion and live reduced-motion clearing also pass over public
HTTPS. `deployed/source-verification.json` compares live article HTML, CSS, JS,
artwork variants, data and review pages byte for byte with the pinned source.
The old 010 deployed 911 remains byte-identical to its original deployed SHA.
`protected-branches.json` confirms all pre-existing remote branch heads unchanged.

`deployment-result.json` records the exact target, source and alias. The public
review room already contains the source-backed visual comparisons; the later
live verification receipts and handoff are committed without redeploying or
changing the pinned application.
