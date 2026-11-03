import json
from pathlib import Path
import tempfile
import unittest

import editorial_system as editorial
from editorial_review_job import make_review


class ReviewPackageTests(unittest.TestCase):
    def test_package_is_review_only_and_does_not_change_editorial_data(self):
        original = editorial.DATA.read_bytes()
        brief = {'slug': 'review-job-test', 'title': '시안', 'body': ['도입', '본문'],
                 'hero': {'src': '/journal/assets/design/type01-arrival-800.webp', 'alt': '차량',
                          'credit': '제공자', 'source_url': 'https://example.org/source',
                          'licence_url': 'https://example.org/licence'},
                 'sources': [{'label': '출처', 'url': 'https://example.org/source'}]}
        with tempfile.TemporaryDirectory(dir=editorial.ROOT / 'journal/inbox') as inbox, tempfile.TemporaryDirectory() as temp:
            source = Path(inbox) / 'candidate.json'
            source.write_text(json.dumps(brief), encoding='utf-8')
            output = Path(temp) / 'review'
            page = make_review(source, output)
            self.assertIn('noindex,nofollow', page.read_text())
            self.assertEqual(json.loads((output / 'review-story.json').read_text())['status'], 'review')
            self.assertTrue((output / 'journal/assets/design/type01-arrival-800.webp').is_file())
            self.assertEqual(editorial.DATA.read_bytes(), original)

    def test_refuses_files_outside_inbox(self):
        with tempfile.TemporaryDirectory() as temp:
            source = Path(temp) / 'input.json'
            source.write_text('{}')
            with self.assertRaisesRegex(ValueError, 'inside journal/inbox'):
                make_review(source, Path(temp) / 'output')


if __name__ == '__main__':
    unittest.main()
