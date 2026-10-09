# TOHEŞAR site deployment / triage (2026-10-09)

## What was observable
- Current production `main/index.html` immediately redirects all root visits to `/crash-week/`, so there is no separate TOHEŞAR homepage.
- `CNAME` in `main` contains exactly `tohesar.com`.
- `/crash-week/` remains a separate utility project and should not be the brand homepage.
- From this execution environment both the custom domain and github.io URL could not be reached. Network/DNS resolution is restricted here, so this does **not** independently establish that the domain is down for visitors.
- The authorized remote desktop computer TEAM-BKIT is offline; direct browser inspection there was not possible.

## Safe changes prepared on this branch
- Replaces the root redirect with a standalone TOHEŞAR homepage.
- Adds `feature/type-01.html` as a separate editorial and preserves `/crash-week/` under its own path.
- Preserves `CNAME` and all current production utilities.
- Uses relative links and no framework/build step.
- No unlicensed third-party photos or pretend-final logo artwork is embedded.

## Before publishing
1. Review the proposed design and text. It is a working art-directed draft, **not** yet approved final identity.
2. On GitHub > repository Settings > Pages, verify deployment source `main` / `/(root)` and the Pages build status.
3. Check domain registrar DNS: apex A/AAAA must point to the GitHub Pages endpoints for the configured host; `www` must be a correct CNAME if used. Follow current GitHub official documentation rather than guessing values.
4. In Settings > Pages verify `tohesar.com` custom domain and HTTPS certificate status.
5. In a regular browser test `https://tohesar.com/`, `https://tohesar.com/feature/type-01.html`, and `https://tohesar.com/crash-week/` separately.
6. If the browser cannot resolve the domain, diagnose DNS/registrar; if it loads an unrelated site, inspect publishing source or redirect; if the page is blank, inspect devtools Console/Network.
7. Only after review merge the PR into `main` to trigger publication.

## Sources for editorial facts
- https://media.jlr.com/jaguar/en-us/news/2026/10/jaguar-type-01
- https://media.jlr.com/jaguar/news/2026/10/jaguar-type-01-signals-new-era-new-york-world-premiere
