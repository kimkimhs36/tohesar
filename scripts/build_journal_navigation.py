"""Render the shared navigation after all page generators have run."""
from pathlib import Path
import re
ROOT = Path(__file__).resolve().parents[1]
nav = (ROOT / 'journal/partials/navigation.html').read_text().strip()
footer = (ROOT / 'journal/partials/footer-navigation.html').read_text().strip()
files = ['index.html', 'journal/index.html', 'journal/911/index.html', 'journal/f40/index.html', 'journal/news/index.html', 'journal/visual/index.html', 'journal/miniatures/index.html', 'journal/design/index.html', 'journal/design/type-01/index.html', 'journal/design/giulia/index.html', 'journal/issues/index.html', 'journal/yokohama/index.html', 'journal/explore/index.html', 'sitemap/index.html', 'edition/index.html', 'edition/news/index.html', 'edition/archive/index.html']
files += [str(p.relative_to(ROOT)) for p in (ROOT / 'journal/issues').glob('*/index.html')]
files += [str(p.relative_to(ROOT)) for p in (ROOT / 'edition/story').glob('*/index.html')]
for page in files:
    p = ROOT / page
    if not p.exists(): continue
    s = p.read_text()
    if re.search(r'<details\b(?=[^>]*class="journal-index")', s):
        s = re.sub(r'<details\b(?=[^>]*class="journal-index")[^>]*>.*?</details>', lambda _: nav, s, flags=re.S)
    elif 'class="menu-panel"' in s:
        s = re.sub(r'<div class="menu-panel".*?</div>', '', s, flags=re.S)
        s = re.sub(r'<button[^>]*class="menu-button"[^>]*>.*?</button>', '', s, flags=re.S)
        s = s.replace('</header>', nav + '</header>', 1)
    elif 'class="article-bar"' in s:
        s = s.replace('</header>', nav + '</header>', 1)
    else:
        s = re.sub(r'<a class="cover-return".*?</a>', lambda _: nav, s, flags=re.S)
    s = re.sub(r'<a\b[^>]*class="(?:header-journal|nav-journal|article-return)"[^>]*>.*?</a>', '', s, flags=re.S)
    if '/journal/assets/navigation.css' not in s:
        s = s.replace('</head>', '<link rel="stylesheet" href="/journal/assets/navigation.css"></head>')
    if '/journal/assets/navigation.js' not in s:
        s = s.replace('</head>', '<script src="/journal/assets/navigation.js" defer></script></head>')
    s = re.sub(r'<nav aria-label="하단 메뉴"[^>]*>.*?</nav>', lambda _: footer, s, flags=re.S)
    p.write_text(s)
print('Rendered shared navigation.')
