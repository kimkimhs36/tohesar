# PR #28 — main integration checkpoint (2026-11-06)

**Status: review only; NOT merge-ready.** This branch was built on PR #27 (`feature/owner-stories-growth-pilot-20261104`), not on the current `main`. The branches diverged. Do not treat green isolated card QA as proof that the entire site can safely be merged.

## Verified repository facts

- PR #28 head before this checkpoint: `bca63d90876fd0abe146336b355609b3adf32b82`.
- `main` at comparison: `e4de6c963d19133dc244a9b0b77d31daf089c9e2`.
- Merge base: `d6df787966783d50ddee89ae9055e72d2fe63db7`; `main` is four commits beyond it. PR branch is independently ahead; this is not a linear main extension.
- PR #28 relative to PR #27: editorial layout, card UI and regression tests. Its base is not `main`.
- Card CI run `42216764582`: Node deterministic tests and Chromium/WebKit desktop-engine browser tests passed. Screenshot artifact `owner-stories-browser-qa` (artifact ID `13500923975`) contains 16 viewport/mode screenshots at 320/390/768/1024px. This is **not** a physical iPhone test or visual approval.

## Critical parity risks, checked against the actual main files

1. `owner-stories/participation.js`: main has 194 lines, this branch has 112. Main has an **optional disabled-by-default online intake flow**, Turnstile, idempotency and consent gating. Branch has only the manual mail draft/copy/share flow. Copying the branch file over main would silently remove online-intake code, even if currently unconfigured.
2. `owner-stories-service/api/submit.js`: main has 166 lines, branch has 117. Main includes additional validation and delivery/idempotency safeguards. Do not restore the older branch API file over the newer main API.
3. `owner-stories/index.html`: main has 128 lines, branch has 118. Reconcile the optional online-intake markup and editorial presentation together; do not replace the page wholesale.
4. `owner-stories/story-card/card.js`: branch has 271 lines vs main 259; the branch adds stricter upload validation and race-safe export logic. Preserve these improvements when porting onto current main, but do not infer superiority from line counts.
5. `index.html`: main and branch both changed. Preserve main navigation and any production-linked paths.
6. The branch adds its own `.github/workflows/owner-stories-card-qa.yml` and two card tests. Main already has a different `owner-stories-qa.yml` and `tests/owner-stories-browser.cjs`. Consolidate complementary coverage rather than accidentally dropping either.

## Safe next substantive milestone

Create an integration commit **on the existing PR #28 branch**, first reconciling main's owner intake HTML, JS and API without dropping its privacy/security controls. Keep PR #28's card improvements and editorial layout. Then compare the full file set against the latest main, run both suites, test offline/manual email fallback, disabled-online default, consent, Turnstile failures, duplicate submissions, PNG export and 320/390/768/1024px layout. If rebase conflicts or current main moves, stop and resolve deliberately. Do not merge or change production without founder approval.

**Deployment parity not established:** current GitHub main is a repository reference, not independently verified proof of the production domain's deployed commit. Vercel status checks alone do not prove visual acceptance.
