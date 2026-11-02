"""014 art direction layer. Run after the existing publication builders.

Preserves article copy, photographs, source links and navigation. This source
step reapplies the authored stylesheet if a previous builder regenerates a page.
"""
from pathlib import Path
import re
ROOT = Path(__file__).resolve().parents[1]
CSS = '<link rel="stylesheet" href="/journal/assets/beauty014-editorial.css">'
PAGES = {
 'journal/index.html': 'beauty014-journal',
 'journal/issues/001/index.html': 'beauty014-issue',
 'journal/911/index.html': 'beauty014-curve',
 'journal/f40/index.html': 'beauty014-blade',
 'journal/design/giulia/index.html': 'beauty014-proportion',
 'journal/design/type-01/index.html': 'beauty014-language',
 'journal/miniatures/index.html': 'beauty014-miniatures',
}
def build():
 for name, marker in PAGES.items():
  path = ROOT / name
  text = path.read_text()
  # 015 owns the Journal opening; 014 still owns its standalone publications.
  if name == 'journal/index.html' and 'recovery015-journal' in text:
   continue
  if name == 'journal/issues/001/index.html':
   wp = '<link rel="stylesheet" href="/journal/assets/beauty014-wallpaper.css">'
   text = text.replace(wp, '')
   text = text.replace('</head>', wp + '</head>')
  text = text.replace(CSS, '')
  text = text.replace('</head>', CSS + '</head>')
  text = re.sub(r'<body class="([^"]*)"', lambda m: '<body class="' + ' '.join(dict.fromkeys(m[1].split() + [marker])) + '"', text, count=1)
  path.write_text(text)
 print('Rendered 014 editorial art direction on seven existing publications.')
if __name__ == '__main__':
 build()
