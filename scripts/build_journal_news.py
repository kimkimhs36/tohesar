"""Render curated JSON into accessible static pages; run after editing journal/data/news.json."""
from issue_model import load
from pathlib import Path
import json, re
from html import escape
from urllib.parse import urlparse
ROOT = Path(__file__).resolve().parents[1]
def render(item):
    assert urlparse(item['url']).scheme == 'https'
    e = lambda key: escape(item[key], quote=True)
    return f'''<article class="news-item" id="{e('id')}" data-topic="{e('topic')}"><div class="news-date"><time datetime="{e('published_at')}">{e('published_at').replace('-', '.')}</time><span>{e('manufacturer')} / { {'design':'DESIGN','industry':'INDUSTRY','culture':'CULTURE'}[item['topic']] }</span></div><h3><a href="{e('url')}" target="_blank" rel="noopener noreferrer">{e('title')}</a></h3><div><p>{e('summary')}</p><a class="news-source" href="{e('url')}" target="_blank" rel="noopener noreferrer">{e('source')} · 원문 읽기 ↗</a></div><a class="news-arrow" href="{e('url')}" target="_blank" rel="noopener noreferrer" aria-label="{e('title')} 원문 새 탭에서 읽기">↗</a></article>'''
items=json.loads((ROOT/'journal/data/news.json').read_text())['items']
for n in items:
    if n['status']=='published':
        assert n.get('fact_check_status')=='verified', 'Unverified news cannot publish'
        assert n.get('verification') and n.get('image_usage'), 'Missing verification/rights'
items=sorted([i for i in items if i['status']=='published'],key=lambda i:i['published_at'],reverse=True)
for path in ['journal/index.html','journal/news/index.html']:
    p=ROOT/path;s=p.read_text()
    selected=items
    if path=='journal/index.html':
        # A compact, manufacturer-diverse homepage; the archive retains every record.
        limit=int(re.search(r'data-limit="(\d+)"',s).group(1))
        seen=set();selected=[]
        for item in items:
            if item['manufacturer'] not in seen:
                selected.append(item);seen.add(item['manufacturer'])
            if len(selected)==limit:break
    markup=''.join(map(render,selected))
    if '<!-- NEWS:START -->' in s:
        s=re.sub(r'<!-- NEWS:START -->.*?<!-- NEWS:END -->',f'<!-- NEWS:START -->{markup}<!-- NEWS:END -->',s,flags=re.S)
    else:s=s.replace('>NEWS</div>',f'><!-- NEWS:START -->{markup}<!-- NEWS:END --></div>')
    verified=max(i.get('verified_at',i['published_at']) for i in items)
    s=re.sub(r'원문 확인 \d{4}\.\d{2}\.\d{2}', '원문 확인 '+verified.replace('-','.'),s)
    s=re.sub(r'선별한 \d+건의 기록', f'선별한 {len(items)}건의 기록',s)
    s=re.sub(r'(<p id="news-count"[^>]*>)\d+개의 기록',lambda m:m[1]+f'{len(items)}개의 기록',s)
    p.write_text(s)
print(f'Rendered {len(items)} verified source records into both journal pages.')
