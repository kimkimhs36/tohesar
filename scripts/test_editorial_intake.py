import unittest
import json
import tempfile
from pathlib import Path
from unittest.mock import patch
import editorial_intake

class EditorialIntakeTest(unittest.TestCase):
    def setUp(self):
        self.brief = {'slug':'sample', 'title':'자동차의 선', 'body':['첫 문단', '둘째 문단'],
            'hero':{'src':'/example.webp','alt':'차량 사진','credit':'사진 제공',
                    'source_url':'https://example.org/photo','licence_url':'https://example.org/rights'},
            'sources':[{'label':'공식 자료','url':'https://example.org/'}]}

    def test_defaults_are_review_only(self):
        with patch('editorial_intake.editorial.image_check'):
            result = editorial_intake.prepare(self.brief)
        self.assertEqual(result['status'], 'review')
        self.assertNotIn('verification', result)
        self.assertEqual(result['lead'], '첫 문단')
        self.assertEqual(result['chapters'][0]['paragraphs'], ['둘째 문단'])

    def test_intake_creates_preview_without_publication_and_blocks_duplicates(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            data = root / 'journal/data/editorial-stories.json'
            data.parent.mkdir(parents=True)
            data.write_text(json.dumps({'schema':1, 'stories':[]}), encoding='utf-8')
            (root / 'example.webp').write_bytes(b'image')
            partials = root / 'journal/partials'
            partials.mkdir(parents=True)
            (partials / 'navigation.html').write_text('<nav></nav>')
            (partials / 'footer-navigation.html').write_text('<nav></nav>')
            with patch.object(editorial_intake.editorial, 'ROOT', root), patch.object(editorial_intake.editorial, 'DATA', data):
                preview = editorial_intake.intake(self.brief)
                self.assertIn('noindex,nofollow', preview.read_text())
                self.assertEqual(json.loads(data.read_text())['stories'][0]['status'], 'review')
                with self.assertRaises(ValueError): editorial_intake.intake(self.brief)
                self.assertFalse((root / 'journal/stories').exists())

    def test_publication_claim_rejected(self):
        for field in ('status', 'verification'):
            with self.subTest(field=field), self.assertRaises(ValueError):
                editorial_intake.prepare({**self.brief, field:'published'})

    def test_missing_source_rejected(self):
        with patch('editorial_intake.editorial.image_check'), self.assertRaises(ValueError):
            editorial_intake.prepare({**self.brief, 'sources':[]})

if __name__ == '__main__': unittest.main()
