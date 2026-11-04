#!/usr/bin/env python3
"""Fail-closed, repeatable TOHEŞAR curated-news publisher.

The verified Korean editorial feed (journal/data/news.json) is the sole source
of truth for /journal/ and /journal/news/. External RSS in edition/data/news.json
is NOT fact-checked and is never promoted by this script.

Commands:
  check  Validate records AND ensure both published HTML pages match the feed.
  build  Validate then update the two marked HTML regions, atomically.
  audit  Validate records without writing or requiring rendered HTML sync.

This tool performs *structural* verification only. It cannot establish that an
outside source is true, that photos are licensed, or that an editor approved it.
"""
from __future__ import annotations

import argparse
from datetime import date, datetime
from html import escape
from pathlib import Path
import ipaddress
import json
import os
import re
import tempfile
from urllib.parse import unquote, urlsplit
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
DATA = Path("journal/data/news.json")
PAGES = (Path("journal/index.html"), Path("journal/news/index.html"))
TOPICS = {"design": "DESIGN", "industry": "INDUSTRY", "culture": "CULTURE"}
START, END = "<!-- NEWS:START -->", "<!-- NEWS:END -->"
ID_PATTERN = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*\Z")
DATE_PATTERN = re.compile(r"\d{4}-\d{2}-\d{2}\Z")


def editorial_today() -> date:
    """News is edited in Korea; do not reject a KST date while Actions is still on UTC yesterday."""
    return datetime.now(ZoneInfo("Asia/Seoul")).date()


class PublicationError(ValueError):
    """A publication precondition has failed; public files remain unchanged."""


def require(condition: bool, description: str) -> None:
    if not condition:
        raise PublicationError(description)


def checked_date(value, field: str, *, allow_future=False) -> date:
    require(isinstance(value, str) and bool(DATE_PATTERN.fullmatch(value)), f"{field}: expected YYYY-MM-DD")
    try:
        result = date.fromisoformat(value)
    except ValueError as exc:
        raise PublicationError(f"{field}: invalid calendar date") from exc
    require(allow_future or result <= editorial_today(), f"{field}: future date")
    return result


def canonical_source(value: str) -> tuple[str, str]:
    require(isinstance(value, str) and len(value) <= 2048, "Invalid source URL")
    try:
        parts = urlsplit(value)
        host = (parts.hostname or "").lower().rstrip(".")
        port = parts.port
    except ValueError as exc:
        raise PublicationError("Malformed source URL") from exc
    require(parts.scheme.lower() == "https" and bool(host), "News sources must use HTTPS")
    require(not parts.username and not parts.password, "Credentials in source URLs are prohibited")
    require(port in (None, 443), "Nonstandard HTTPS source port")
    require(host != "localhost" and not host.endswith((".localhost", ".local")), "Private source host")
    try:
        address = ipaddress.ip_address(host.strip("[]"))
    except ValueError:
        require("." in host and not host.startswith("."), "Invalid source host")
    else:
        require(address.is_global, "Private or reserved IP source")
    require(bool(parts.path and parts.path != "/"), "Link must identify an article")
    require(not any(ord(c) < 32 for c in value), "Unsafe control character in URL")
    # Treat tracking parameters and fragments as the same article, but do not
    # mutate the original source URL displayed to readers.
    return (host, unquote(parts.path).rstrip("/").casefold())


def normalized_title(value: str) -> str:
    return re.sub(r"\W", "", value, flags=re.UNICODE).casefold()


def validate(root: Path) -> list[dict]:
    try:
        data = json.loads((root / DATA).read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        raise PublicationError("Cannot read curated news JSON") from exc
    require(isinstance(data, dict) and isinstance(data.get("items"), list), "Curated news must contain items array")
    seen_ids, seen_urls, seen_titles = set(), set(), set()
    published = []
    for position, item in enumerate(data["items"]):
        label = f"item {position}"
        require(isinstance(item, dict), f"{label}: expected object")
        ident = item.get("id")
        require(isinstance(ident, str) and bool(ID_PATTERN.fullmatch(ident)), f"{label}: invalid ID")
        require(ident not in seen_ids, f"Duplicate news ID: {ident}")
        seen_ids.add(ident)
        state = item.get("status")
        require(state in {"draft", "review", "published"}, f"{ident}: invalid status")
        require(item.get("fact_check_status") in {"pending", "verified", "rejected"}, f"{ident}: invalid fact-check status")
        checked_date(item.get("registered_at"), f"{ident}.registered_at")
        title = item.get("title")
        require(isinstance(title, str), f"{ident}: invalid title")
        if title.strip():
            title_key = normalized_title(title)
            require(title_key not in seen_titles, f"Duplicate news title: {ident}")
            seen_titles.add(title_key)
        url = item.get("url")
        if url:
            key = canonical_source(url)
            require(key not in seen_urls, f"Duplicate source article: {ident}")
            seen_urls.add(key)
        if item.get("published_at"):
            checked_date(item["published_at"], f"{ident}.published_at", allow_future=state != "published")
        if state != "published":
            continue

        for field in ("title", "manufacturer", "topic", "published_at", "source",
                      "source_title", "url", "summary", "image_usage", "verification", "verified_at"):
            require(isinstance(item.get(field), str) and bool(item[field].strip()),
                    f"{ident}: missing {field}")
        require(item["topic"] in TOPICS, f"{ident}: invalid topic")
        require(item["fact_check_status"] == "verified", f"{ident}: unverified record cannot publish")
        checked_date(item["verified_at"], f"{ident}.verified_at")
        require(bool(item.get("source_title")), f"{ident}: missing original source title")
        canonical_source(item["url"])
        if item.get("image"):
            for field in ("image_source", "image_licence"):
                require(isinstance(item.get(field), str) and bool(item[field].strip()),
                        f"{ident}: image rights missing {field}")
        published.append(item)
    return sorted(published, key=lambda item: item["published_at"], reverse=True)


def render(item: dict) -> str:
    q = lambda k: escape(item[k], quote=True)
    return (
        f'<article class="news-item" id="{q("id")}" data-topic="{q("topic")}">'
        f'<div class="news-date"><time datetime="{q("published_at")}">'
        f'{q("published_at").replace("-", ".")}</time>'
        f'<span>{q("manufacturer")} / {TOPICS[item["topic"]]}</span></div>'
        f'<h3><a href="{q("url")}" target="_blank" rel="noopener noreferrer">'
        f'{q("title")}</a></h3><div><p>{q("summary")}</p>'
        f'<a class="news-source" href="{q("url")}" target="_blank" '
        f'rel="noopener noreferrer">{q("source")} · 원문 읽기 ↗</a></div>'
        f'<a class="news-arrow" href="{q("url")}" target="_blank" '
        f'rel="noopener noreferrer" aria-label="{q("title")} 원문 새 탭에서 읽기">↗</a>'
        '</article>'
    )


def select_front(items: list[dict], limit: int) -> list[dict]:
    require(limit > 0 and limit <= 20, "Invalid front-page news limit")
    selected, seen = [], set()
    for item in items:
        if item["manufacturer"] in seen:
            continue
        seen.add(item["manufacturer"])
        selected.append(item)
        if len(selected) >= limit:
            break
    return selected


def expected_html(source: str, page: Path, items: list[dict]) -> str:
    require(source.count(START) == 1 and source.count(END) == 1,
            f"{page}: exactly one pair of generated news markers is required")
    left, rest = source.split(START, 1)
    _, right = rest.split(END, 1)
    require(left.find(END) == -1 and START not in right, f"{page}: markers out of order")
    selected = items
    if page == PAGES[0]:
        limit = re.search(r'data-limit="(\d+)"', left)
        require(limit is not None, "Homepage missing news limit")
        selected = select_front(items, int(limit.group(1)))
    html = left + START + "".join(map(render, selected)) + END + right
    if items:
        last_verified = max(item["verified_at"] for item in items).replace("-", ".")
        html = re.sub(r"원문 확인 \d{4}\.\d{2}\.\d{2}",
                      "원문 확인 " + last_verified, html)
    html = re.sub(r"선별한 \d+건의 기록", f"선별한 {len(items)}건의 기록", html)
    html = re.sub(r'(<p id="news-count"[^>]*>)\d+개의 기록',
                  lambda match: match.group(1) + f"{len(items)}개의 기록", html)
    return html


def render_pages(root: Path, items: list[dict], *, check: bool) -> int:
    """Prepare all outputs before writing anything (fail closed)."""
    changes = []
    for relative in PAGES:
        path = root / relative
        try:
            existing = path.read_text(encoding="utf-8")
        except OSError as exc:
            raise PublicationError(f"Missing source HTML: {relative}") from exc
        updated = expected_html(existing, relative, items)
        if existing != updated:
            changes.append((path, updated))
    if check and changes:
        raise PublicationError("News HTML out of sync: " + ", ".join(str(p.relative_to(root)) for p, _ in changes))
    if not check:
        for path, updated in changes:
            # This operation is repeated only on a branch/checkout. Git push
            # remains the transaction boundary across multiple HTML files.
            fd, temporary = tempfile.mkstemp(prefix=".news-", suffix=".tmp", dir=path.parent)
            try:
                with os.fdopen(fd, "w", encoding="utf-8") as stream:
                    stream.write(updated)
                os.replace(temporary, path)
            finally:
                if os.path.exists(temporary):
                    os.unlink(temporary)
    return len(changes)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=("audit", "check", "build"))
    parser.add_argument("--root", type=Path, default=ROOT)
    options = parser.parse_args()
    root = options.root.resolve()
    try:
        published = validate(root)
        changes = 0 if options.command == "audit" else render_pages(root, published, check=options.command == "check")
        print(f"NEWS {options.command.upper()} PASS: {len(published)} verified articles, {changes} HTML files updated")
    except (PublicationError, KeyError, TypeError) as exc:
        parser.exit(1, f"NEWS BLOCKED: {exc}\n")


if __name__ == "__main__":
    main()
