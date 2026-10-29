# TOHEŞAR — Editorial World 013

011 baseline: `fb3e7a6a8ca689b43fd4f780eca5b4dc1a455970`.
Recovered 012 parent: `5939e5071d18630666246873513ef68b34b73ac8`.
Branch: `feature/tohesar-editorial-world-013`.

No local prior work or remote 012 branch existed. The original 012 brief was not present. The photo/wallpaper continuity core requested in the 013 instructions was implemented and pushed independently as 012, with that limitation explicitly recorded in `LIVING_MAGAZINE_012_HANDOFF.md`.

The Yokohama route is an AI-assisted visual essay, never field reporting. Existing source imagery and the previous Yokohama document are preserved. The city and car are read through five chapters, full photographic forms, Korean prose and illustrated wallpaper on the article paper. Existing 011 artwork and deterministic native-scroll motion are reused. Decorative images never intercept input. No automatic racing or scroll hijack is introduced.

The independent review project is `tohesar-editorial-013-review` (`prj_l1tqUAaOtHhn58kfi62Gpar03nao`) in team `team_PVgfk8zxTMeeUcglxP59fh17`. No official domain, main branch, prior experiment branch or previous review project is a deployment target.

Journal, Visual Culture, 911 related content and ISSUE 001 connect to `/journal/yokohama/`. The content index records its AI production character. The publishing pipeline builds the Yokohama source before regenerating content links, then adds source-managed editorial invitations.

Reproduce: `python3 scripts/publish.py check`, `python3 scripts/publish.py build`, `python3 scripts/publish.py preview --port 8000`. Actual baseline captures and browser receipts live in `editorial-013-review/`. Browser viewport emulation is not physical iPhone/iPad hardware verification. Hardware Safari, real-device heat/battery performance and older iOS remain unverified. Consult capture receipts for the exact engines and sizes actually completed.


## Source and isolated release

Application/deployment source: `59f6b847e3d6818ff00e1a13749efabf86fe40ad`.
Deployment: `dpl_4qXJGfqS6AJBsXDyGHoHFUhkbc4R`, READY. It is the first deployment of the new independent review project; Vercel assigns that project's production environment. No official site or prior review is linked to this project.

- Review: https://tohesar-editorial-013-review.vercel.app/
- Essay: https://tohesar-editorial-013-review.vercel.app/journal/yokohama/
- Actual article wallpaper: https://tohesar-editorial-013-review.vercel.app/journal/yokohama/#wallpaper-yokohama-city
- Before/after and device captures: https://tohesar-editorial-013-review.vercel.app/docs/editorial-013-review/
- Original preserved essay: `/journal/yokohama/original-001/`.

The final documentation commit records public verification without redeploying the application. Obtain that final HEAD with `git rev-parse HEAD`; it intentionally differs from the pinned deployment source above.

## Continue editing

- `journal/partials/yokohama013.html`: the five photographic chapters, Korean essay, credits and related reading.
- `journal/partials/yokohama013-wallpaper.html`: chapter 03 prose and interior composition.
- `journal/assets/yokohama013.css`: city-specific typography, photo scales and blue/lilac/peach paper.
- `journal/data/wallpaper-layouts.json` → `city`: five selected existing forms; all original layout arrays preserved.
- `scripts/build_yokohama.py`: renders the essay and original archive; reuses `build_wallpaper.scene`.
- `scripts/build_editorial_world.py` and `world013.css`: source-managed Journal, Visual Culture and Issue invitations.
- `scripts/review_editorial_013.py`: real browser captures and focused functional checks. Development-only Playwright; set `WEBKIT_EXECUTABLE_PATH` if the host needs a library launcher.

Do not replace or delete the preserved original, regenerate the artwork without a reason, or introduce scroll interception. Core 013 has been implemented; additional P2 editorial extensions have not been pursued.


## Public verification

`editorial-013-review/deployed/source-verification.json` confirms 13 public source files match the pinned application byte for byte. `deployed/checks.json` confirms actual Chromium and WebKit 390×844 and 1180×820 public renders, forward/reverse scroll, reduced-motion clearing, no broken images and no horizontal overflow. Public phone prose and landscape-tablet screenshots were opened and inspected. `scripts/verify_editorial_013_deployment.py` reproduces that check from the matching application checkout.

All commissioned local viewport sizes and core routes are recorded in `checks.json`. Physical iPhone/iPad and the original missing 012 brief remain the explicit verification limits. The complete before/after review is already deployed; the later live receipts are preserved in GitHub without changing the application's deployment.
