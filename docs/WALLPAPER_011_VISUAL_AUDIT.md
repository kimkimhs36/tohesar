# TOHEŞAR — Wallpaper Universe 011 / visual audit

The acceptance image is an actual Korean paragraph with many small illustrated
cars behind it. The 010 Passage is never used as evidence of the new wallpaper.
The public review lives at `/docs/wallpaper-011-review/`.

## Static beauty and editorial integration

The untouched BEFORE worktree is commit
`72132f0dc50de7cec35cc89e7ee99b0c67c64b44`, served on port 8001. AFTER is the
011 branch on port 8000. Screenshots are native browser renders with decoded
images and fonts. They are not composited article mockups.

The new collection was inspected on warm paper. Eight genuinely different body
forms share plum contours, shaded pastel bodies, blue glass and silver wheels.
The transparent generation is preserved, separately from cell PNGs and WebPs.
The existing 006 illustrations are not passed off as the new collection.

The first 390px article composition was opened and rejected in part: too many
edge cars were heavily clipped; some central forms disappeared behind headings.
Coordinates moved inward and the living chapter's paragraph breaths were widened.
The original screenshots remain as `first-opening.png` and `first-living.png`.
Cars in the reading line recede behind feathered paper; edge and inter-paragraph
cars remain legible. There are no bordered or rounded text cards.

Actual low, medium and rich 390px trials are `density-low.webp`,
`density-medium.webp`, `density-rich.webp`. LOW lost the immediate wallpaper
impression. RICH made cars heavier than the reading rhythm. MEDIUM retains a
mixture of complete forms, cropped edge forms and pale motifs behind the text.
The selected static living scene contains real, unchanged Korean prose. This
judgment is visual, not a car-count threshold or an automatic aesthetic score.

The first iPad trial used cars up to 190px and crowded the right margin. The
final wide layout caps them at 150px. Issue link and transition labels needed
more paper protection; their feathered backgrounds were added after opening
actual Issue renders. Giulia's touring variation is quieter and green; F40's
blade variation uses warm paper, sharper poses and a different motif sequence.
The actual Giulia study photograph/guides are outside the wallpaper wrappers.

Opened the final phone opening, living chapter, motion midpoint, 320px WebKit
opening, iPad landscape opening/living, F40, Giulia and Issue renders. The
manuscript and cars are visibly on the same paper. All commissioned viewport
captures remain in the review directory. No article was replaced by a gallery.

## Engine refinement and motion

Small rotated 600px images downsampled roughly in this container's WebKit WPE
software renderer. Compared original PNG, large WebP, layer/opacity alternatives
and a small derivative. Responsive 240/480px exports made the actual WebKit
article render smoother, so these were shipped with `srcset`. The source sheet
and primary artwork were preserved. WebKit and Chromium still differ in font
metrics and edge sampling; neither is claimed to reproduce physical iOS exactly.

Motion was added to the complete static composition: scroll determines a bounded
signed progress, small horizontal shifts, gentle sine vertical shifts and at
most two degrees of extra rotation. Roughly one third of the motifs are static.
No autonomous driving, repeated random motion, path diagram, sticky wallpaper
stage or scroll interception. Passive listeners schedule one animation frame
when needed; there is no permanent loop or blanket `will-change` allocation.
The forward/middle/end/reverse receipts in `checks.json` show identical poses at
identical scroll positions. Live reduced-motion changes remove inline transforms.
No-JS keeps all images and text because the layout is generated into the HTML.

## Required evidence

All paths below are relative to `docs/wallpaper-011-review/`:

1. Actual 010 article: `chromium-390-before.webp`.
2. Same opening paragraph after: `chromium-390-opening.webp`.
3. Multiple cars on phone paper: `chromium-390-living-static.webp`.
4. Real Korean prose plus wallpaper: same image; also `webkit-390-living-static.webp`.
5. Scroll start: `chromium-390-motion-start.webp`.
6. Scroll middle: `chromium-390-motion-middle.webp`.
7. Scroll later: `chromium-390-motion-end.webp`; reverse is separate.
8. iPad landscape: `chromium-1180-opening.webp` and `webkit-1180-living-static.webp`.
9. Eight originals: the review's collection, linking to each preserved PNG and sheet.
10. Actual old Passage versus new article: the review's fifth comparison pair,
    `chromium-390-old-passage.webp` versus `chromium-390-living-static.webp`.

The review also provides 320×667, 390×844, 430×932, 820×1180, 1180×820 and
1440×900, both engines, reduced-motion, no-JS, and orientation-change captures.
Each screenshot opens at its native dimensions. `checks.json` records viewport,
route, browser version, scroll position, real manuscript visibility and geometry.

## Regression and preservation

The old 911/F40/Type 01 motions, Atelier collection, image dialog, Index menu,
news filter, Atlas search/history, related links and Issue navigation were
exercised using the existing 006/008 suites in both engines. Existing test
scripts were not weakened. Regression receipts are in `regression/`.
`preservation.json` compares every previously committed image/font/brand asset,
content/news/Issue data, Giulia body template, and verbatim 911/F40 manuscript
paragraphs against the exact baseline. The only change to the existing Passage
motion handles opening/closing its preserved archive. The old partial is intact.

`publish.py check/build/preview` remain available. A second build is byte-identical
(`publishing.json`), and publication-safety tests still keep drafts unpublished.
The wallpaper comes from the generator and data, not a temporary generated-HTML
patch. No runtime framework or package installation is required by the website.

## Limits

These are Chromium and Playwright WebKit viewport tests, not physical iPhone or
iPad Safari tests. Real Safari toolbar animation, older iOS, touch momentum,
battery/thermal behaviour and print/merchandise suitability remain unverified.
The artwork is AI-assisted and not a measured drawing or manufacturer product.
The final visual judgment remains available through actual article links and
screenshots; a test pass is not presented as proof of aesthetic quality.
