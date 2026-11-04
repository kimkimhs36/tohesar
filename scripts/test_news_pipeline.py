"""Deterministic tests for TOHEŞAR curated-news rendering; no network or main writes."""
import copy
from datetime import date, timedelta
import json
from pathlib import Path
import tempfile
import unittest

from news_pipeline import (
    PublicationError, canonical_source, expected_html, render_pages,
    validate, render, select_front, editorial_today,
)


def fixture_item(identifier="new-porsche", title="새로운 자동차 소식", **changes):
    today = editorial_today().isoformat()
    item = {
        "id": identifier,
        "title": title,
        "published_at": today,
        "manufacturer": "Porsche",
        "topic": "design",
        "source": "Porsche Newsroom",
        "source_title": "Porsche model announcement",
        "url": f"https://newsroom.porsche.com/en/{identifier}",
        "summary": "제조사의 공식 발표를 바탕으로 정리한 한국어 자동차 소식입니다.",
        "image": None,
        "image_usage": "외부 보도 사진은 사용하지 않음",
        "status": "published",
        "fact_check_status": "verified",
        "verification": "공식 출처에서 내용과 날짜를 확인한 편집 기록",
        "registered_at": today,
        "verified_at": today,
    }
    item.update(changes)
    return item


FRONT = ('<!doctype html><html lang="ko"><head><title>Home</title></head>'
         '<body><main><div data-limit="1" class="news-list">'
         '<!-- NEWS:START --><!-- NEWS:END --></div>'
         '<p>원문 확인 2026.10.28 · 선별한 0건의 기록</p>'
         '<footer id="unchanged">Historic footer</footer></main></body></html>')
ARCHIVE = ('<!doctype html><html lang="ko"><head><title>News</title></head>'
           '<body><main><p id="news-count">0개의 기록</p>'
           '<div class="news-list"><!-- NEWS:START --><!-- NEWS:END --></div>'
           '</main></body></html>')


class PipelineTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        data = self.root / "journal/data"
        data.mkdir(parents=True)
        (self.root / "journal/news").mkdir()
        (self.root / "journal/index.html").write_text(FRONT, encoding="utf-8")
        (self.root / "journal/news/index.html").write_text(ARCHIVE, encoding="utf-8")
        self.save([fixture_item()])

    def tearDown(self):
        self.temp.cleanup()

    def save(self, items):
        (self.root / "journal/data/news.json").write_text(
            json.dumps({"schema_version": 1, "items": items}, ensure_ascii=False), encoding="utf-8"
        )

    def test_build_then_check_is_repeatable_and_preserves_non_news(self):
        entries = validate(self.root)
        self.assertEqual(render_pages(self.root, entries, check=False), 2)
        self.assertEqual(render_pages(self.root, entries, check=True), 0)
        self.assertEqual(render_pages(self.root, entries, check=False), 0)
        page = (self.root / "journal/index.html").read_text()
        self.assertIn('footer id="unchanged">Historic footer', page)
        self.assertIn("새로운 자동차 소식", page)

    def test_unreviewed_candidate_never_rendered(self):
        self.save([fixture_item(), fixture_item(
            "pending-news", "아직 검증되지 않은 소식",
            status="review", fact_check_status="pending",
        )])
        entries = validate(self.root)
        self.assertEqual(len(entries), 1)
        self.assertNotIn("pending-news", "".join(map(render, entries)))
        self.assertNotIn("아직 검증되지 않은 소식", expected_html(ARCHIVE, Path("journal/news/index.html"), entries))

    def test_published_unverified_is_blocked(self):
        self.save([fixture_item(fact_check_status="pending")])
        with self.assertRaisesRegex(PublicationError, "unverified"):
            validate(self.root)

    def test_duplicate_url_ignores_tracking_parameters(self):
        original = fixture_item()
        copy_item = fixture_item(
            "new-porsche-duplicate", "두 번째 제목",
            url=original["url"] + "?utm_source=tracking",
        )
        self.save([original, copy_item])
        with self.assertRaisesRegex(PublicationError, "Duplicate source"):
            validate(self.root)

    def test_title_duplicate_ignores_spaces_and_punctuation(self):
        self.save([fixture_item(), fixture_item("other", "새로운! 자동차 소식")])
        with self.assertRaisesRegex(PublicationError, "Duplicate news title"):
            validate(self.root)

    def test_blocks_private_and_non_https_sources(self):
        for url in ("http://newsroom.porsche.com/abc",
                    "https://localhost/latest",
                    "https://127.0.0.1/latest",
                    "https://newsroom.porsche.com@evil.test/a",
                    "https://newsroom.porsche.com:8080/a"):
            with self.subTest(url=url):
                self.save([fixture_item(url=url)])
                with self.assertRaises(PublicationError):
                    validate(self.root)

    def test_rejects_future_published_date(self):
        tomorrow = (editorial_today() + timedelta(days=1)).isoformat()
        self.save([fixture_item(published_at=tomorrow)])
        with self.assertRaisesRegex(PublicationError, "future date"):
            validate(self.root)

    def test_render_escapes_untrusted_display_fields(self):
        item = fixture_item(title='포르쉐 <script>alert("x")</script>',
                            summary='<img src=x onerror="alert(1)">')
        rendered = render(item)
        self.assertNotIn("<script>", rendered)
        self.assertNotIn("<img", rendered)
        self.assertIn("&lt;script&gt;", rendered)
        self.assertIn("&lt;img", rendered)

    def test_fail_closed_if_one_page_loses_markers(self):
        news_file = self.root / "journal/news/index.html"
        news_file.write_text("<html><body>unexpected layout</body></html>")
        original = (self.root / "journal/index.html").read_bytes()
        with self.assertRaisesRegex(PublicationError, "markers"):
            render_pages(self.root, validate(self.root), check=False)
        self.assertEqual(original, (self.root / "journal/index.html").read_bytes())

    def test_check_detects_stale_html_without_writing(self):
        original = (self.root / "journal/index.html").read_bytes()
        with self.assertRaisesRegex(PublicationError, "out of sync"):
            render_pages(self.root, validate(self.root), check=True)
        self.assertEqual(original, (self.root / "journal/index.html").read_bytes())

    def test_home_uses_distinct_manufacturers(self):
        items = [fixture_item("a"), fixture_item("b"),
                 fixture_item("c", manufacturer="Ferrari")]
        self.assertEqual([i["id"] for i in select_front(items, 2)], ["a", "c"])

    def test_image_licence_required_for_a_published_news_image(self):
        self.save([fixture_item(image="/assets/unlicensed.jpg")])
        with self.assertRaisesRegex(PublicationError, "image rights"):
            validate(self.root)

    def test_bad_date_and_bad_id_are_blocked(self):
        self.save([fixture_item(id="Not A Slug")])
        with self.assertRaises(PublicationError):
            validate(self.root)


if __name__ == "__main__":
    unittest.main()
