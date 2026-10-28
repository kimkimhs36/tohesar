"""Build no-JS discovery and related links from the editorial index + preserved news JSON."""
from pathlib import Path
import json, re
from html import escape as e
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'journal/data/content-index.json').read_text())
forms={f['id']:f for f in data['forms']}
items=[dict(i) for i in data['items'] if i['status']=='published']
for n in json.loads((ROOT/data['news_source'].lstrip('/')).read_text())['items']:
    if n['status']!='published': continue
    items.append(dict(id=n['id'],title=n['title'],url='/journal/news/#'+n['id'],kind='news',manufacturer=n['manufacturer'],model=None,published_at=n['published_at'],vehicle_year=None,forms=['new-language'] if n['topic']=='design' else [],summary=n['summary'],image=None,keywords=[n['manufacturer'],n['topic'],n['source_title']],related=[],source_url=n['url'],source_name=n['source']))
assert len({i['id'] for i in items})==len(items),'Duplicate content ID'
labels={'design-essay':'디자인 에세이','visual-fiction':'비주얼 픽션','graphic-collection':'그래픽 컬렉션','news':'뉴스 / 공식 원문'}
for i in items:
    assert all(f in forms for f in i['forms'])
    assert (ROOT/i['url'].split('#')[0].lstrip('/')/'index.html').exists(),i['url']
    i['search_text']=' '.join(str(v) for v in [i['title'],i.get('manufacturer') or '',i.get('model') or '',i['summary'],*i['keywords'],*[forms[f]['label']+' '+forms[f]['ko']+' '+' '.join(forms[f]['keywords']) for f in i['forms']]])
def card(i):
    image=''
    if i.get('image'):
        image=f'<a class="result-photo" href="{e(i["url"])}" data-travel><img src="{e(i["image"])}" alt="{e(i["image_alt"])}" loading="lazy" width="1600" height="1000"></a>'
    credit=''
    if i.get('image_credit'):
        credit=f'<small class="result-credit">{e(i["image_credit"])}'
        if i['image_licence'].startswith('https:'):credit+=f' · <a href="{e(i["image_source"])}">출처</a> / <a href="{e(i["image_licence"])}">이용 조건</a>'
        credit+='</small>'
    tags=' · '.join(forms[f]['label'] for f in i['forms'])
    date=i.get('manufacturer') or 'TOHEŞAR'
    return f'''<article class="discovery-card" data-content-id="{e(i['id'])}" data-kind="{i['kind']}">{image}<div class="result-meta"><span>{labels[i['kind']]}</span><span>{e(date)}</span></div><h3><a href="{e(i['url'])}" data-travel>{e(i['title'])} ↗</a></h3><p>{e(i['summary'])}</p><span class="result-tags">{e(tags)}</span>{credit}</article>'''
buttons='<button type="button" data-form="all" aria-pressed="true">All stories <small>전체</small></button>'+''.join(f'<button type="button" data-form="{f["id"]}" aria-pressed="false">{e(f["label"])} <small>{sum(f["id"] in i["forms"] for i in items):02d}</small></button>' for f in data['forms'])
p=ROOT/'journal/design/index.html';s=p.read_text()
for key,body in [('FILTERS',buttons),('RESULTS','\n'.join(card(i) for i in items)),('INDEX','<script type="application/json" id="discovery-index">'+json.dumps(items,ensure_ascii=False).replace('<','\\u003c')+'</script>')]:
    s=re.sub(f'<!-- {key}:START -->.*?<!-- {key}:END -->',lambda _:f'<!-- {key}:START -->{body}<!-- {key}:END -->',s,flags=re.S)
p.write_text(s)
# Add stable anchors without changing the existing news content or data.
p=ROOT/'journal/news/index.html';s=p.read_text()
news=json.loads((ROOT/'journal/data/news.json').read_text())['items']
for n in news:
    pattern=r'<article class="news-item"(?! id=)([^>]*>)(?:(?!</article>).)*?'+re.escape(e(n['url'],quote=True))
    s=re.sub(pattern,lambda m:m[0].replace('class="news-item"','class="news-item" id="'+n['id']+'"',1),s,flags=re.S)
p.write_text(s)
# Only the commissioned new article receives generated related links.
p=ROOT/'journal/design/type-01/index.html'
if p.exists():
    current=next(i for i in items if i['id']=='jaguar-type-01')
    reasons={'porsche-911':'정체성은 어떤 선에서 이어지는가','ferrari-f40':'형태와 공기 사이의 다른 해답','miniature-atelier':'GT의 비율을 그래픽으로 축약하다'}
    body=''.join(f'<a href="{e(i["url"])}" data-travel><span>{e(reasons[i["id"]])}</span><strong>{e(i.get("model") or "Miniature Atelier")}</strong><small>{labels[i["kind"]]} ↗</small></a>' for rid in current['related'] for i in items if i['id']==rid)
    s=re.sub('<!-- RELATED:START -->.*?<!-- RELATED:END -->',lambda _:'<!-- RELATED:START -->'+body+'<!-- RELATED:END -->',p.read_text(),flags=re.S);p.write_text(s)
print(f'Rendered {len(items)} published entries and {len(forms)} form filters.')
