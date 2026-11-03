"""Build no-JS discovery and related links from the editorial index + preserved news JSON."""
from pathlib import Path
import argparse, json, re
from html import escape as e
from editorial_system import intrinsic_dimensions
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--atlas-only', action='store_true', help='Rebuild discovery without touching authored articles or news')
args=parser.parse_args()
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'journal/data/content-index.json').read_text())
forms={f['id']:f for f in data['forms']}
items=[dict(i) for i in data['items'] if i['status']=='published']
for n in json.loads((ROOT/data['news_source'].lstrip('/')).read_text())['items']:
    if n['status']!='published': continue
    items.append(dict(id=n['id'],title=n['title'],url='/journal/news/#'+n['id'],kind='news',manufacturer=n['manufacturer'],model=None,published_at=n['published_at'],vehicle_year=None,forms=data.get('news_forms',{}).get(n['id'],[]),summary=n['summary'],image=None,keywords=[n['manufacturer'],n['topic'],n['source_title']],related=[],source_url=n['url'],source_name=n['source']))
assert len({i['id'] for i in items})==len(items),'Duplicate content ID'
labels={'design-essay':'디자인 에세이','visual-fiction':'비주얼 픽션','graphic-collection':'그래픽 컬렉션','news':'뉴스 / 공식 원문'}
for i in items:
    assert all(f in forms for f in i['forms'])
    assert (ROOT/i['url'].split('#')[0].lstrip('/')/'index.html').exists(),i['url']
    i['search_text']=' '.join(str(v) for v in [i['title'],i.get('manufacturer') or '',i.get('model') or '',i['summary'],*i['keywords'],*[forms[f]['label']+' '+forms[f]['ko']+' '+' '.join(forms[f]['keywords']) for f in i['forms']]])
def card(i):
    image=''
    if i.get('image'):
        width,height=intrinsic_dimensions(i['image']) or (1600,1000)
        small=re.sub(r'-1600(?=\.)','-800',i['image'])
        size=intrinsic_dimensions(small) if small!=i['image'] else None
        responsive=f' srcset="{e(small)} {size[0]}w, {e(i["image"])} {width}w" sizes="(max-width:700px) calc(100vw - 48px), 55vw"' if size else ''
        image=f'<a class="result-photo" href="{e(i["url"])}" data-travel><img src="{e(i["image"])}"{responsive} alt="{e(i["image_alt"])}" loading="lazy" decoding="async" width="{width}" height="{height}"></a>'
    credit=''
    if i.get('image_credit'):
        credit=f'<small class="result-credit">{e(i["image_credit"])}'
        if i['image_licence'].startswith('https:'):credit+=f' · <a href="{e(i["image_source"])}">출처</a> / <a href="{e(i["image_licence"])}">이용 조건</a>'
        credit+='</small>'
    tags=' · '.join(form_titles.get(f,forms[f]['ko']) for f in i['forms'])
    date=i.get('manufacturer') or 'TOHEŞAR'
    return f'''<article class="discovery-card" data-content-id="{e(i['id'])}" data-kind="{i['kind']}">{image}<div class="result-meta"><span>{labels[i['kind']]}</span><span>{e(date)}</span></div><h3><a href="{e(i['url'])}" data-travel>{e(i['title'])}</a></h3><p>{e(i['summary'])}</p><span class="result-tags">{e(tags)}</span>{credit}</article>'''
form_titles={'curves':'곡선','wedge-edge':'쐐기와 직선','grand-touring':'그랜드 투어링','new-language':'새로운 조형'}
discovery_items=[i for i in items if i['kind'] != 'news']
buttons=f'<button type="button" data-form="all" aria-pressed="true" aria-label="모든 이야기 {len(discovery_items)}편">전체</button>'
buttons+=''.join(f'<button type="button" data-form="{f["id"]}" aria-pressed="false" aria-label="{e(form_titles.get(f["id"], f["ko"]))} {sum(f["id"] in i["forms"] for i in discovery_items)}편">{e(form_titles.get(f["id"],f["ko"]))}</button>' for f in data['forms'])
p=ROOT/'journal/design/index.html';s=p.read_text()
if '/journal/assets/atlas025.css' not in s:
    s=s.replace('</head>','<link rel="stylesheet" href="/journal/assets/atlas025.css"></head>')
s=s.replace('TOHEŞAR / DESIGN ATLAS','디자인 아틀라스').replace('FEATURED DESIGN / 2026','이달의 디자인 이야기')
s=s.replace('DESIGN STORIES <span>& RELATED CULTURE</span>','자동차와 그 너머의 이야기')
s=s.replace('Independent automotive culture.','자동차를 바라보는 독립적인 시선.')
for english,korean in [('Journal','저널'),('Design Atlas','디자인 아틀라스'),('Visual Culture','시각 문화'),('Miniatures','미니카')]:
    s=s.replace(f'data-travel>{english}</a>',f'data-travel>{korean}</a>')
s=s.replace('© TOHEŞAR 2026 / DESIGN ATLAS — COLLECTION 01','© TOHEŞAR 2026')
for key,body in [('FILTERS',buttons),('RESULTS','\n'.join(card(i) for i in discovery_items)),('INDEX','<script type="application/json" id="discovery-index">'+json.dumps(discovery_items,ensure_ascii=False).replace('<','\\u003c')+'</script>')]:
    s=re.sub(f'<!-- {key}:START -->.*?<!-- {key}:END -->',lambda _:f'<!-- {key}:START -->{body}<!-- {key}:END -->',s,flags=re.S)
p.write_text(s)
if args.atlas_only:
    print(f'Rendered Design Atlas: {len(discovery_items)} stories; authored articles unchanged.')
    raise SystemExit(0)
# Add stable anchors without changing the existing news content or data.
p=ROOT/'journal/news/index.html';s=p.read_text()
news=json.loads((ROOT/'journal/data/news.json').read_text())['items']
for n in news:
    pattern=r'<article class="news-item"(?! id=)([^>]*>)(?:(?!</article>).)*?'+re.escape(e(n['url'],quote=True))
    s=re.sub(pattern,lambda m:m[0].replace('class="news-item"','class="news-item" id="'+n['id']+'"',1),s,flags=re.S)
p.write_text(s)
# Related stories share the same content IDs, on every indexed article.
for current in [i for i in items if i['kind']!='news']:
    p=ROOT/current['url'].lstrip('/')/'index.html'
    if not p.exists():continue
    reasons={'porsche-911':'이어지는 곡선과 정체성','ferrari-f40':'기능이 형태를 이끄는 방식','alfa-romeo-giulia':'보닛과 캐빈 사이, 비율의 아름다움','jaguar-type-01':'미래의 GT가 쓰는 새로운 언어','miniature-atelier':'형태를 작은 그래픽으로 남기다','visual-culture':'자동차를 둘러싼 빛과 도시'}
    related=[i for rid in current['related'] for i in items if i['id']==rid]
    body=''
    for n,i in enumerate(related):
        visual=f'<img src="{e(i["image"])}" alt="{e(i["image_alt"])}" width="1600" height="1000" loading="lazy">' if n==0 and i.get('image') else ''
        body+=f'<a class="continuation-story{ " continuation-lead" if n==0 else ""}" href="{e(i["url"])}" data-travel>{visual}<div><span>{e(reasons.get(i["id"],i["summary"]))}</span><strong>{e(i.get("model") or i["title"].split(" — ")[0])}</strong><small>{labels[i["kind"]]}</small></div></a>'
    if related and related[0].get('image_credit'):
        i=related[0]
        body+=f'<p class="continuation-credit">{e(i["image_credit"])} · <a href="{e(i["image_source"])}">이미지 출처</a>'+ (f' / <a href="{e(i["image_licence"])}">이용 조건</a>' if i['image_licence'].startswith('https:') else '')+'</p>'

    s=p.read_text()
    s=s.replace('<a href="/journal/issues/001/" data-travel>ISSUE 001에서 함께 읽기 ↗</a></aside>', '<nav class="continuation-return" aria-label="저널과 에디션으로 돌아가기"><a href="/journal/issues/001/" data-travel>ISSUE 001에서 함께 읽기</a><a href="/journal/" data-travel>Journal로 돌아가기</a></nav></aside>')
    if '<!-- RELATED:START -->' not in s:
        s=s.replace('<footer', '<aside class="metadata-related"><span class="eyebrow">RELATED / 함께 읽는 형태</span><div><!-- RELATED:START --><!-- RELATED:END --></div><nav class="continuation-return" aria-label="저널과 에디션으로 돌아가기"><a href="/journal/issues/001/" data-travel>ISSUE 001에서 함께 읽기</a><a href="/journal/" data-travel>Journal로 돌아가기</a></nav></aside><footer',1)
    s=re.sub('<!-- RELATED:START -->.*?<!-- RELATED:END -->',lambda _:'<!-- RELATED:START -->'+body+'<!-- RELATED:END -->',s,flags=re.S);p.write_text(s)
print(f'Rendered {len(items)} published entries and {len(forms)} form filters.')
