"""Fail-closed GitHub Pages deployment payload tests for site budget 038."""
import os
from pathlib import Path
import tempfile
import unittest

from site_budget import BudgetViolation, inspect, MIB


class BudgetTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        (self.root / "index.html").write_text("<!doctype html><title>TOHEŞAR</title>")
        (self.root / "journal").mkdir()
        (self.root / "journal/one.html").write_text("<h1>Automotive design</h1>")
        (self.root / "assets").mkdir()
        (self.root / "assets/car.webp").write_bytes(b"\0" * 99)

    def tearDown(self):
        self.temp.cleanup()

    def test_healthy_site_passes(self):
        report = inspect(self.root)
        self.assertEqual(report["status"], "pass")
        self.assertEqual(report["files"], 3)
        self.assertEqual(report["restricted_paths"], [])

    def test_large_total_fails_without_changes(self):
        before = (self.root / "index.html").read_bytes()
        (self.root / "assets/large.png").write_bytes(b"0" * 1048577)
        report = inspect(self.root, max_mib=1, max_file_mib=40)
        self.assertEqual(report["status"], "blocked")
        self.assertEqual((self.root / "index.html").read_bytes(), before)

    def test_oversized_asset_is_blocked(self):
        (self.root / "assets/single.png").write_bytes(b"x" * (2 * MIB))
        result = inspect(self.root, max_mib=10, max_file_mib=1)
        self.assertIn("assets/single.png", result["oversize_files"])
        self.assertEqual(result["status"], "blocked")

    def test_private_editorial_preview_blocks(self):
        (self.root / ".editorial-preview/story").mkdir(parents=True)
        (self.root / ".editorial-preview/story/index.html").write_text("review")
        self.assertIn(".editorial-preview/story/index.html", inspect(self.root)["restricted_paths"])

    def test_exclude_scripts_and_docs_from_public(self):
        (self.root / "docs").mkdir()
        (self.root / "docs/archive.png").write_bytes(b"x")
        (self.root / "scripts").mkdir()
        (self.root / "scripts/seo.py").write_bytes(b"pass")
        result = inspect(self.root)
        self.assertEqual(result["status"], "blocked")
        self.assertIn("docs/archive.png", result["restricted_paths"])
        self.assertIn("scripts/seo.py", result["restricted_paths"])

    def test_draft_and_inbox_must_not_be_in_site(self):
        for directory in ("journal/drafts", "journal/inbox"):
            (self.root / directory).mkdir(exist_ok=True)
            (self.root / directory / "candidate.json").write_text("{}")
        result = inspect(self.root)
        self.assertEqual(len(result["restricted_paths"]), 2)

    def test_reject_symlink_even_when_target_is_internal(self):
        (self.root / "assets/duplicate.webp").symlink_to(self.root / "assets/car.webp")
        result = inspect(self.root)
        self.assertTrue(any("symlink" in x for x in result["restricted_paths"]))

    def test_missing_root_and_invalid_budget_rejected(self):
        with self.assertRaises(BudgetViolation):
            inspect(self.root / "unknown")
        with self.assertRaises(ValueError):
            inspect(self.root, max_mib=0)
        with self.assertRaises(ValueError):
            inspect(self.root, max_file_mib=200)

    def test_largest_files_are_sorted(self):
        (self.root / "assets/bigger.png").write_bytes(b"x" * 200)
        result = inspect(self.root)
        self.assertEqual(result["largest_files"][0]["path"], "assets/bigger.png")

    def test_no_modifications_are_made_during_audit(self):
        before = {p.relative_to(self.root): p.read_bytes()
                  for p in self.root.rglob("*") if p.is_file()}
        inspect(self.root)
        after = {p.relative_to(self.root): p.read_bytes()
                 for p in self.root.rglob("*") if p.is_file()}
        self.assertEqual(before, after)


if __name__ == "__main__":
    unittest.main()
