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

    def test_invalid_image_or_source_blocks_publication(self):
        self.verify(); self.story['hero']['src'] = '/missing.webp'; self.save()
        with self.assertRaises(ValueError): es.build()
        self.story['hero']['src'] = '/journal/assets/design/type01-arrival-1600.webp'
        self.story['sources'][0]['url'] = 'javascript:alert(1)'; self.save()
        with self.assertRaises(ValueError): es.build()

if __name__ == '__main__': unittest.main()
