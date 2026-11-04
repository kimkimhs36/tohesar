# TOHEŞAR Site Budget 038 — free-tier release gate

**Purpose:** keep the publicly deployed GitHub Pages artifact comfortably below its 1 GiB repository-site ceiling as the automotive magazine grows to hundreds of original articles. The budget never deletes photos, articles, or historical source.

## Policy
- **Inspect the staged `_site/` artifact**, not the 400+ MB Git source tree that includes development screenshot evidence.
- Default hard cap: **850 MiB total published payload**, leaving headroom for the 1 GiB GitHub Pages limit.
- Block any individual deployed file over 40 MiB.
- Never publicly package `docs/`, `scripts/`, `.github/`, `.git/`, `.editorial-preview/`, `journal/inbox/`, or `journal/drafts/`, nor local secrets or symlinks.
- Print aggregate HTML, image/media and largest-file statistics. Only inspect files; never optimize/alter original assets or claim photo rights.
- Both the release GitHub Pages workflow and editorial QA recreate/check the same artifact assembly. A failed budget gate prevents the custom Pages upload.

## Run
```bash
# In a checkout:
mkdir -p _site
tar --exclude=.git --exclude=_site --exclude=.github --exclude=docs --exclude=scripts --exclude=./journal/inbox -cf - . | (cd _site && tar xf -)
python3 scripts/site_budget.py --root _site --max-mib 850
python3 -m unittest discover -s scripts -p 'test_site_budget.py' -v
```

**Limitation:** this protects the explicit custom GitHub Pages Actions deployment, not GitHub's separately configured automatic branch-source publishing route. Those two deployment mechanisms should be consolidated in a future infrastructure milestone after verifying repository Pages settings and DNS. Do not destructively delete source screenshots to make the public artifact smaller.

## Long-term media strategy
Retain originals in archival storage; serve optimized WebP/AVIF and responsive sources to readers; minimize photographs over the fold on slow iPhones; use explicit licence/credit records for every photograph. Propose an external media CDN only if real traffic or future issues exceed what GitHub Pages comfortably supports.
