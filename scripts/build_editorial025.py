"""Restore the authored discovery surfaces after publication generators.

The COVER 004 section, article openings, copy and rights notices stay untouched.
Run this final presentation step without collecting or publishing new content.
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
STYLE = '<link rel="stylesheet" href="/journal/assets/discovery025.css">'


def build():
    home = ROOT / 'index.html'
    text = home.read_text()
    partial = (ROOT / 'journal/partials/home-editorial025.html').read_text().strip()
    text, count = re.subn(r'<div class="home-editorial" id="content">.*?\n</div>', lambda _: partial, text, count=1, flags=re.S)
    assert count == 1, 'Home editorial boundary missing; refusing to replace another section'
    bridge = '<div class="cover-passage" aria-hidden="true"></div>'
    if bridge not in text:
        text = text.replace('<section class="journal-flow"', bridge + '\n<section class="journal-flow"', 1)
    for asset in ('<link rel="stylesheet" href="/journal/assets/transition026.css">', '<script src="/journal/assets/transition026.js" defer></script>'):
        if asset not in text:
            text = text.replace('</head>', asset + '</head>', 1)
    home.write_text(text)
    journal = ROOT / 'journal/index.html'
    text = journal.read_text()
    text = re.sub(r'<nav\b[^>]*class="section-nav"[^>]*>.*?</nav>', '', text, flags=re.S)
    text = re.sub(r'<link\b[^>]*href="/assets/yokohama-bluehour\.webp"[^>]*/?>', '', text)
    feature = (ROOT / 'journal/partials/journal-feature026.html').read_text().strip()
    text = re.sub(r'<section\b(?=[^>]*class="featured")(?=[^>]*id="featured")[^>]*>.*?</section>', lambda _: feature, text, count=1, flags=re.S)
    # Keep the discovery photographs and their credits together across rebuilds.
    for name in ('f40', 'giulia'):
        cls = 'design-large' if name == 'f40' else 'design-small'
        card = (ROOT / f'journal/partials/journal-card-{name}.html').read_text().strip()
        text, count = re.subn(r'<article class="' + cls + r'">.*?</article>', lambda _: card, text, count=1, flags=re.S)
        assert count == 1, f'Missing journal {name} discovery card'
    city = (ROOT / 'journal/partials/journal-city026.html').read_text().strip()
    text = re.sub(r'<section\b(?=[^>]*class="city-invitation")(?=[^>]*id="places")[^>]*>.*?</section>', lambda _: city, text, count=1, flags=re.S)
    # A continuous run of stories comes before the invitation to a collected issue.
    issue = re.search(r'\s*<!-- ISSUE:START -->.*?<!-- ISSUE:END -->\s*', text, re.S)
    if issue:
        text = text[:issue.start()] + text[issue.end():]
        text = text.replace('<section aria-labelledby="latest-title"', issue.group().strip() + '\n<section aria-labelledby="latest-title"', 1)
    # Keep the three lead stories together, then invite discovery.
    atlas = re.search(r'\s*<aside aria-labelledby="atlas-invite-title".*?</aside>\s*', text, re.S)
    if atlas:
        # Keep the boundary deterministic when another invitation precedes it.
        text = text[:atlas.start()].rstrip() + '\n' + text[atlas.end():].lstrip()
        text = text.replace('<section class="city026"', atlas.group().strip() + '\n<section class="city026"', 1)
    text = text.replace('Design Atlas에서 형태로 탐색하기', '디자인 아틀라스 둘러보기').replace('Design Atlas 펼치기', '디자인 더 보기').replace('Newsroom 펼치기', '뉴스룸 보기').replace('Yokohama 특집 읽기', '요코하마 이야기 읽기').replace('Miniature Atelier 둘러보기', '미니카 아틀리에 둘러보기')
    text = text.replace('src="/journal/assets/giulia/profile-1600.webp" width=', 'src="/journal/assets/giulia/profile-1600.webp" srcset="/journal/assets/giulia/profile-800.webp 800w, /journal/assets/giulia/profile-1600.webp 1600w" sizes="(max-width:700px) calc(100vw - 48px), 38vw" width=')
    journal.write_text(text)
    for name in ('index.html', 'journal/index.html', 'journal/explore/index.html', 'sitemap/index.html'):
        path = ROOT / name
        text = path.read_text().replace(STYLE, '')
        text = text.replace('</head>', STYLE + '</head>')
        if name == 'index.html':
            transition = '<link rel="stylesheet" href="/journal/assets/transition026.css">'
            text = text.replace(transition, '').replace('</head>', transition + '</head>')
        path.write_text(text)
    print('Rendered 025 discovery surfaces; cover and article openings untouched.')


if __name__ == '__main__':
    build()
