#!/usr/bin/env python3
"""Offline content/security smoke tests for the deploy artifact."""
import argparse,html.parser,json,re,sys
from datetime import datetime
from urllib.parse import urlsplit
from pathlib import Path
class Links(html.parser.HTMLParser):
    def __init__(self):super().__init__();self.refs=[];self.ids=set();self.images=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id'in a:self.ids.add(a['id'])
        if tag in ('a','link','script','img'):
            name={'a':'href','link':'href','script':'src','img':'src'}[tag]
            if name in a:self.refs.append(a[name])
        if tag=='img':self.images.append(a)

def check(root):
    files=['edition/index.html','edition/style.css','edition/app.js','edition/data/news.json',
      'edition/story/mission-s/index.html','edition/story/f40/index.html',
      'edition/assets/f40.jpg','edition/assets/porsche-911.jpg','edition/assets/wordmark.svg',
      'edition/assets/cedilla.svg','edition/assets/serif.woff2','edition/assets/sans.woff2']
    for f in files:assert (root/f).is_file(),f'Missing {f}'
    for f in [str(p.relative_to(root)) for p in (root/'edition').rglob('*.html')]:
        raw=(root/f).read_text(encoding='utf8');doc=Links();doc.feed(raw)
        assert len(doc.refs)>5 and len(doc.ids)>0,f
        for ref in doc.refs:
            if ref.startswith(('https://','http://','#','mailto:','data:')):continue
            p=(root/f).parent/ref.split('#')[0].split('?')[0]
            if p.is_dir():p=p/'index.html'
            assert p.is_file(),f'Broken file: {f} -> {ref}'
    feeds=json.loads((root/'edition/data/news.json').read_text(encoding='utf8'))
    assert isinstance(feeds['items'],list) and feeds['generated_at']
    for item in feeds['items']:
        assert urlsplit(item['url']).scheme=='https'
        assert urlsplit(item['url']).hostname in {'newsroom.porsche.com','www.press.bmwgroup.com','press.bmwgroup.com','www.motor1.com','motor1.com','www.autoblog.com','autoblog.com'}
        assert datetime.fromisoformat(item['published_at']).tzinfo is not None
        assert item.get('fact_checked') is False
        assert item['source'] and item['title'] and item['published_at']
        assert 'summary' not in item and 'body' not in item
    assert (root/'CNAME').read_text().strip()=='tohesar.com','Preserve domain'
    js=(root/'edition/app.js').read_text();assert '.textContent' in js and 'innerHTML' not in js
    assert 'prefers-reduced-motion' in (root/'edition/style.css').read_text()
    print(f'PASS: {len(files)} required files, HTML links and provenance, {len(feeds["items"])} sourced news items')

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--root',type=Path,default=Path('.'));args=p.parse_args()
    try:check(args.root)
    except Exception as e:print('FAIL',str(e),file=sys.stderr);raise SystemExit(1)