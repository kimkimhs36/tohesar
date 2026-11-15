# TOHEŞAR — R02 baseline archive / PC-independent recovery

**Purpose:** keep the authorized TEAM-BKIT original preproduction snapshot from 2026-11-09 accessible after that computer shuts down. **The repo is the canonical durable store**, not a desktop link or ChatGPT chat. The 77-file ZIP includes old 01–04 design review images, vector masters, packaging proofs, engineering SVG/CSV, Python builders, **PDF preproduction techpacks**, and historical sample lab HTML.

## Status
- Original archive size: **5,822,059 bytes**. Uncompressed content: **6,637,028 bytes**, 77 files.
- Original SHA-256: `f0965ae1cb9cac272880a2e4316cb5ff7e04d4a48b347ac31bc8663a5f8d9e74`.
- Original Git blob SHA-1: `009be3d6b90168268d824145b67c5a56e7c68c92`.
- Archive split into **12 lossless, ordered Git-tracked binary chunks**, each with independently checked Git blob SHA-1; rejoining bytes yields the exact original ZIP.
- **This snapshot is historical R02, not the latest development HEAD.** The newest 05/06/07 artwork, print trials, and editorial decision room are on branches and draft PRs #36/#37/#38.

## Restore offline (no computer connection, no GitHub credentials beyond repository access)
```powershell
python object-lab/offline-continuity/R02-archive/restore_r02_archive.py --out R02-RESTORED.zip --extract-to R02-RESTORED
```
Run from the repository root after cloning/downloading **the complete relevant feature branch**. The script only uses Python's standard library and refuses to trust the archive until it has checked each chunk's size and Git hash, total SHA-256, original Git blob hash, 77 ZIP filenames, CRC and path traversal. For the built-in default location, omit `--out`.

## Review safely
- Need previous 01–04 work? Restore this R02 archive and inspect.
- Need CURRENT 01 SHADOW vendor file? Open `object-lab/apparel/01-shadow/vendor-export`.
- Need CURRENT 05/06/07? See PR #36/#37 plus the 05 vendor-qa file on PR #38.
- Need current design review app? Open `object-lab/apparel/sample-room/SAMPLE-DECISION-ROOM-20261110.html`.
- Never re-upload source art to a supplier, message vendors, order, pay, merge into main or deploy without explicit approval.
