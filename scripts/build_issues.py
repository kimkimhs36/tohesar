"""Render editions, archive and journal invitation from one ordered source."""
from html import escape as e
from pathlib import Path
import re
from issue_model import ROOT,validate
from build_wallpaper import scene, attach

def shell(title,description,body,cls='issue-page'):
    nav=(ROOT/'journal/partials/navigation.html').read_text()
    return f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#dcd9e5"><title>{e(title)} — TOHEŞAR</title><meta name="description" content="{e(description)}"><link rel="icon" href="/assets/cedilla-favicon.svg"><link rel="stylesheet" href="/creative/cover-art-max-004/fonts.css"><link rel="stylesheet" href="/journal/assets/journal.css"><link rel="stylesheet" href="/journal/assets/navigation.css"><link rel="stylesheet" href="/journal/assets/travel.css"><link rel="stylesheet" href="/journal/assets/issue008.css"><link rel="stylesheet" href="/journal/assets/art009.css"><script src="/journal/assets/navigation.js" defer></script><script src="/journal/assets/travel.js" defer></script><script src="/journal/assets/issue008.js" defer></script></head><body class="{cls}"><a class="skip" href="#content">본문으로 건너뛰기</a><header class="site-header"><a href="/" data-travel aria-label="TOHEŞAR 커버"><img class="brand" src="/assets/wordmark.svg" alt="TOHEŞAR" width="1109" height="255"></a><a class="header-journal" href="/journal/" data-travel>독립 자동차 문화 저널</a>{nav}</header><main id="content">{body}</main><footer class="edition-footer"><img src="/assets/wordmark.svg" alt="TOHEŞAR" width="1109" height="255"><p>자동차를 바라보는 또 하나의 시선.</p><nav><a href="/journal/" data-travel>Journal ↗</a><a href="/journal/issues/" data-travel>Issue Archive ↗</a><a href="/journal/design/" data-travel>Design Atlas ↗</a><a href="/journal/news/" data-travel>News ↗</a></nav><small>© TOHEŞAR 2026 · INDEPENDENT AUTOMOTIVE CULTURE</small></footer></body></html>'''

def credit(i):
    return f'<figcaption class="edition-credit">{e(i["image_credit"])} · <a href="{e(i["image_source"])}">출처</a>'+ (f' / <a href="{e(i["image_licence"])}">이용 조건</a>' if i['image_licence'].startswith('https:') else '')+'</figcaption>'

def chapter(c,item,n,next_chapter=None):
    model=item.get('model') or 'Miniature Atelier'
    visual=f'<img src="{e(item["image"])}" alt="{e(item["image_alt"])}" width="1600" height="1000" loading="lazy">'
    if c['layout']=='language':
        visual='<img src="/journal/assets/design/type01-profile-1600.webp" alt="Jaguar Type 01의 길고 낮은 옆모습, 제조사 공식 사진" width="1600" height="1067" loading="lazy">'
    identity={'curve':'911','edge':'F40','proportion':'Giulia','language':'Type 01','small':''}[c['layout']]
    plate=f'<div class="chapter-identity" aria-hidden="true"><span>{identity}</span><i>{n:02d}</i></div>' if identity else ''
    annotation='<div class="proportion-register" aria-hidden="true"><span>01 — BONNET</span><span>02 — CABIN</span><span>03 — SHOULDER</span></div>' if c['layout']=='proportion' else ''
    if c['layout']=='small':
        visual=''.join(f'<img src="/journal/assets/miniatures/{file}.webp" alt="TOHEŞAR {label} 오리지널 그래픽" width="1200" height="450" loading="lazy">' for file,label in [('coupe','Lilac Coupé'),('wedge','Coral Wedge'),('gt','Sage Grand Tourer')])
    following=f'<a class="chapter-following" href="#chapter-{n+1:02d}"><span>NEXT / {e(next_chapter["title"])}</span><strong>{e(next_chapter["heading"]).replace(chr(10), " ")}</strong></a>' if next_chapter else ''
    return f'''<section class="edition-chapter chapter-{c['layout']}" id="chapter-{n:02d}" aria-labelledby="chapter-title-{n}"><div class="chapter-folio"><span>{n:02d} / {e(c['title'])}</span><span>{e(model)}</span></div><div class="chapter-spread">{plate}<figure class="chapter-image"><a href="{e(item['url'])}" data-travel aria-label="{e(item['title'])}">{visual}<span class="chapter-mark" aria-hidden="true">{n:02d}</span></a>{annotation}{credit(item)}</figure><div class="chapter-copy"><span class="edition-label">{e(c['title'])}</span><h2 id="chapter-title-{n}">{e(c['heading']).replace(chr(10), '<br>')}</h2><p>{e(c['note'])}</p><a class="edition-link" href="{e(item['url'])}" data-travel>{e(model)} 이야기 읽기 <span>↗</span></a>{'<a class="study-entry" href="/journal/design/giulia/#proportion-study" data-travel>THE PROPORTION STUDY · 비율 관찰하기 ↗</a>' if c['layout']=='proportion' else ''}</div></div><div class="chapter-transition"><p>{e(c['transition'])}</p>{following}</div></section>'''

def invitation(i):
    return f'''<aside class="issue-invitation" aria-label="최신 디지털 에디션"><a href="{i['url']}" data-travel><div class="issue-invite-copy"><span class="edition-label">TOHEŞAR / ISSUE {i['number']} · {i['published_at'].replace('-','.')}</span><h2>{e(i['title'])}</h2><p>{e(i['subtitle'])}</p><span class="edition-link">첫 번째 호 펼치기 ↗</span></div><div class="issue-jacket"><span class="jacket-number" aria-hidden="true">{i['number']}</span><span class="jacket-title" aria-hidden="true">{e(i['title']).replace("THE SHAPE OF DESIRE", "THE SHAPE <i>of Desire</i>")}</span><img src="{i['visual']}" alt="Giulia의 앞쪽 비례를 담은 Vauxford의 사진" width="1600" height="845" loading="lazy"><span class="jacket-foot" aria-hidden="true">TOHEŞAR / AN OBSERVATION JOURNAL</span></div></a><small>{e(i['image_credit'])} · <a href="{e(i['image_source'])}">사진 출처</a> / <a href="{e(i['image_licence'])}">이용 조건</a></small></aside>'''

def build():
    issues,items=validate();published=sorted([i for i in issues if i['status']=='published'],key=lambda i:i['published_at'],reverse=True)
    # Review/draft editions never produce public pages, and stale generated pages are removed on unpublish.
    for i in issues:
        p=ROOT/i['url'].lstrip('/')/'index.html'
        if i['status']!='published':
            if p.exists() and 'data-generated-edition' in p.read_text():p.unlink()
            continue
        contents=''.join(f'<a href="#chapter-{n:02d}"><span>{n:02d}</span>{e(items[c["content_id"]].get("model") or "Miniature Atelier")}</a>' for n,c in enumerate(i['chapters'],1))
        body=f'''<div data-generated-edition="{i['id']}"><header class="edition-opening"><div class="edition-topline"><a href="/journal/issues/" data-travel>THE EDITIONS / {i['number']}</a><time datetime="{i['published_at']}">{i['published_at'].replace('-','.')}</time></div><div class="edition-title"><span class="edition-label">TOHEŞAR ISSUE {i['number']} / AN OBSERVATION JOURNAL</span><h1>{e(i['title']).replace('THE SHAPE OF DESIRE','<span class="title-shape">THE SHAPE</span><span class="title-desire"><i>of</i> Desire</span>')}</h1><p>{e(i['subtitle'])}</p></div><figure class="edition-opening-photo"><img src="{e(i['visual'])}" alt="2017년 촬영한 검은색 Giulia Quadrifoglio의 앞모습과 측면" width="3626" height="1915" fetchpriority="high"><span aria-hidden="true">THE ART OF<br>LOOKING LONGER.</span>{credit(i)}</figure><div class="edition-preface"><span class="edition-label">EDITOR’S LETTER / {e(i.get('editor_note',''))}</span><p>{e(i['intro'])}</p><p>{e(i.get('editorial',''))}</p></div><nav class="edition-contents" aria-label="이 호의 다섯 이야기">{contents}</nav><p class="sequence-note">차례대로 읽어도, 마음이 가는 이야기부터 펼쳐도 좋습니다.</p></header>'''
        for n,c in enumerate(i['chapters'],1):
            spread=chapter(c,items[c['content_id']],n,i['chapters'][n] if n<len(i['chapters']) else None)
            if c['layout']=='curve':spread=scene(spread,'issue-curve','arc')
            elif c['layout']=='small':spread=scene(spread,'issue-small','touring')
            body+=spread
        body+=f'''<section class="edition-closing"><div class="closing-line" aria-hidden="true"><svg viewBox="0 0 600 140" fill="none"><path d="M0 115 C100 115 120 15 260 25 S420 120 600 70"/></svg></div><span class="edition-label">END OF ISSUE {i['number']} / THE LOOK CONTINUES</span><h2>좋은 형태는,<br>다시 보게 한다.</h2><p>다섯 이야기를 지나 돌아온 시선은 처음과 조금 다를 것이다.<br>이제 당신의 눈에 남는 자동차를 찾아볼 차례다.</p><a class="edition-link" href="/journal/design/" data-travel>Design Atlas에서 계속 보기 ↗</a><a class="edition-link" href="/journal/visual/" data-travel>빛과 도시 사이로 ↗</a><a class="edition-link" href="/journal/" data-travel>Journal로 돌아가기 ↗</a></section></div>'''
        p.parent.mkdir(parents=True,exist_ok=True);p.write_text(attach(shell('ISSUE '+i['number']+' — '+i['title'],i['intro'],body)))
    p=ROOT/'journal/issues/index.html';p.parent.mkdir(exist_ok=True)
    p.write_text(shell('The Editions', 'TOHEŞAR의 디지털 매거진 에디션 아카이브.', '<header class="archive-opening"><span class="edition-label">TOHEŞAR / 독립 자동차 문화 저널</span><h1>The<br><i>Editions.</i></h1><p>자동차와 그 주변의 아름다운 것들을<br>하나의 편집 의도로 묶습니다.</p><small>'+f'{len(published):02d} EDITION'+('S' if len(published)!=1 else '')+' / 발행된 호</small></header><div class="archive-editions">'+''.join(invitation(i) for i in published)+'</div>','issue-page archive-page'))
    p=ROOT/'journal/index.html';s=p.read_text();markup=invitation(published[0]) if published else ''
    if '<!-- ISSUE:START -->' not in s:s=s.replace('<section class="latest ', '<!-- ISSUE:START --><!-- ISSUE:END --><section class="latest ',1)
    s=re.sub(r'<!-- ISSUE:START -->.*?<!-- ISSUE:END -->',lambda _:f'<!-- ISSUE:START -->{markup}<!-- ISSUE:END -->',s,flags=re.S)
    if 'recovery015-journal' not in s:
        if '/journal/assets/issue008.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="/journal/assets/issue008.css"></head>')
        if '/journal/assets/art009.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="/journal/assets/art009.css"></head>')
    s=s.replace('<body>', '<body class="journal-home">')
    p.write_text(s)
    print(f'Rendered {len(published)} editions, archive and journal invitation.')
if __name__=='__main__':build()
