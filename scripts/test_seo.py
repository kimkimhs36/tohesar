"""SEO 034 regression checks for search metadata and archive exclusion."""
import json
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))
import seo

HTML = '<!doctype html><html lang="ko"><head><meta name="robots" content="noindex,nofollow"><title>TOHEŞAR — 독립 저널</title></head><body><h1>자동차를 바라보는 시선</h1></body></html>'


class SeoTests(unittest.TestCase):
    def test_home_is_indexable_named_and_idempotent(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            data = {
                "/": {"description": "TOHEŞAR 자동차 디자인 독립 저널", "image": None, "kind": "section"}
            }
            first = seo.transform(HTML, root, "/", data)
            self.assertIn('content="index,follow,max-image-preview:large"', first)
            self.assertIn('rel="canonical" href="https://tohesar.com/"', first)
            self.assertIn('"alternateName":["토헤샤","tohesar.com"]', first)
            self.assertNotIn("noindex,nofollow", first)
            self.assertEqual(first, seo.transform(first, root, "/", data))
            self.assertEqual(first.split("<body>")[1], HTML.split("<body>")[1])

    def test_legacy_is_preserved_but_not_indexed(self):
        old = HTML.replace("</head>", '<link rel="canonical" href="https://old.example/"></head>')
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            first = seo.transform(old, root, "/world/", {})
            self.assertIn('content="noindex,follow"', first)
            self.assertNotIn('rel="canonical"', first)
            self.assertEqual(first, seo.transform(first, root, "/world/", {}))
            self.assertEqual(first.split("<body>")[1], old.split("<body>")[1])

    def test_sitemap_has_only_canonical_public_routes(self):
        xml = seo.sitemap({"/": {}, "/journal/f40/": {}})
        self.assertIn("https://tohesar.com/journal/f40/", xml)
        self.assertNotIn("www.tohesar.com", xml)
        self.assertNotIn("/world/", xml)
        self.assertEqual(xml.count("<url>"), 2)

    def test_publish_list_is_explicit_and_published_only(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            for route in list(seo.SECTIONS) + ["/journal/f40/"]:
                target = seo.destination(root, route)
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(HTML)
            data = root / "journal/data"
            data.mkdir(parents=True, exist_ok=True)
            (data / "content-index.json").write_text(json.dumps({"items": [
                {"id": "ferrari-f40", "status": "published", "url": "/journal/f40/", "kind": "design-essay", "title": "F40", "summary": "F40 story", "image": None},
                {"id": "draft", "status": "draft", "url": "/journal/secret/", "kind": "design-essay", "title": "Unpublished", "summary": "Draft"},
                {"id": "visual-culture", "status": "published", "url": "/journal/visual/", "kind": "visual-fiction", "title": "Thin page", "summary": "Hold"},
            ]}, ensure_ascii=False))
            (data / "issues.json").write_text('{"issues":[]}')
            pages = seo.published_pages(root)
            self.assertIn("/journal/f40/", pages)
            self.assertNotIn("/journal/secret/", pages)
            self.assertNotIn("/journal/visual/", pages)
            self.assertEqual(pages["/journal/f40/"]["kind"], "article")


if __name__ == "__main__":
    unittest.main()
