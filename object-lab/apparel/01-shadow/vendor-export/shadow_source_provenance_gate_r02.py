#!/usr/bin/env python3
"""01 SHADOW source-identity gate: pinned Git blob for the real 2500x575 PNG.

Independent of the visual/raster preflight. No supplier acceptance implied.
Run without args for synthetic regression tests, or --png PATH for actual art.
"""
import argparse
import hashlib
import json
from pathlib import Path
import unittest

EXPECTED_GIT_BLOB = "899d2014d8c247fe7e7774b65b6371c6315f72f9"
PNG_HEADER = bytes.fromhex("89504e470d0a1a0a")
EXPECTED_SIZE = (2500, 575)

def git_blob_sha1(raw):
    return hashlib.sha1(f"blob {len(raw)}\0".encode("ascii") + raw).hexdigest()

def validate(raw, expected_blob=EXPECTED_GIT_BLOB):
    if not isinstance(raw, bytes):
        raise TypeError("Input must be exact bytes")
    blob = git_blob_sha1(raw)
    if blob != expected_blob:
        raise ValueError("Source Git blob mismatch; fail closed")
    if len(raw) < 24 or raw[:8] != PNG_HEADER or raw[12:16] != b"IHDR":
        raise ValueError("Source is not a valid PNG header")
    width = int.from_bytes(raw[16:20], "big")
    height = int.from_bytes(raw[20:24], "big")
    if (width, height) != EXPECTED_SIZE:
        raise ValueError("Unexpected image dimensions")
    return {
        "source_git_blob_sha1": blob,
        "source_sha256": hashlib.sha256(raw).hexdigest(),
        "bytes": len(raw),
        "dimensions_px": [width, height],
        "source_identity_verified": True,
        "original_S_path_verified_by_this_guard": False,
        "vendor_logo_uploaded": False,
        "vendor_print_approved": False,
        "sample_ordered": False,
    }

class ProvenanceTests(unittest.TestCase):
    def test_git_blob(self):
        raw = b"original-source-bytes"
        self.assertEqual(git_blob_sha1(raw), hashlib.sha1(b"blob 21\0" + raw).hexdigest())

    def test_mutation_rejected(self):
        raw = b"original-source-bytes"
        with self.assertRaisesRegex(ValueError, "mismatch"):
            validate(raw + b"!", git_blob_sha1(raw))

    def test_valid_synthetic_header(self):
        raw = PNG_HEADER + (13).to_bytes(4, "big") + b"IHDR" + (2500).to_bytes(4, "big") + (575).to_bytes(4, "big") + b"extra"
        self.assertTrue(validate(raw, git_blob_sha1(raw))["source_identity_verified"])

    def test_wrong_dimensions(self):
        raw = PNG_HEADER + (13).to_bytes(4, "big") + b"IHDR" + (2500).to_bytes(4, "big") + (576).to_bytes(4, "big") + b"extra"
        with self.assertRaisesRegex(ValueError, "dimensions"):
            validate(raw, git_blob_sha1(raw))

    def test_non_png_rejected(self):
        raw = b"not a png but could have a pinned blob"
        with self.assertRaisesRegex(ValueError, "PNG"):
            validate(raw, git_blob_sha1(raw))

    def test_bad_type(self):
        with self.assertRaises(TypeError):
            validate("bytes")

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--png", type=Path)
    p.add_argument("--json-out", type=Path)
    args = p.parse_args()
    if args.png is None:
        unittest.main(argv=["provenance-tests"], verbosity=2)
    else:
        receipt = validate(args.png.read_bytes())
        s = json.dumps(receipt, ensure_ascii=False, indent=2) + "\n"
        if args.json_out:
            args.json_out.write_text(s, encoding="utf-8")
        print(s)
