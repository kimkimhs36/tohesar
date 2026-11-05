"""Render the shared navigation after all page generators have run."""
from pathlib import Path
import re
ROOT = Path(__file__).resolve().parents[1]
nav = (ROOT / 'journal/partials/navigation.html').read_text().strip()
footer = (ROOT / 'journal/partials/footer-navigation.html').read_text().strip()
shortcuts = '<nav class="site-shortcuts" aria-label="주요 메뉴"><a href="/journal/">저널</a><a href="/owner-stories/">차주 이야기</a></nav>'
transition = '<style data-navigation-transition>@view-transition{navigation:auto}</style>'
shortcut_pages = {'index.html', 'journal/index.html', 'journal/911/index.html', 'journal/f40/index.html', 'journal/design/giulia/index.html', 'journal/design/type-01/index.html'}
files = ['index.html', 'journal/index.html', 'journal/911/index.html', 'journal/f40/index.html', 'journal/news/index.html', 'journal/visual/index.html', 'journal/miniatures/index.html', 'journal/design/index.html', 'journal/design/type-01/index.html', 'journal/design/giulia/index.html', 'journal/issues/index.html', 'journal/yokohama/index.html', 'journal/explore/index.html', 'sitemap/index.html', 'edition/index.html', 'edition/news/index.html', 'edition/archive/index.html']
files += [str(p.relative_to(ROOT)) for p in (ROOT / 'journal/issues').glob('*/index.html')]
files += [str(p.relative_to(ROOT)) for p in (ROOT / 'journal/stories').glob('*/index.html')]
files += [str(p.relative_to(ROOT)) for p in (ROOT / 'edition/story').glob('*/index.html')]
for page in files:
    p = ROOT / page
    if not p.exists(): continue
    s = p.read_text()
    # Register the opt-in while the head is parsed, before external CSS can
    # delay it beyond a cross-document navigation's incoming snapshot.
    s = s.replace(transition, '')
    s, count = re.subn(r'<head(?:\s[^>]*)?>', lambda m: m[0] + transition, s, count=1)
    assert count == 1, f'Missing document head: {page}'
    s = re.sub(re.escape(transition) + r'\n[ \t]*\n+', lambda _: transition + '\n', s)
    if re.search(r'<details\b(?=[^>]*class="journal-index")', s):
        s = re.sub(r'<details\b(?=[^>]*class="journal-index")[^>]*>.*?</details>', lambda _: nav, s, flags=re.S)
    elif 'class="menu-panel"' in s:
        s = re.sub(r'<div class="menu-panel".*?</div>', '', s, flags=re.S)
        s = re.sub(r'<button[^>]*class="menu-button"[^>]*>.*?</button>', '', s, flags=re.S)
        s = s.replace('</header>', nav + '</header>', 1)
    elif 'class="city-nav"' in s:
        s = re.sub(r'<header class="city-nav">(.*?)</header>', lambda m: '<header class="city-nav">' + re.sub(r'<nav\b[^>]*>.*?</nav>', '', m.group(1), flags=re.S) + nav + '</header>', s, count=1, flags=re.S)
    elif 'class="article-bar"' in s:
        s = s.replace('</header>', nav + '</header>', 1)
    else:
        s = re.sub(r'<a class="cover-return".*?</a>', lambda _: nav, s, flags=re.S)
    if page in shortcut_pages:
        # The short links remain ordinary anchors, including when JavaScript is off.
        s = re.sub(r'<nav class="site-shortcuts"[^>]*>.*?</nav>', '', s, flags=re.S)
        s = s.replace('<details class="journal-index">', shortcuts + '<details class="journal-index">', 1)
    s = re.sub(r'<a\b[^>]*class="(?:header-journal|nav-journal|article-return)"[^>]*>.*?</a>', '', s, flags=re.S)
    if '/journal/assets/navigation.css' not in s:
        s = s.replace('</head>', '<link rel="stylesheet" href="/journal/assets/navigation.css"></head>')
    # Browsers can keep the shared chrome for ten minutes on Pages. Changing
    # the version here makes a new navigation layout arrive with its markup.
    s = re.sub(r'/journal/assets/navigation\.css(?:\?v=[A-Za-z0-9._-]+)?', '/journal/assets/navigation.css?v=20261105b', s)
    s = re.sub(r'/journal/assets/travel\.css(?:\?v=[A-Za-z0-9._-]+)?', '/journal/assets/travel.css?v=20261105b', s)
    if '/journal/assets/navigation.js' not in s:
        s = s.replace('</head>', '<script src="/journal/assets/navigation.js" defer></script></head>')
    # Only article interiors receive motion. The cinematic cover and openings remain authored.
    # Article builders reconstruct <head>; restore the approved reading layer last,
    # after 014 artwork, rather than depending on a previously generated HTML file.
    if 'beauty014-' in s and page != 'journal/index.html':
        if '/journal/assets/unified018.css' not in s:
            s = s.replace('</head>', '<link rel="stylesheet" href="/journal/assets/unified018.css"></head>')
        if '/journal/assets/miniature-paper.js' not in s:
            s = s.replace('</head>', '<script src="/journal/assets/miniature-paper.js" defer></script></head>')
    article_pages = ('journal/911/', 'journal/f40/', 'journal/design/giulia/', 'journal/design/type-01/', 'journal/yokohama/', 'journal/stories/', 'edition/story/')
    if page.startswith(article_pages):
        if '/journal/assets/article-motion.css' not in s:
            s = s.replace('</head>', '<link rel="stylesheet" href="/journal/assets/article-motion.css"></head>')
        if '/journal/assets/article-motion.js' not in s:
            s = s.replace('</head>', '<script src="/journal/assets/article-motion.js" defer></script></head>')
    s = re.sub(r'<nav aria-label="하단 메뉴"[^>]*>.*?</nav>', lambda _: footer, s, flags=re.S)
    p.write_text(s)
print('Rendered shared navigation.')
