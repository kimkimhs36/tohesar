#!/usr/bin/env python3
"""TOHEŞAR Site Budget 038 — check the *deployed* GitHub Pages payload.

Run only against the staging directory (normally _site), never the entire
Git repository. The budget is intentionally below GitHub Pages' 1 GiB limit.
This tool doesn't delete, resize, or rewrite any asset.
"""
from __future__ import annotations

import argparse
from collections import Counter
import json
from pathlib import Path

MIB = 1024 * 1024
MAX_MIB = 850
MAX_SINGLE_FILE_MIB = 40
MEDIA_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".avif",
                    ".gif", ".svg", ".webm", ".mp4", ".glb", ".mp3", ".wav"}
INTERNAL_TOP_LEVEL = {".git", ".github", "docs", "scripts"}
PRIVATE_DIRECTORIES = {".editorial-preview", "__pycache__", "node_modules"}
PRIVATE_JOURNAL = {"inbox", "drafts"}


class BudgetViolation(ValueError):
    """Fail deployment without touching existing files."""


def inspect(root: Path, *, max_mib: int = MAX_MIB,
            max_file_mib: int = MAX_SINGLE_FILE_MIB) -> dict:
    root = root.resolve()
    if not root.is_dir():
        raise BudgetViolation("Staged Pages directory is missing: " + str(root))
    if not 1 <= max_mib <= 1024 or not 1 <= max_file_mib <= 100:
        raise ValueError("Invalid site budget parameters")
    sizes: list[tuple[str, int]] = []
    media = 0
    html = 0
    blocked: list[str] = []
    overlarge: list[str] = []
    categories = Counter()
    for path in root.rglob("*"):
        if path.is_dir() and not path.is_symlink():
            continue
        relative = path.relative_to(root)
        label = relative.as_posix()
        parts = relative.parts
        if path.is_symlink():
            blocked.append(label + " [symlink]")
            continue
        if not path.is_file():
            continue
        if (parts[0] in INTERNAL_TOP_LEVEL or
                any(part in PRIVATE_DIRECTORIES for part in parts) or
                (len(parts) > 1 and parts[0] == "journal" and parts[1] in PRIVATE_JOURNAL) or
                path.name in {".env", ".env.production", ".env.local"}):
            blocked.append(label)
        size = path.stat().st_size
        sizes.append((label, size))
        ext = path.suffix.lower() or "[no extension]"
        categories[ext] += size
        if ext in MEDIA_EXTENSIONS:
            media += size
        if ext in {".html", ".htm"}:
            html += size
        if size > max_file_mib * MIB:
            overlarge.append(label)

    total = sum(n for _, n in sizes)
    result = {
        "schema_version": 1,
        "files": len(sizes),
        "bytes": total,
        "mib": round(total / MIB, 2),
        "media_mib": round(media / MIB, 2),
        "html_mib": round(html / MIB, 2),
        "limit_mib": max_mib,
        "largest_files": [{"path": name, "mib": round(size / MIB, 2)}
                          for name, size in sorted(sizes, key=lambda x: -x[1])[:12]],
        "largest_extensions": [{"extension": ext, "mib": round(size / MIB, 2)}
                               for ext, size in categories.most_common(8)],
        "restricted_paths": sorted(blocked)[:25],
        "oversize_files": sorted(overlarge)[:25],
        "status": "pass",
    }
    if total > max_mib * MIB or blocked or overlarge:
        result["status"] = "blocked"
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path("_site"))
    parser.add_argument("--max-mib", type=int, default=MAX_MIB)
    parser.add_argument("--max-file-mib", type=int, default=MAX_SINGLE_FILE_MIB)
    parser.add_argument("--report", type=Path, help="Optional JSON audit outside the artifact")
    options = parser.parse_args()
    try:
        audit = inspect(options.root, max_mib=options.max_mib,
                        max_file_mib=options.max_file_mib)
        if options.report:
            target = options.report.resolve()
            if target.is_relative_to(options.root.resolve()):
                raise BudgetViolation("Do not write the audit report into the public site")
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + "\n",
                              encoding="utf-8")
        print(f"Pages Budget 038: {audit['status'].upper()} — "
              f"{audit['mib']} MiB / {audit['limit_mib']} MiB, "
              f"{audit['files']} files, {audit['media_mib']} MiB media")
        if audit["status"] != "pass":
            reasons = []
            if audit["bytes"] > audit["limit_mib"] * MIB:
                reasons.append("total site size exceeds limit")
            if audit["restricted_paths"]:
                reasons.append("private/dev paths present: " + ", ".join(audit["restricted_paths"]))
            if audit["oversize_files"]:
                reasons.append("oversize individual assets: " + ", ".join(audit["oversize_files"]))
            raise BudgetViolation("; ".join(reasons))
    except (BudgetViolation, OSError) as exc:
        parser.exit(1, f"Pages upload blocked: {exc}\n")


if __name__ == "__main__":
    main()
