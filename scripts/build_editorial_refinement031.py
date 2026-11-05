"""Apply quiet reading layouts using the existing publication records as authority."""
from html import escape
from pathlib import Path
import json, re
ROOT = Path(__file__).resolve().parents[1]
STYLE = '<link rel="stylesheet" href="/journal/assets/editorial-refinement031.css">'

def build():
    items = {i['id']: i for i in json.loads((ROOT/'journal/data/content-index.json').read_text())['items']}
    issues = json.loads((ROOT/'journal/data/issues.json').read_text())['issues']
    for ident in ('ferrari-f40', 'alfa-romeo-giulia', 'jaguar-type-01'):
        item = items[ident]
        # Membership comes from the actual published issue, not an invented article number.
        memberships = [i for i in issues if i['status']=='published' and any(c['content_id']==ident for c in i['chapters'])]
        issue = memberships[0] if memberships else None
        path = ROOT / item['url'].strip('/') / 'index.html'
        s = path.read_text()
        s = s.replace(STYLE, '').replace('</head>', STYLE+'</head>', 1)
        s = s.replace('/journal/assets/travel.js?v=030b', '/journal/assets/travel.js?v=031')
        s = s.replace('<script src="/journal/assets/miniature-paper.js" defer></script>', '')
        s = s.replace('<script src="/journal/assets/wallpaper011.js" defer></script>', '')
        s = re.sub(r'<meta name="tohesar:(?:article-id|published-at|issue)"[^>]*>', '', s)
        metadata = f'<meta name="tohesar:article-id" content="{escape(ident)}"><meta name="tohesar:published-at" content="{escape(item["published_at"])}">'
        if issue: metadata += f'<meta name="tohesar:issue" content="{escape(issue["id"])}">'
        s = s.replace('</head>', metadata+'</head>', 1)
        date = escape(item['published_at'].replace('-', '.'))
        if ident == 'ferrari-f40':
            hero = (ROOT/'journal/partials/f40-hero-fresh.html').read_text().strip()
            s, count = re.subn(r'<figure class="f40-hero">.*?</figure>', lambda _: hero, s, count=1, flags=re.S)
            assert count == 1, 'Missing F40 hero'
            s = re.sub(r'(<div class="story-topline">).*?(</div>)', r'\1<span>' + ('ISSUE '+escape(issue['number']) if issue else '저널') + r'</span><span>'+date+r'</span>\2', s, count=1, flags=re.S)
            s = re.sub(r'<span>2026\.10\.28 · 약 4분</span>', '<span>약 4분</span>', s)
            s = re.sub(r'<div class="chapter-side">.*?</div>', '', s, flags=re.S)
            s = re.sub(r'<aside class="shape-note">.*?</aside>\s*', '', s, flags=re.S)
            s = re.sub(r'<div class="air-notes">.*?</div>', '', s, count=1, flags=re.S)
        elif ident == 'alfa-romeo-giulia':
            folio = ('ISSUE '+escape(issue['number'])) if issue else '저널'
            s = re.sub(r'(<div class="giulia-folio">).*?(</div>)', r'\1<span>'+folio+r'</span><span>'+date+r'</span>\2', s, count=1, flags=re.S)
        else:
            s = re.sub(r'(<div class="type-topline">).*?(</div>)', r'\1<span>' + ('ISSUE '+escape(issue['number']) if issue else '저널') + r'</span><span>'+date+r'</span>\2', s, count=1, flags=re.S)
            # Duplicated visual observations are already fully expressed in the comparison below.
            s = re.sub(r'<div class="study-observations027">.*?</div>', '', s, count=1, flags=re.S)
        s = re.sub(r'<aside class="article-return026".*?</aside>\s*', '', s, flags=re.S)
        s = re.sub(r'<p class="wallpaper-provenance">.*?</p>', '', s, flags=re.S)
        path.write_text(s)
    print('Editorial refinement 031: publication metadata and reading layouts applied.')

if __name__ == '__main__': build()
