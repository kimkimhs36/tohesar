"""Publication and escaping regression tests in a disposable site."""
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import editorial_system as es


class EditorialSystemTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.data = self.root / 'journal/data/editorial-stories.json'
        self.data.parent.mkdir(parents=True)
        self.story = json.loads(es.DATA.read_text())['stories'][0]
        (self.root / 'journal/assets').symlink_to(es.ROOT / 'journal/assets', target_is_directory=True)
        (self.root / 'journal/partials').symlink_to(es.ROOT / 'journal/partials', target_is_directory=True)
        (self.root / 'journal/index.html').write_text('<main>기존 지면</main>')
        self.root_patch = patch.object(es, 'ROOT', self.root); self.root_patch.start()
        self.data_patch = patch.object(es, 'DATA', self.data); self.data_patch.start()
        self.save()

    def tearDown(self):
        self.data_patch.stop(); self.root_patch.stop(); self.tmp.cleanup()

    def save(self):
        self.data.write_text(json.dumps({'schema': 1, 'stories': [self.story]}, ensure_ascii=False))

    def verify(self):
        self.story['status'] = 'published'
        self.story['verification'] = {'status': 'verified', 'reviewer': 'Editor', 'verified_at': '2026-10-29', 'note': 'Sources and image rights checked'}
        self.save()

    def test_review_preview_is_not_public(self):
        es.preview(self.story['slug']); es.build()
        self.assertTrue((self.root / '.editorial-preview/type-01-standard/index.html').exists())
        self.assertIn('class="journal-index"', (self.root / '.editorial-preview/type-01-standard/index.html').read_text())
        self.assertFalse((self.root / 'journal/stories/type-01-standard/index.html').exists())
        self.assertNotIn('type-01-standard', (self.root / 'journal/index.html').read_text())

    def test_unverified_fails_before_writing(self):
        self.story['status'] = 'published'; self.save()
        with self.assertRaisesRegex(ValueError, 'verification required'):
            es.build()
        self.assertEqual((self.root / 'journal/index.html').read_text(), '<main>기존 지면</main>')

    def test_publish_escape_unpublish_and_idempotence(self):
        self.story['title'] = '<script>alert(1)</script>'; self.verify(); es.build()
        page = self.root / 'journal/stories/type-01-standard/index.html'
        self.assertIn('&lt;script&gt;', page.read_text())
        self.assertNotIn('<script>', page.read_text())
        before = (page.read_text(), (self.root / 'journal/index.html').read_text())
        es.build(); self.assertEqual(before, (page.read_text(), (self.root / 'journal/index.html').read_text()))
        self.story['status'] = 'review'; self.save(); es.build()
        self.assertFalse(page.exists())
        self.assertNotIn('type-01-standard', (self.root / 'journal/index.html').read_text())

    def test_existing_authored_page_never_overwritten(self):
        self.verify()
        page = self.root / 'journal/stories/type-01-standard/index.html'
        page.parent.mkdir(parents=True); page.write_text('authored')
        with self.assertRaisesRegex(ValueError, 'refusing to overwrite'):
            es.build()
        self.assertEqual(page.read_text(), 'authored')

    def test_all_three_miniature_modes_render_without_altering_content(self):
        text = self.story['title']
        for mode in ('quiet', 'trace', 'atelier'):
            self.story['art_direction'] = {'miniatures': mode}
            html = es.render(self.story, preview=True)
            self.assertIn(f'data-miniatures="{mode}"', html)
            self.assertIn('data-paper="ivory"', html)
            self.assertIn('name="robots" content="noindex,nofollow"', html)
            self.assertIn('새로운 시대는', html)
            self.assertIn('Jaguar Type 01', html)
            self.assertEqual(text, self.story['title'])
        css = (self.root / 'journal/assets/editorial-system.css').read_text()
        self.assertIn('.es-page[data-miniatures="quiet"]', css)
        self.assertIn('.es-page[data-miniatures="trace"]', css)
        self.assertIn('.es-page[data-miniatures="atelier"]', css)
        self.assertNotIn('.es-page main{background-color:', css)
        self.assertNotIn('.es-lead p,.es-page .es-section-copy{background:', css)

    def test_unknown_miniature_mode_is_rejected_before_publication(self):
        self.story['art_direction'] = {'miniatures': 'all-over'}
        self.save()
        with self.assertRaisesRegex(ValueError, 'invalid miniature art direction'):
            es.preview(self.story['slug'])
        self.assertFalse((self.root / '.editorial-preview/type-01-standard/index.html').exists())
        self.story['status'] = 'published'
        self.story['verification'] = {'status': 'verified', 'reviewer': 'Editor', 'verified_at': '2026-10-29', 'note': 'Checked'}
        self.save()
        with self.assertRaisesRegex(ValueError, 'invalid miniature art direction'):
            es.build()
        self.assertFalse((self.root / 'journal/stories/type-01-standard/index.html').exists())

    def test_invalid_image_or_source_blocks_publication(self):
        self.verify(); self.story['hero']['src'] = '/missing.webp'; self.save()
        with self.assertRaises(ValueError): es.build()
        self.story['hero']['src'] = '/journal/assets/design/type01-arrival-1600.webp'
        self.story['sources'][0]['url'] = 'javascript:alert(1)'; self.save()
        with self.assertRaises(ValueError): es.build()

    def test_image_dimensions_are_explicit_and_caption_links_are_identifiable(self):
        image = dict(self.story['hero'])
        image['alt'] = '차량의 "측면"'
        html = es.figure(image, 'es-hero')
        self.assertIn(' 800w, ', html)
        self.assertIn(' 1600w', html)
        self.assertIn('width="1600" height="1178"', html)
        self.assertIn('aria-label="사진 출처: 차량의 &quot;측면&quot;"', html)
        # Intake can omit size metadata: the real local files reserve layout space.
        for key in ('width', 'height', 'src_small_width'):
            image.pop(key)
        inferred = es.figure(image, 'es-hero')
        self.assertIn('width="1600" height="1178"', inferred)
        self.assertIn(' 800w, ', inferred)
        self.assertIn('loading="lazy"', inferred)
        self.assertNotIn('loading="lazy"', es.figure(image, 'es-hero', eager=True))
        self.assertIn('fetchpriority="high"', es.figure(image, 'es-hero', eager=True))
        image['src_small_width'] = 500
        with self.assertRaisesRegex(ValueError, 'small image needs'):
            es.image_check(image)

    def test_intrinsic_dimensions_use_local_photo_headers_and_fail_softly(self):
        import struct
        samples = {
            'test.png': (b'\x89PNG\r\n\x1a\n' + b'\0' * 8 + struct.pack('>II', 640, 480), (640, 480)),
            'test.gif': (b'GIF89a' + struct.pack('<HH', 320, 240), (320, 240)),
            'test.jpg': (b'\xff\xd8\xff\xe0\x00\x04ab\xff\xc2\x00\x07\x08' + struct.pack('>HH', 480, 640), (640, 480)),
            'test.webp': (b'RIFF' + b'\0' * 4 + b'WEBPVP8X' + b'\0' * 8 + (639).to_bytes(3, 'little') + (479).to_bytes(3, 'little'), (640, 480)),
            'bad.jpg': (b'\xff\xd8\xff\xe0\0\0', None),
            'truncated.webp': (b'RIFF\0\0\0\0WEBP', None),
        }
        for name, (data, expected) in samples.items():
            with self.subTest(name=name):
                (self.root / name).write_bytes(data)
                self.assertEqual(es.intrinsic_dimensions('/' + name), expected)
        self.assertIsNone(es.intrinsic_dimensions('/missing.webp'))
        self.assertIsNone(es.intrinsic_dimensions('/../outside.webp'))

    def test_malformed_article_structure_is_rejected(self):
        self.story['chapters'][0]['paragraphs'] = '문단이어야 할 문자열'
        with self.assertRaisesRegex(ValueError, 'paragraphs required'):
            es.validate_story(self.story)
        self.story['chapters'][0]['paragraphs'] = ['본문']
        self.story['sources'] = ['https://example.org']
        with self.assertRaisesRegex(ValueError, 'source must be an object'):
            es.validate_story(self.story)
        self.story['sources'] = [{'label': '원문', 'url': 'https://example.org'}]
        self.story['hero'] = 'image.webp'
        with self.assertRaisesRegex(ValueError, 'image must be an object'):
            es.validate_story(self.story)

    def test_glossary_renders_once_escapes_and_provides_fallback(self):
        self.story['lead'] = '보닛과 보닛의 비례.'
        self.story['glossary'] = [{'term': '보닛', 'definition': '앞쪽 <구조>와 & 표면', 'source_url': 'https://example.org/source?q=1&n=2'}]
        html = es.render(self.story, preview=True)
        self.assertEqual(html.count('class="term-trigger"'), 1)
        self.assertIn('class="term-fallback">보닛</span>', html)
        self.assertIn('앞쪽 &lt;구조&gt;와 &amp; 표면', html)
        self.assertIn('href="https://example.org/source?q=1&amp;n=2"', html)
        self.assertIn('/journal/assets/reader-notes.js', html)
        self.assertIn('aria-controls="editorial-term-1"', html)

    def test_glossary_rejects_bad_or_ambiguous_data(self):
        for glossary in ([{'term':'없는말', 'definition':'설명', 'source_url':'https://example.org'}],
                         [{'term':'자동차', 'definition':'설명', 'source_url':'javascript:alert(1)'}],
                         [{'term':'자동차', 'definition':'설명', 'source_url':'https://example.org'}, {'term':'차', 'definition':'설명', 'source_url':'https://example.org'}],
                         'bad'):
            self.story['glossary'] = glossary
            with self.assertRaises(ValueError): es.validate_story(self.story)

    def test_non_image_file_cannot_be_published_as_photo(self):
        not_photo = self.root / 'article.txt'
        not_photo.write_text('이 파일은 이미지가 아닙니다')
        self.story['hero']['src'] = '/article.txt'
        with self.assertRaisesRegex(ValueError, 'invalid image file'):
            es.validate_story(self.story)

if __name__ == '__main__': unittest.main()
