"""Render the shared navigation after all page generators have run."""
from pathlib import Path
import re
ROOT = Path(__file__).resolve().parents[1]
nav = (ROOT / 'journal/partials/navigation.html').read_text().strip()
footer = (ROOT / 'journal/partials/footer-navigation.html').read_text().strip()
shortcuts = '<nav class="site-shortcuts" aria-label="주요 메뉴"><a href="/journal/">저널</a><a href="/owner-stories/">차주 이야기</a></nav>'
transition = '<style data-navigation-transition>@view-transition{navigation:auto}</style>'
# One navigation surface across the published journal, not one per article.
# Newsroom keeps its native search control and the same global menu.
shortcut_pages = {
    'index.html', 'journal/index.html', 'journal/911/index.html',
    'journal/f40/index.html', 'journal/design/giulia/index.html',
    'journal/design/type-01/index.html', 'journal/design/index.html',
    'journal/explore/index.html', 'journal/issues/index.html',
    'journal/miniatures/index.html', 'journal/visual/index.html',
    'journal/yokohama/index.html', 'journal/news/index.html',
    'sitemap/index.html', 'journal/issues/001/index.html',
}
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
    s = re.sub(r'/journal/assets/navigation\.css(?:\?v=[A-Za-z0-9._-]+)?', '/journal/assets/navigation.css?v=20261108', s)
    s = re.sub(r'/journal/assets/travel\.css(?:\?v=[A-Za-z0-9._-]+)?', '/journal/assets/travel.css?v=20261105b', s)
    if '/journal/assets/navigation.js' not in s:
        s = s.replace('</head>', '<script src="/journal/assets/navigation.js?v=20261108" defer></script></head>')
    s = re.sub(r'/journal/assets/navigation\.js(?:\?v=[A-Za-z0-9._-]+)?', '/journal/assets/navigation.js?v=20261108', s)
    # Article generators reconstruct heads; retain the local reading layer.
    reading_pages = {'index.html', 'journal/index.html', 'journal/911/index.html', 'journal/f40/index.html', 'journal/design/giulia/index.html', 'journal/design/type-01/index.html', 'journal/issues/001/index.html'}
    if page == 'journal/index.html':
        # Keep these last and in a stable order when the discovery generator
        # moves its own stylesheet to the end of the head on every build.
        s = re.sub(r'<script\b[^>]*src="/journal/assets/reading-continuity\.js"[^>]*></script>', '', s)
        s = re.sub(r'<link\b[^>]*href="/journal/assets/reading-journal\.css"[^>]*>', '', s)
        s = s.replace('</head>', '<link rel="stylesheet" href="/journal/assets/reading-journal.css"><script src="/journal/assets/reading-continuity.js" defer></script></head>')
    elif page in reading_pages and '/journal/assets/reading-continuity.js' not in s:
        s = s.replace('</head>', '<script src="/journal/assets/reading-continuity.js" defer></script></head>')
    # Match the journal's native cross-document transition on generated pages.
    for asset in ('<link rel="stylesheet" href="/journal/assets/cinematic028.css">', '<script src="/journal/assets/cinematic028.js" blocking="render"></script>'):
        if asset.split('"')[1] not in s:
            s = s.replace('</head>', asset + '</head>', 1)
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
# The participation pages and field essay have bespoke headers, but use the
# same menu content and interaction as the journal. Do not rewrite their body.
for page in ('owner-stories/index.html', 'owner-stories/story-card/index.html', 'journal/field-notes/001/index.html'):
    p = ROOT / page
    if not p.exists():
        continue
    s = p.read_text()
    owner = page.startswith('owner-stories/')
    replacement = nav.replace('class="journal-index"', 'class="owner-index journal-index"', 1) if owner else nav
    pattern = r'<details class="owner-index journal-index">.*?</details>' if owner else r'<details class="journal-index">.*?</details>'
    s, count = re.subn(pattern, lambda _: replacement, s, count=1, flags=re.S)
    assert count == 1, f'Missing shared menu: {page}'
    p.write_text(s)
print('Rendered shared navigation.')
