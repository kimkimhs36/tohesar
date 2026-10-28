#!/usr/bin/env python3
"""GitHub Pages scheduled, source-labelled RSS ingestion. Stdlib only.

Never republishes article bodies, images, or summaries. A failed run keeps the
previous snapshot unchanged, without claiming it was updated.
"""
import argparse
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime
import json
import hashlib
import os
from pathlib import Path
import re
import sys
import urllib.request
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode
import xml.etree.ElementTree as ET

FEEDS = (
    dict(id='porsche',name='Porsche Newsroom',url='https://newsroom.porsche.com/rss/en/index.rss',hosts={'newsroom.porsche.com'}),
    dict(id='bmw',name='BMW Group PressClub',url='https://www.press.bmwgroup.com/global/rss',hosts={'www.press.bmwgroup.com','press.bmwgroup.com'}),
    dict(id='motor1',name='Motor1',url='https://www.motor1.com/rss/news/all/',hosts={'www.motor1.com','motor1.com'}),
)
MAX_ITEMS=45
MAX_AGE=timedelta(days=24)

# A deliberately conservative label inferred from the publisher HEADLINE.
# It is not an independently verified article category, nor a fact-check.
TOPIC_PATTERNS=(
    ('motorcycles',r'\b(motorcycle|motorcycles|superbike|motorrad|scooter|two.wheel|motogp)\b'),
    ('motorsport',r'\b(f1|formula 1|formula one|nascar|wrc|grand prix|motorsport|le mans|racing|rally|racecar|race car|indycar)\b'),
    ('design',r'\b(concept|prototype|design|styling|heritage|classic|vintage|coachbuilt|coachbuild|restomod|vision model)\b'),
    ('technology',r'\b(battery|charging|autonomous|software|electric|electrification|hydrogen|self.driving|factory|production|manufacturing|robot|powertrain)\b'),
    ('industry',r'\b(recall|recalls|factory investment|earnings|profits|tariff|sales|market|partnership|plant|workers|ceo|bankruptcy)\b'),
)
def infer_topic(title):
    for topic,pattern in TOPIC_PATTERNS:
        if re.search(pattern,title,re.I):return topic
    return 'new-cars'

def text_at(parent, keys):
    for child in parent:
        key=child.tag.rsplit('}',1)[-1].lower()
        if key in keys and child.text:
            return ' '.join(child.text.strip().split())
    return ''

def parse_date(value, now):
    if not value:return None
    try:
        value=value.strip()
        dt=parsedate_to_datetime(value) if ',' in value else datetime.fromisoformat(value.replace('Z','+00:00'))
        if dt.tzinfo is None:dt=dt.replace(tzinfo=timezone.utc)
        if dt<now-MAX_AGE or dt>now+timedelta(hours=24):return None
        return dt.astimezone(timezone.utc)
    except (ValueError,TypeError,OverflowError):return None

def safe_url(value, source):
    try:
        p=urlsplit(value.strip());host=(p.hostname or '').lower()
        if p.scheme!='https' or host not in source['hosts'] or p.username or p.password:return None
        qs=[(k,v) for k,v in parse_qsl(p.query,keep_blank_values=True) if not k.startswith('utm_') and k not in ('fbclid','gclid')]
        return urlunsplit(('https',p.netloc,p.path,urlencode(qs),''))
    except (TypeError,ValueError):return None

def parse_feed(data, source, now):
    root=ET.fromstring(data)
    entries=[]
    for node in root.iter():
        if node.tag.rsplit('}',1)[-1].lower() not in ('item','entry'):continue
        title=text_at(node,{'title'})[:250]
        link=text_at(node,{'link'})
        if not link:
            for child in node:
                if child.tag.rsplit('}',1)[-1].lower()=='link':
                    link=child.attrib.get('href','');break
        link=safe_url(link,source)
        raw_date=text_at(node,{'pubdate','published','updated','date'})
        dt=parse_date(raw_date,now)
        if not title or len(title)<7 or not link or dt is None:continue
        if re.search(r'\b(tennis|golf|fashion|watch|esport|LPGA|Ladies Championship)\b',title,re.I):continue
        entries.append(dict(id=source['id']+'-'+hashlib.sha256(link.encode('utf8')).hexdigest()[:14],title=title,source=source['name'],source_id=source['id'],url=link,published_at=dt.isoformat(),category=infer_topic(title),classification='headline-keywords',language='en',collected_at=now.isoformat(),fact_checked=False,brands=[brand for brand in ('Porsche','BMW','MINI','Ferrari','Toyota','Mazda','Audi','KTM') if re.search(r'\b'+brand+r'\b',title,re.I)],models=[],kind='publisher-headline'))
    return entries

def read_source(source, now):
    req=urllib.request.Request(source['url'],headers={'User-Agent':'TOHESAR-Radar/1.0 (attributed headline monitor)','Accept':'application/rss+xml,application/atom+xml,text/xml'})
    with urllib.request.urlopen(req,timeout=9) as response:
        if response.geturl().split('/')[2] not in source['hosts']:raise ValueError('redirect outside allowed publisher')
        payload=response.read(1500001)
        if len(payload)>1500000:raise ValueError('feed too large')
    return parse_feed(payload,source,now)

def refresh(output):
    now=datetime.now(timezone.utc)
    all_items=[];states=[]
    for src in FEEDS:
        try:
            items=read_source(src,now)
            states.append(dict(id=src['id'],name=src['name'],status='ok' if items else 'empty',count=len(items)))
            all_items.extend(items)
        except Exception as error:
            states.append(dict(id=src['id'],name=src['name'],status='unavailable',count=0))
            print(f"WARN {src['id']} feed unavailable: {error}",file=sys.stderr)
    if not all_items:
        if output.exists():
            previous=json.loads(output.read_text(encoding='utf8'))
            previous['last_attempt_at']=now.isoformat();previous['sources']=states;previous['status']='unavailable'
            output.write_text(json.dumps(previous,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
        print('WARN no valid feed items; keeping existing dated snapshot',file=sys.stderr)
        return 0 if output.exists() else 1
    by_link={}
    for item in sorted(all_items,key=lambda z:z['published_at'],reverse=True):
        by_link.setdefault(item['url'],item)
    result={'status':'live' if all(s['status']=='ok' for s in states) else 'partial',
      'generated_at':now.isoformat(),'note':'외부 발행처의 원문 헤드라인과 날짜·출처 링크만 수집합니다. TOHEŞAR 검증 기사와 별도입니다.',
      'sources':states,'items':list(by_link.values())[:MAX_ITEMS]}
    output.parent.mkdir(parents=True,exist_ok=True)
    temp=output.with_suffix('.json.tmp');temp.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8');os.replace(temp,output)
    print('Wrote',len(result['items']),'headlines:',output)
    return 0

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,default=Path('edition/data/news.json'));args=parser.parse_args()
    raise SystemExit(refresh(args.output))