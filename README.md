# TOHEŞAR

Official website repository for **TOHEŞAR**.

- Website: https://tohesar.com
- Production branch: `main`
- Custom domain: `tohesar.com` (preserved via `CNAME`)
- Pages status: deployment configuration currently needs verification
- Stack: static HTML/CSS — no build step or framework yet

## Repository structure

- `index.html` — current website source
- `CNAME` — custom domain (`tohesar.com`)
- `.gitignore` — prevents local/editor junk files from being committed

## Simple workflow

Keep `main` as the production branch. Larger redesigns should be prepared separately and merged only after review so the live domain configuration is not disturbed.

For ordinary website edits:

1. Edit the required file.
2. Preview the change.
3. Commit it with a short description.
4. Keep temporary files and editor settings out of the repository.

This repository is intentionally kept small and clean while the next site architecture is prepared.
