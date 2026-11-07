"""Regression coverage for the generated home, article scripts and shared navigation."""
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]

class IntegrationGenerationTests(unittest.TestCase):
    def test_history_placeholder_matches_readable_catalog(self):
        continuity = (ROOT / 'journal/assets/reading-continuity.js').read_text(encoding='utf-8')
        presence = (ROOT / 'journal/partials/journal-resume-presence.html').read_text(encoding='utf-8')
        catalog_paths = set(re.findall(r"^\s*'(/journal/[^']+/)':\{", continuity, re.M))
        pending_paths = set(re.findall(r"'(/journal/[^']+/)'", presence))
        self.assertTrue(catalog_paths)
        self.assertEqual(catalog_paths, pending_paths)

    def test_home_and_article_survive_repeat_generation(self):
        paths = [
            'index.html', 'journal/index.html', 'journal/explore/index.html',
            'sitemap/index.html', 'journal/design/giulia/index.html',
            'owner-stories/index.html', 'owner-stories/story-card/index.html',
            'journal/field-notes/001/index.html', 'journal/issues/001/index.html',
            'scripts/build_editorial025.py', 'scripts/build_journal_navigation.py',
        ]
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for name in paths:
                target = root / name
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(ROOT / name, target)
            shutil.copytree(ROOT / 'journal/partials', root / 'journal/partials')
            for iteration in range(2):
                for script in ('build_editorial025.py', 'build_journal_navigation.py'):
                    subprocess.run([sys.executable, '-X', 'utf8', str(root / 'scripts' / script)], check=True, capture_output=True)
                home = (root / 'index.html').read_text(encoding='utf-8')
                journal = (root / 'journal/index.html').read_text(encoding='utf-8')
                article = (root / 'journal/design/giulia/index.html').read_text(encoding='utf-8')
                owner = (root / 'owner-stories/index.html').read_text(encoding='utf-8')
                field = (root / 'journal/field-notes/001/index.html').read_text(encoding='utf-8')
                issue = (root / 'journal/issues/001/index.html').read_text(encoding='utf-8')
                self.assertIn('data-reading-feature', home)
                self.assertIn('/journal/field-notes/001/', home)
                self.assertIn('/owner-stories/', home)
                self.assertIn('/journal/field-notes/001/', journal)
                self.assertEqual(journal.count('data-journal-resume'), 1)
                self.assertEqual(journal.count('data-reading-presence'), 1)
                self.assertEqual(journal.count('/journal/assets/reading-continuity.js'), 1)
                self.assertEqual(journal.count('/journal/assets/reading-journal.css'), 1)
                self.assertEqual(article.count('/journal/assets/reading-continuity.js'), 1)
                self.assertEqual(issue.count('/journal/assets/reading-continuity.js'), 1)
                self.assertIn('class="owner-index journal-index"', owner)
                self.assertIn('class="journal-index"', field)
                self.assertIn('자동차 소식', owner)
                self.assertIn('자동차 소식', field)
                if iteration == 0:
                    first = (home, journal, article, owner, field, issue)
                else:
                    self.assertEqual(first, (home, journal, article, owner, field, issue))

if __name__ == '__main__':
    unittest.main()
