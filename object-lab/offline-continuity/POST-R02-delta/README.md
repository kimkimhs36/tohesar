# TOHEŞAR — POST-R02 verified offline continuation archive

**2026-11-10 KST. Original local computer CAN be powered off after this archive is committed AND a cloud-only restore has passed.**

Snapshot: `TOHESAR-OBJECT-LAB-POST-R02-DELTA-20261110.zip`, **11,990,647 bytes**, SHA256 `d9ad85407a61ba154af5697f92bbcff2c9b8984d7d10a20845c6047827e842a1`, Git blob SHA1 `2b89127781efda387eea33e4a60841155b9199ac`. Includes **145 data files plus DELTA-INVENTORY.json** of per-file SHA256 hashes, including:

- `07_VENDOR_REAL_ORDER_GATE`: real anonymous seller editor public-product screenshots, test scripts and evidence for 01 tee/07 crew/05 zip, no login/cart/orders.
- `08_NIGHT_SHIFT_ZIP`: original 05 front/back source SVG, print art, client render QA, production plan, supplier evaluation and test code.
- `SAMPLE-DECISION-ROOM-20261110.html`, Chrome screenshot evidence, responsive UI test scripts, sample JSON export tests.

This **complements** the earlier R02 77-file baseline archive at `../R02-archive`; not a full replacement. Most recent developed production UI and code may additionally live in the feature branch outside either ZIP.

## Exact restore on any fresh computer, no previous PC necessary

```bash
git clone --branch object-lab/01-shadow-marpple-print-proof-20261109 --single-branch https://github.com/kimkimhs36/tohesar.git
cd tohesar
python object-lab/offline-continuity/POST-R02-delta/restore_archive.py --out POST-R02-RESTORED.zip --extract-to ./POST-R02-RESTORED
```

Requires only **Python 3.9+** and the complete Git checkout (no npm, Windows utilities or private computer). The restore script checks ordered parts, each Git blob hash and length, combined byte length, SHA-256, original Git blob hash, ZIP entries, path traversal and ZIP CRC; output is created only on success. `DELTA-INVENTORY.json` additionally records per-file hashes.

## Source-of-truth hierarchy

1. Latest **GitHub feature branch** and **draft PR #38**: active code, 01/05/07 evidence and Sample Decision Room.
2. **This POST-R02 archive**: local production screenshots and scripts that were previously trapped on PC.
3. **R02 archive**: historical previous production techpacks, 01–04 / 04 Offset Shell vector construction and packaging materials.
4. PR #37: earlier 06 AFTER HOURS long sleeve / 07 AFTERIMAGE assets; PR #36: earlier 05 NIGHT SHIFT ZIP.
5. No supplier has been sent proprietary logo/PII. No sample was purchased, printed or delivered. "Native text editor +₩8,000" is not a verified amount for our image logo.

## Security and usage

The ZIP is internal brand R&D evidence and supplier test scripts. Avoid committing cookies, secrets, browser profiles, supplier accounts, or personal contact information. The content is historically dated and should not be interpreted as up-to-date live supplier stock or final prices.

For cloud-only future work, consult `../CONTINUE_WITHOUT_PC.md` in the same branch; **do not wait for TEAM-BKIT to be online**.
