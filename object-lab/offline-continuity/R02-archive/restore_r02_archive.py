#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Rebuild the original TOHEŞAR FIRST DROP R02 zip from GitHub-tracked binary parts.

Offline, Python 3.9+ stdlib only.
Usage:
  python restore_r02_archive.py --out ./TOHESAR-FIRST-DROP-LATEST-R02-BACKUP.zip
  python restore_r02_archive.py --out ./backup.zip --extract-to ./RESTORED-R02

Fail-closed: checks each part size and Git blob SHA-1, complete SHA-256 and
Git blob SHA-1, ZIP CRC, file count and traversal-safe filenames before extraction.
No network, credentials, seller contact, orders, purchases, PII or deployments.
"""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
from zipfile import ZipFile, BadZipFile

HERE = Path(__file__).resolve().parent
MANIFEST = HERE / "manifest.json"

def git_blob_sha1(contents):
    header = b"blob " + str(len(contents)).encode("ascii") + bytes([0])
    return hashlib.sha1(header + contents).hexdigest()

def verify_members(entries):
    for item in entries:
        n = item.filename
        norm = n.replace("\\", "/")
        p = PurePosixPath(norm)
        if p.is_absolute() or ".." in p.parts or not p.parts or ":" in p.parts[0]:
            raise ValueError("unsafe ZIP path: " + repr(n))

def restore(out, extract_to=None):
    m = json.loads(MANIFEST.read_text(encoding="utf-8"))
    assert m["schema_version"] == 1, "unknown archive manifest"
    assert len(m["parts"]) == m["part_count"], "parts count mismatch"
    out = Path(out).resolve()
    if out.exists():
        raise FileExistsError("refusing to overwrite existing archive: " + str(out))
    out.parent.mkdir(parents=True, exist_ok=True)
    digest = hashlib.sha256()
    count = 0
    # No output is trusted until every part and reconstructed ZIP passed.
    temp = out.with_suffix(out.suffix + ".building")
    if temp.exists():
        raise FileExistsError("stale partial output, remove after inspection: " + str(temp))
    try:
        with temp.open("xb") as fh:
            for i, part in enumerate(m["parts"], 1):
                file = HERE / part["file"]
                b = file.read_bytes()
                if len(b) != part["size"]:
                    raise ValueError("part size mismatch: " + str(file))
                if git_blob_sha1(b) != part["blob_sha1"]:
                    raise ValueError("Git SHA mismatch: " + str(file))
                fh.write(b)
                digest.update(b)
                count += len(b)
                print("PART %02d/%02d PASS %d bytes" % (i, m["part_count"], len(b)))
        if count != m["archive_size_bytes"]:
            raise ValueError("reconstructed size mismatch")
        if digest.hexdigest() != m["archive_sha256"]:
            raise ValueError("reconstructed SHA256 mismatch")
        data = temp.read_bytes()
        if git_blob_sha1(data) != m["archive_git_blob_sha1"]:
            raise ValueError("reconstructed Git blob SHA mismatch")
        with ZipFile(temp, "r") as z:
            entries = z.infolist()
            if len([x for x in entries if not x.is_dir()]) != m["expected_zip_files"]:
                raise ValueError("unexpected ZIP file count")
            verify_members(entries)
            bad = z.testzip()
            if bad is not None:
                raise ValueError("failed archive CRC: " + bad)
        temp.replace(out)
    except BaseException:
        temp.unlink(missing_ok=True)
        raise
    print("ARCHIVE VERIFIED SHA256=" + digest.hexdigest())
    print("ZIP FILES=" + str(m["expected_zip_files"]))
    print("RESTORED=" + str(out))
    if extract_to is not None:
        dest = Path(extract_to).resolve()
        if dest.exists() and any(dest.iterdir()):
            raise FileExistsError("refusing to extract into non-empty directory: " + str(dest))
        dest.mkdir(parents=True, exist_ok=True)
        with ZipFile(out, "r") as z:
            verify_members(z.infolist())
            z.extractall(dest)
        print("EXTRACTED=" + str(dest))
    return out

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", default=str(HERE / "TOHESAR-FIRST-DROP-LATEST-R02-BACKUP.zip"))
    parser.add_argument("--extract-to", default=None)
    args = parser.parse_args()
    restore(args.out, args.extract_to)
