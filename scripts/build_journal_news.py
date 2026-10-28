"""Render curated JSON into accessible static pages; run after editing journal/data/news.json."""
from pathlib import Path
import json, re
from html import escape
from urllib.parse import urlparse
ROOT = Path(__file__).resolve().parents[1]
def render(item):
    assert urlparse(item['url']).scheme == 'https'
    e = lambda key: escape(item[key], quote=True)
    return f'''<article class="news-item" data-topic="{e('topic')}"><div class="news-date"><time datetime="{e('published_at')}">{e('published_at').replace('-', '.')}</time><span>{e('manufacturer')} / { {'design':'DESIGN','industry':'INDUSTRY','culture':'CULTURE'}[item['topic']] }</span></div><h3><a href="{e('url')}" target="_blank" rel="noopener noreferrer">{e('title')}</a></h3><div><p>{e('summary')}</p><a class="news-source" href="{e('url')}" target="_blank" rel="noopener noreferrer">{e('source')} · 원문 읽기 ↗</a></div><a class="news-arrow" href="{e('url')}" target="_blank" rel="noopener noreferrer" aria-label="{e('title')} 원문 새 탭에서 읽기">↗</a></article>'''
items=json.loads((ROOT/'journal/data/news.json').read_text())['items']
items=sorted([i for i in items if i['status']=='published'],key=lambda i:i['published_at'],reverse=True)
for path in ['journal/index.html','journal/news/index.html']:
    p=ROOT/path;s=p.read_text();markup=''.join(map(render,items))
    if '<!-- NEWS:START -->' in s:
        s=re.sub(r'<!-- NEWS:START -->.*?<!-- NEWS:END -->',f'<!-- NEWS:START -->{markup}<!-- NEWS:END -->',s,flags=re.S)
    else:s=s.replace('>NEWS</div>',f'><!-- NEWS:START -->{markup}<!-- NEWS:END --></div>')
    p.write_text(s)
print(f'Rendered {len(items)} verified source records into both journal pages.')
