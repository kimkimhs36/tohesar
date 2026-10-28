# TOHEŞAR — Visual Culture 006

Branch: `feature/tohesar-visual-world-006`  
Exact baseline: `acbb362e19661fb3333b160c936271aa5cec46d7`

## Delivered

- `/journal/visual/`: independent art-directed opening, asymmetric photographic sequence, wide panorama, native image enlargement, three-car scroll composition and related stories. Every Yokohama image is identified as AI-assisted visual fiction.
- `/journal/miniatures/`: Miniature Atelier with three large illustrations, distinct colour grounds, form notes, scroll composition and real article links.
- `/journal/f40/#air-study`: new horizontal planes/openings/wing scene, directly driven by reversible scroll progress. Original F40 prose, source and licensed photo retained. Generic coral wedge is explicitly identified as an illustration, not an exact F40 diagram.
- `/journal/911/#miniature`: existing 005 motion engine, original artwork and behaviour preserved. Only shared navigation and related culture links were added to the article HTML.
- Shared native `details` Index exposes Journal, Design, News, Visual Culture and Miniatures. A static build helper renders one navigation partial across six active journal pages. Regular links preserve browser history; no SPA/router migration.
- Three newly verified official announcements: Hyundai ELANTRA N MONOCHROME (19 October), Genesis / Danh Vo Met commission (15 October), MINI Countryman Untamed (6 October). Six records in the archive. Compact homepage chooses one record per manufacturer; JSON remains the source of truth and the existing static generator is extended rather than replaced. Jaguar's individual release returned 404 and was excluded.

## Artwork

005 original source and WebP remain unchanged. New full-resolution transparent PNGs:

- `creative/visual-world-006/wedge-source.png` — 2042 × 770
- `creative/visual-world-006/gt-source.png` — 2098 × 749

Fine contours, smoked glass, silver wheels and pearl highlights follow the existing lilac coupe. All three have 1200px transparent WebP display derivatives in `journal/assets/miniatures/` (about 98–107 KiB each). The existing 005 WebP remains in place for the original 911 scene. New artwork is AI-assisted and is not represented as a manufacturer collaboration or measured model drawing.

## Motion and accessibility

New shared `visual-motion.js` reuses 005's passive scroll / scheduled requestAnimationFrame / measured progress approach. F40 has a horizontal traverse with a small final rise and drawing air/wing lines; the collection uses three independent translations, opposing rotations and one reversed direction. No scroll interception, physics loop, 3D or animation package. The original 911 engine is untouched.

`prefers-reduced-motion` and short landscape viewports receive static plates, all F40 captions and ordinary links. Geometry refreshes on resize, font readiness and pageshow. Plates reserve their own space, keeping text and controls clear. Native dialog provides image enlargement with Escape, focus restoration and a visible close control.

## Verification and review

Review room: `/docs/visual-006-review/`.

- Chromium and Playwright WebKit 26.5; seven primary routes at 390 × 844 and both new spaces at 320 × 667 and 1440 × 1000 (22 focused route/viewport checks).
- No horizontal overflow or broken images. Reversible 911, F40 and three-car scroll poses; mobile landscape fallback; menu/history/direct URL/reload; reduced motion; no-JS navigation and static captions; native image enlargement.
- 390 × 844 COVER 004 screenshots at the beginning and end of its scroll compare byte-identical to the exact 005 baseline. See `cover-comparison.json`.
- `checks.json` and `news-verification.json` hold inspection results. Review screenshots include the journal, opening and middle Visual Culture pages, F40, Atelier, collection, desktop and reduced-motion states.
- This host uses locally extracted WebKit dependencies and a launcher supplied via `WEBKIT_EXECUTABLE_PATH`; no browser or runtime packages were added to the website.
- Actual physical iPhone Safari, battery/thermal behaviour and older iOS versions were not tested. Engine emulation is not a physical-device claim.

## Preservation

Root HTML, COVER 004 assets/CSS/JS, original brand SVGs, root photographs, Yokohama, legacy journal, original 005 miniature PNG/WebP and its motion JS are byte-for-byte unchanged from the baseline. No force push. Only the new 006 branch is updated. `main`, both named COVER branches and 005 retain their original remote heads. Official `tohesar.com` is not a deployment target.

## Isolated release

New project: `tohesar-visual-006-review` / `prj_yzNn38Aq8jjPtUfA9sOVBXIqaW4P`, team `teambkit`. Release URL and exact source commit are recorded after deployment in `visual-006-review/deployment-result.json`.

## Remaining limits

No core commissioned page or illustration is intentionally left as a placeholder. News remains a manually verified snapshot, not automatic collection or a live feed. No account/CMS/store/backend work was added. Original high-resolution artwork is raster PNG, not an editable vector master.
