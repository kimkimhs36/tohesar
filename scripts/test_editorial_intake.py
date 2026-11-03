import unittest
import json
import tempfile
import shutil
from concurrent.futures import ThreadPoolExecutor
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
            shutil.copyfile(Path(__file__).resolve().parents[1] / 'journal/assets/design/type01-arrival-800.webp', root / 'example.webp')
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

    def test_glossary_survives_intake_and_is_validated(self):
        brief = {**self.brief, 'glossary': [{'term':'둘째', 'definition':'둘째의 뜻', 'source_url':'https://example.org/source'}]}
        with patch('editorial_intake.editorial.image_check'):
            story = editorial_intake.prepare(brief)
        self.assertEqual(story['glossary'], brief['glossary'])
        self.assertEqual(story['status'], 'review')
        with patch('editorial_intake.editorial.image_check'), self.assertRaises(ValueError):
            editorial_intake.prepare({**brief, 'glossary': [{'term':'없는 단어', 'definition':'뜻', 'source_url':'https://example.org'}]})

    def test_publication_claim_rejected(self):
        for field in ('status', 'verification'):
            with self.subTest(field=field), self.assertRaises(ValueError):
                editorial_intake.prepare({**self.brief, field:'published'})

    def test_missing_factual_source_is_review_only(self):
        with patch('editorial_intake.editorial.image_check'):
            story = editorial_intake.prepare({**self.brief, 'sources':[]})
            self.assertEqual(story['status'], 'review')
            story['verification'] = {'status':'verified', 'reviewer':'editor', 'note':'reviewed', 'verified_at':'2020-01-01'}
            with self.assertRaises(ValueError):
                editorial_intake.editorial.validate_story(story, publish=True)

    def test_multiple_chapters_and_photographs_are_rendered(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            shutil.copyfile(Path(__file__).resolve().parents[1] / 'journal/assets/design/type01-arrival-800.webp', root / 'example.webp')
            partials = root / 'journal/partials'
            partials.mkdir(parents=True)
            for name in ('navigation.html', 'footer-navigation.html'):
                (partials / name).write_text('<nav></nav>')
            brief = {k: v for k, v in self.brief.items() if k != 'body'}
            brief.update(lead='첫 관찰', chapters=[
                {'heading':'비례', 'paragraphs':['첫 장 본문'], 'composition':'offset', 'image':self.brief['hero']},
                {'heading':'표면', 'paragraphs':'둘째 장 본문', 'composition':'inset'}])
            with patch.object(editorial_intake.editorial, 'ROOT', root):
                story = editorial_intake.prepare(brief)
                html = editorial_intake.editorial.render(story, preview=True)
            self.assertEqual(story['status'], 'review')
            self.assertIn('data-composition="offset"', html)
            self.assertIn('data-composition="inset"', html)
            self.assertEqual(html.count('>사진 출처</a>'), 2)
            self.assertIn('noindex,nofollow', html)

    def test_simple_photo_sequence_and_direction_stay_review_only(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            shutil.copyfile(Path(__file__).resolve().parents[1] / 'journal/assets/design/type01-arrival-800.webp', root / 'example.webp')
            partials = root / 'journal/partials'; partials.mkdir(parents=True)
            for name in ('navigation.html', 'footer-navigation.html'):
                (partials / name).write_text('<nav></nav>')
            brief = {**self.brief, 'photos':[self.brief['hero'], self.brief['hero']],
                     'paper':'sage', 'art_direction':{'opening':'offset', 'car':'coral', 'miniatures':'trace', 'placement':'reading'}}
            with patch.object(editorial_intake.editorial, 'ROOT', root):
                story = editorial_intake.prepare(brief)
                html = editorial_intake.editorial.render(story, preview=True)
                self.assertEqual(html.count('>사진 출처</a>'), 3)
                self.assertLess(html.index('class="es-hero"'), html.index('class="es-opening"'))
                self.assertIn('data-opening="offset"', html)
                self.assertIn('data-miniature-car="coral"', html)
                self.assertEqual(story['status'], 'review')
                with self.assertRaises(ValueError): editorial_intake.editorial.render(story)
                with self.assertRaises(ValueError): editorial_intake.prepare({**brief, 'photos':[{'src':'/example.webp'}]})
                with self.assertRaises(ValueError): editorial_intake.prepare({**brief, 'art_direction':{'opening':'invalid'}})

    def test_incomplete_chapter_or_ambiguous_body_is_rejected(self):
        brief = {k: v for k, v in self.brief.items() if k != 'body'}
        brief.update(lead='도입', chapters=[{'heading':'제목', 'paragraphs':['본문'], 'image':{}}])
        with patch('editorial_intake.editorial.image_check'):
            with self.assertRaises(ValueError): editorial_intake.prepare(brief)
            brief['chapters'][0].pop('image')
            brief['chapters'][0]['composition'] = 'unknown'
            with self.assertRaises(ValueError): editorial_intake.prepare(brief)
            brief['body'] = ['본문']
            with self.assertRaises(ValueError): editorial_intake.prepare(brief)

    def test_parallel_intakes_do_not_lose_articles_and_failed_write_rolls_back(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            data = root / 'journal/data/editorial-stories.json'
            data.parent.mkdir(parents=True)
            data.write_text(json.dumps({'schema':1, 'stories':[]}), encoding='utf-8')
            shutil.copyfile(Path(__file__).resolve().parents[1] / 'journal/assets/design/type01-arrival-800.webp', root / 'example.webp')
            partials = root / 'journal/partials'
            partials.mkdir(parents=True)
            for name in ('navigation.html', 'footer-navigation.html'):
                (partials / name).write_text('<nav></nav>')
            with patch.object(editorial_intake.editorial, 'ROOT', root), patch.object(editorial_intake.editorial, 'DATA', data):
                briefs = [{**self.brief, 'slug': f'story-{n}'} for n in range(8)]
                with ThreadPoolExecutor(max_workers=8) as pool:
                    list(pool.map(editorial_intake.intake, briefs))
                self.assertEqual(len(json.loads(data.read_text())['stories']), 8)
                with patch('editorial_intake.os.replace', side_effect=OSError('disk failure')):
                    with self.assertRaises(OSError):
                        editorial_intake.intake({**self.brief, 'slug':'failure'})
                self.assertFalse((root / '.editorial-preview/failure/index.html').exists())
                self.assertEqual(len(json.loads(data.read_text())['stories']), 8)

if __name__ == '__main__': unittest.main()
