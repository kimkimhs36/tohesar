import unittest
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

    def test_publication_claim_rejected(self):
        for field in ('status', 'verification'):
            with self.subTest(field=field), self.assertRaises(ValueError):
                editorial_intake.prepare({**self.brief, field:'published'})

    def test_missing_source_rejected(self):
        with patch('editorial_intake.editorial.image_check'), self.assertRaises(ValueError):
            editorial_intake.prepare({**self.brief, 'sources':[]})

if __name__ == '__main__': unittest.main()
