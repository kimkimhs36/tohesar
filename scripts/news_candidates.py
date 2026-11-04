#!/usr/bin/env python3
"""TOHEŞAR Editorial Radar 037: non-publishing, deterministic RSS candidate triage.

This script NEVER publishes articles, changes GitHub sources, or asserts that
an RSS headline is factual. It produces a private CI review artifact using
known publisher hosts and excludes items already in the curated Korean journal.

No AI keys, databases, network calls, or third-party Python libraries needed.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
import re
from urllib.parse import urlsplit

from news_pipeline import canonical_source, normalized_title, PublicationError
from refresh_news import FEEDS, safe_url

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {source["id"]: source for source in FEEDS}
CATEGORIES = {"design": 15, "new-cars": 9, "technology": 5,
              "motorsport": 4, "motorcycles": 3, "industry": 1}
SOURCE_SCORES = {"porsche": 5, "bmw": 5, "motor1": 2, "autoblog": 1}
SIGNALS = re.compile(
    r"\b(design|concept|prototype|vision|heritage|classic|vintage|"
    r"coachbuilt|coachbuild|restomod|exterior|interior|reveal|unveil|"
    r"launch|supercar|sports car|grand tourer|electric sports)\b", re.I
)
LOW_VALUE = re.compile(
    r"\b(earnings|quarterly|dividend|recall|discount|coupon|"
    r"shares|stocks|lawsuit|sales figures|insurance|"
    r"top [0-9]+|best deals)\b", re.I
)


def parse_timestamp(value) -> datetime | None:
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            return None
        return parsed.astimezone(timezone.utc)
    except (ValueError, TypeError, OverflowError):
        return None


def prior_signatures(curated: dict) -> tuple[set, set]:
    """All existing curated statuses reserve a source URL; no duplicate PRs."""
    urls, titles = set(), set()
    for record in curated.get("items", []):
        if not isinstance(record, dict):
            continue
        url = record.get("url")
        if isinstance(url, str) and url:
            try:
                urls.add(canonical_source(url))
            except PublicationError:
                # A malformed draft must not grant authority to an untrusted
                # headline. The existing publisher checker handles this error.
                pass
        for key in ("source_title", "title"):
            val = record.get(key)
            if isinstance(val, str) and val.strip():
                titles.add(normalized_title(val))
    return urls, titles


def report(wire: dict, curated: dict, *, now: datetime,
           max_age_hours: int = 48, limit: int = 8,
           min_priority: int = 10) -> dict:
    if now.tzinfo is None:
        raise ValueError("An aware UTC time is required")
    if not 1 <= max_age_hours <= 168 or not 1 <= limit <= 30 or not 0 <= min_priority <= 100:
        raise ValueError("Invalid report bounds")
    now = now.astimezone(timezone.utc)
    base = {
        "schema_version": 1,
        "kind": "editorial-review-candidates",
        "generated_at": now.isoformat(),
        "fact_checked": False,
        "publication_permitted": False,
        "note": ("외부 매체 헤드라인에서 자동 선별한 *검토 후보*입니다. "
                 "내용·발표일·모델명·사진 권리는 원문을 열고 다시 검증해야 합니다. "
                 "이 파일은 발행이나 AI 자동 승인에 사용할 수 없습니다."),
        "candidates": [],
        "counts": {"seen": 0, "valid_recent": 0, "previously_covered": 0, "low_priority": 0},
        "wire_status": None,
        "source_snapshot_at": None,
        "warnings": [],
    }
    if not isinstance(wire, dict) or not isinstance(curated, dict):
        base["warnings"].append("Invalid input schema; nothing was shortlisted")
        return base
    status = wire.get("status")
    source_time = parse_timestamp(wire.get("generated_at"))
    base["wire_status"] = status
    base["source_snapshot_at"] = wire.get("generated_at")
    if status not in {"live", "partial"}:
        base["warnings"].append("RSS refresh not confirmed; do not claim fresh news")
        return base
    if source_time is None or source_time > now + timedelta(minutes=10) or now - source_time > timedelta(hours=3):
        base["warnings"].append("RSS snapshot is stale or has an invalid timestamp")
        return base
    raw = wire.get("items")
    if not isinstance(raw, list):
        base["warnings"].append("Missing headline collection")
        return base
    previous_urls, previous_titles = prior_signatures(curated)
    candidates = []
    seen_urls = set()
    seen_titles = set()
    for entry in raw:
        base["counts"]["seen"] += 1
        if not isinstance(entry, dict):
            continue
        source_id = entry.get("source_id")
        source = SOURCES.get(source_id) if isinstance(source_id, str) else None
        if not source:
            continue
        if (entry.get("fact_checked") is not False
                or entry.get("kind") != "publisher-headline"
                or entry.get("language") != "en"
                or entry.get("source") != source["name"]
                or entry.get("classification") != "headline-keywords"):
            continue
        title = entry.get("title")
        url = entry.get("url")
        if not isinstance(title, str) or not 8 <= len(title.strip()) <= 250:
            continue
        if not isinstance(url, str) or safe_url(url, source) is None:
            continue
        publication = parse_timestamp(entry.get("published_at"))
        if publication is None or publication > now + timedelta(minutes=10):
            continue
        age = now - publication
        if age < timedelta(minutes=-10) or age > timedelta(hours=max_age_hours):
            continue
        try:
            signature = canonical_source(url)
        except PublicationError:
            continue
        title_key = normalized_title(title)
        if signature in previous_urls or title_key in previous_titles:
            base["counts"]["previously_covered"] += 1
            continue
        if signature in seen_urls or title_key in seen_titles:
            continue
        seen_urls.add(signature)
        seen_titles.add(title_key)
        category = entry.get("category")
        if category not in CATEGORIES:
            continue
        base["counts"]["valid_recent"] += 1
        score = (CATEGORIES[category] + SOURCE_SCORES.get(source_id, 0)
                 + (5 if SIGNALS.search(title) else 0)
                 - (12 if LOW_VALUE.search(title) else 0)
                 + max(0, int((max_age_hours - age.total_seconds() / 3600) / 8)))
        if score < min_priority:
            base["counts"]["low_priority"] += 1
            continue
        candidates.append({
            "id": entry.get("id") if isinstance(entry.get("id"), str) else "",
            "headline": title,
            "source": source["name"],
            "source_id": source_id,
            "source_url": url,
            "source_published_at": publication.isoformat(),
            "inferred_category": category,
            "editorial_priority": score,
            "classification": "automated-headline-triage",
            "fact_checked": False,
            "status": "needs-independent-source-review",
            "required_checks": [
                "Open the source and confirm the actual event and publication date",
                "Verify named models, factual claims, and editorial relevance",
                "Check whether TOHEŞAR has already covered this topic",
                "Write a new original Korean summary; do not copy an article body",
                "Use no source image unless the licence explicitly permits reuse",
            ],
        })
    candidates.sort(
        key=lambda x: (-x["editorial_priority"], -parse_timestamp(x["source_published_at"]).timestamp(),
                       x["source_id"], x["source_url"])
    )
    # A popular publisher should not monopolize the selection.
    per_source = {}
    for candidate in candidates:
        source_id = candidate["source_id"]
        if per_source.get(source_id, 0) >= 2:
            continue
        base["candidates"].append(candidate)
        per_source[source_id] = per_source.get(source_id, 0) + 1
        if len(base["candidates"]) == limit:
            break
    return base


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--wire", type=Path, required=True)
    parser.add_argument("--curated", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--max-age-hours", type=int, default=48)
    parser.add_argument("--limit", type=int, default=8)
    parser.add_argument("--min-priority", type=int, default=10,
                        help="Do not send weak industry headlines to editorial review")
    opts = parser.parse_args()

    destination = opts.output.resolve()
    # Review material must never enter the publicly served project tree.
    if destination.is_relative_to(ROOT.resolve()):
        parser.error("Review artifact path must be outside the repository")

    try:
        wire = json.loads(opts.wire.read_text(encoding="utf-8"))
        curated = json.loads(opts.curated.read_text(encoding="utf-8"))
        output = report(wire, curated, now=datetime.now(timezone.utc),
                        max_age_hours=opts.max_age_hours, limit=opts.limit,
                        min_priority=opts.min_priority)
    except (OSError, ValueError, TypeError) as error:
        parser.exit(1, f"Radar blocked: {error}\n")

    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n",
                           encoding="utf-8")
    print(f"RADAR 037: {len(output['candidates'])} unverified review candidates; "
          f"{output['counts']['previously_covered']} already covered; "
          f"{output['counts']['low_priority']} below editorial threshold; "
          f"warnings={len(output['warnings'])}; artifact={destination}")


if __name__ == "__main__":
    main()
