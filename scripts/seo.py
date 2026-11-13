#!/usr/bin/env python3
"""TOHEŞAR canonical indexing policy: one public domain, reviewed pages only.

Runs against either the source tree or the staged GitHub Pages _site directory.
Only edits HTML <head> metadata; it never removes content, routes or assets.
The policy is intentionally allowlist-based. New pages stay noindex until their
publication records or the curated section list explicitly include them.
"""
from __future__ import annotations

import argparse
from html import escape, unescape
import json
from pathlib import Path
import re
from xml.sax.saxutils import escape as xml_escape

DOMAIN = "https://tohesar.com"
BRAND = "TOHEŞAR"
SITE_ID = DOMAIN + "/#website"
ORG_ID = DOMAIN + "/#organization"

# Preserved, selected public destinations. Old experiments are retained in Git
# and can still be visited by URL, but are not presented as search results.
SECTIONS = {
    "/": (
        "TOHEŞAR(토헤샤)는 자동차 디자인과 문화를 다루는 독립 저널입니다. Porsche 911, Ferrari F40, Alfa Romeo Giulia와 Jaguar의 형태와 이야기를 기록합니다.",
        "/assets/cover-911-valentin-kremer.jpg",
    ),
    "/journal/": (
        "TOHEŞAR 자동차 디자인 저널. Porsche 911, Ferrari F40, Alfa Romeo Giulia, Jaguar 디자인 에세이와 독립 특집호를 읽어보세요.",
        "/assets/cover-911-valentin-kremer.jpg",
    ),
    "/contact/": (
        "TOHEŞAR의 공식 연락 및 협업 안내. 자동차 디자인 에디토리얼 제안, 사진과 차주 이야기, 협업 문의를 받습니다.",
        None,
    ),
    "/journal/design/": (
        "자동차의 곡선, 쐐기형 차체, 그랜드 투어러의 비례를 사진과 글로 읽는 TOHEŞAR 디자인 아틀라스.",
        "/journal/assets/giulia/profile-1600.webp",
    ),
    "/journal/explore/": (
        "TOHEŞAR의 자동차 디자인 기사와 시각 문화, 미니어처, 독립 잡지 특집을 주제별로 둘러보세요.",
        "/journal/assets/giulia/profile-1600.webp",
    ),
    "/journal/issues/": (
        "TOHEŞAR의 자동차 디자인과 문화 에세이를 주제별로 엮은 디지털 매거진 특집호 아카이브.",
        "/assets/cover-911-valentin-kremer.jpg",
    ),
    "/edition/": (
        "TOHEŞAR 뉴스룸. 자동차 디자인과 문화 소식을 공식 원문 출처와 함께 소개하는 독립 에디토리얼.",
        "/journal/assets/design/type01-arrival-1600.webp",
    ),
    "/edition/news/": (
        "TOHEŞAR 자동차 뉴스 데스크. 자동차 제조사 발표와 디자인·문화 소식을 원문 출처와 함께 확인하세요.",
        "/journal/assets/design/type01-arrival-1600.webp",
    ),
    "/edition/archive/": (
        "TOHEŞAR 디자인 아카이브. 자동차 조형과 문화에 관한 기사와 관찰을 모아 읽는 공간.",
        "/journal/assets/giulia/profile-1600.webp",
    ),
    "/history/": (
        "TOHEŞAR Heritage Museum. 자동차 커뮤니티에서 시작된 프로젝트와 브랜드의 기록을 돌아봅니다.",
        "/assets/yokohama-landscape.webp",
    ),
    "/symbol/": (
        "TOHEŞAR의 독립적인 시그니처 심볼을 금속, 빛과 조형으로 탐구하는 인터랙티브 전시.",
        None,
    ),
}

# Intentionally exclude this thin overview until its editorial content matures;
# its route and navigation remain accessible. Other published data entries are
# automatically indexed when their own actual HTML exists.
HELD_CONTENT_IDS = {"visual-culture"}


def read_json(root: Path, relative: str) -> dict:
    return json.loads((root / relative).read_text(encoding="utf-8"))


def url_path(file: Path, root: Path) -> str:
    relative = file.relative_to(root).as_posix()
    if relative == "index.html":
        return "/"
    if relative.endswith("/index.html"):
        return "/" + relative[:-len("index.html")]
    return "/" + relative


def destination(root: Path, route: str) -> Path:
    if route == "/":
        return root / "index.html"
    return root / route.lstrip("/") / "index.html"


def published_pages(root: Path) -> dict:
    pages = {
        url: {"description": description, "image": image, "kind": "section"}
        for url, (description, image) in SECTIONS.items()
    }

    content = read_json(root, "journal/data/content-index.json")["items"]
    for item in content:
        if item.get("status") != "published" or item["id"] in HELD_CONTENT_IDS:
            continue
        url = item["url"]
        if not re.fullmatch(r"/[a-zA-Z0-9/_-]+/", url):
            raise ValueError("Unsafe published URL: " + url)
        if url in pages:
            raise ValueError("Duplicate canonical URL: " + url)
        pages[url] = {
            "description": item["summary"],
            "image": item.get("image"),
            "kind": "article" if item["kind"] == "design-essay" else "section",
            "date": item.get("published_at"),
            "headline": item["title"],
        }

    for issue in read_json(root, "journal/data/issues.json")["issues"]:
        if issue.get("status") != "published":
            continue
        url = issue["url"]
        if url in pages:
            raise ValueError("Duplicate edition URL: " + url)
        pages[url] = {
            "description": issue.get("intro") or issue.get("subtitle") or issue["title"],
            "image": None,
            "kind": "section",
        }

    # Authored stories are published separately by editorial_system.py.
    stories_file = root / "journal/data/editorial-stories.json"
    if stories_file.is_file():
        for story in read_json(root, "journal/data/editorial-stories.json")["stories"]:
            if story.get("status") != "published":
                continue
            slug = story["slug"]
            if not re.fullmatch(r"[a-z0-9-]+", slug):
                raise ValueError("Invalid editorial story slug: " + slug)
            url = "/journal/stories/" + slug + "/"
            if url in pages:
                raise ValueError("Duplicate editorial story URL: " + url)
            pages[url] = {
                "description": story["description"],
                "image": story.get("hero", {}).get("src"),
                "headline": story["title"].replace("\n", " "),
                "date": story["date"],
                "kind": "article",
            }

    for url in pages:
        if not destination(root, url).is_file():
            raise FileNotFoundError("Indexed URL has no document: " + url)
    return pages


def title_of(markup: str) -> str:
    match = re.search(r"<title\b[^>]*>(.*?)</title\s*>", markup, re.I | re.S)
    if not match:
        raise ValueError("Indexable page missing <title>")
    return unescape(re.sub(r"<[^>]*>", "", match.group(1))).strip()


def html_meta(*, name=None, prop=None, content: str) -> str:
    key, value = ("name", name) if name else ("property", prop)
    return f'<meta {key}="{escape(value, quote=True)}" content="{escape(content, quote=True)}">'


def meta_block(root: Path, route: str, page: dict, title: str) -> str:
    url = DOMAIN + route
    description = re.sub(r"\s+", " ", page["description"]).strip()
    image = page.get("image")
    if image and not (root / image.lstrip("/")).is_file():
        raise FileNotFoundError("SEO image missing for " + route + ": " + image)

    lines = [
        '<meta name="robots" content="index,follow,max-image-preview:large">',
        f'<link rel="canonical" href="{escape(url, quote=True)}">',
        html_meta(name="description", content=description),
        html_meta(prop="og:site_name", content=BRAND),
        html_meta(prop="og:locale", content="ko_KR"),
        html_meta(prop="og:type", content="article" if page["kind"] == "article" else "website"),
        html_meta(prop="og:title", content=title),
        html_meta(prop="og:description", content=description),
        html_meta(prop="og:url", content=url),
        html_meta(name="twitter:card", content="summary_large_image" if image else "summary"),
        html_meta(name="twitter:title", content=title),
        html_meta(name="twitter:description", content=description),
    ]
    if image:
        lines.append(html_meta(prop="og:image", content=DOMAIN + image))
        lines.append(html_meta(name="twitter:image", content=DOMAIN + image))

    website = {"@id": SITE_ID}
    org = {"@id": ORG_ID}
    if route == "/":
        schema = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebSite",
                    "@id": SITE_ID,
                    "url": DOMAIN + "/",
                    "name": BRAND,
                    "alternateName": ["토헤샤", "tohesar.com"],
                    "inLanguage": "ko-KR",
                    "publisher": org,
                },
                {
                    "@type": "Organization",
                    "@id": ORG_ID,
                    "name": BRAND,
                    "url": DOMAIN + "/",
                    "logo": DOMAIN + "/assets/wordmark.svg",
                },
            ],
        }
    else:
        is_article = page["kind"] == "article"
        schema = {
            "@context": "https://schema.org",
            "@type": "Article" if is_article else "WebPage",
            "@id": url + "#article" if is_article else url + "#webpage",
            "url": url,
            "inLanguage": "ko-KR",
            "headline" if is_article else "name": page.get("headline") or title,
            "description": description,
            "isPartOf": website,
        }
        if is_article:
            schema["author"] = org
            schema["publisher"] = org
            if page.get("date"):
                schema["datePublished"] = page["date"]
            if image:
                schema["image"] = DOMAIN + image

    json_ld = json.dumps(schema, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
    lines.append('<script type="application/ld+json" data-tohesar-seo="034">' + json_ld + "</script>")
    return "\n".join(lines)


def clean_head(head: str, indexed: bool) -> str:
    head = re.sub(
        r"<!-- TOHESAR SEO:BEGIN -->.*?<!-- TOHESAR SEO:END -->\s*",
        "", head, flags=re.S,
    )
    # Remove obsolete directives regardless of attribute order.
    def strip_old(match: re.Match) -> str:
        tag = match.group(0)
        if re.search(r'\bname\s*=\s*["\']robots["\']', tag, re.I):
            return ""
        if re.search(r'\brel\s*=\s*["\']canonical["\']', tag, re.I):
            return ""
        if indexed and re.search(r'\b(?:name|property)\s*=\s*["\'](?:og:|twitter:)', tag, re.I):
            return ""
        if indexed and re.search(r'\bname\s*=\s*["\']description["\']', tag, re.I):
            return ""
        return tag

    return re.sub(r"<(?:meta|link)\b[^>]*>", strip_old, head, flags=re.I)


def transform(markup: str, root: Path, route: str, pages: dict) -> str:
    match = re.search(r"(<head\b[^>]*>)(.*?)(</head\s*>)", markup, re.I | re.S)
    if not match:
        if route in pages:
            raise ValueError("Published page has no <head>: " + route)
        return markup

    indexed = route in pages
    head = clean_head(match.group(2), indexed)
    # Legacy article builders reinsert style tags and leave an additional blank
    # line in <head> on every rebuild. Normalize only inter-tag whitespace so
    # repeated builds are byte-for-byte stable without changing styles/content.
    head = re.sub(r"(?<=>)\n[ \t]*\n+(?=[ \t]*<)", "\n", head)
    block = (
        meta_block(root, route, pages[route], title_of(markup))
        if indexed
        else '<meta name="robots" content="noindex,follow">'
    )
    addition = "\n<!-- TOHESAR SEO:BEGIN -->\n" + block + "\n<!-- TOHESAR SEO:END -->\n"
    updated_head = head.rstrip() + addition
    return markup[: match.start(2)] + updated_head + markup[match.end(2) :]


def sitemap(pages: dict) -> str:
    order = ["/"] + sorted(route for route in pages if route != "/")
    urls = "".join(
        "  <url><loc>" + xml_escape(DOMAIN + route) + "</loc></url>\n"
        for route in order
    )
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + urls + "</urlset>\n"
    )


def run(root: Path, check: bool) -> None:
    pages = published_pages(root)
    changed, excluded = 0, 0
    for path in sorted(root.rglob("*.html")):
        relative = path.relative_to(root)
        if any(part in {".git", ".github", "docs", "_site", "node_modules"} for part in relative.parts):
            continue
        route = url_path(path, root)
        source = path.read_text(encoding="utf-8")
        updated = transform(source, root, route, pages)
        if route not in pages:
            excluded += 1
        if updated != source:
            if check:
                raise ValueError("SEO metadata out of date: " + str(relative))
            path.write_text(updated, encoding="utf-8")
            changed += 1

    xml = sitemap(pages)
    sitemap_file = root / "sitemap.xml"
    previous = sitemap_file.read_text(encoding="utf-8") if sitemap_file.exists() else ""
    if previous != xml:
        if check:
            raise ValueError("Sitemap is out of date")
        sitemap_file.write_text(xml, encoding="utf-8")
        changed += 1

    print(f"SEO {'CHECK' if check else 'BUILD'} PASS: {len(pages)} canonical pages, "
          f"{excluded} preserved legacy HTML pages excluded from search, "
          f"{changed} files {'out of date' if check else 'updated'}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--check", action="store_true", help="assert metadata and sitemap are up to date without writing")
    options = parser.parse_args()
    run(options.root.resolve(), options.check)
