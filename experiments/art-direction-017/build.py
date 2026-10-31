#!/usr/bin/env python3
"""Build only the isolated 017 preview, preserving all source manuscripts.
Run from this directory or the repository root. Requires beautifulsoup4 for authoring,
not for serving. Generated HTML works without JavaScript or a build server.
"""
from pathlib import Path
from bs4 import BeautifulSoup
from html import escape

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
BASE='/experiments/art-direction-017/'
STORIES={
 '911':dict(name='Porsche 911',ko='포르쉐 911',photo='porsche-911',width=1600,height=1123,mini='coupe',
  caption='1973 911 Carrera RSR. 본문의 964와는 다른 세대의 사진.',
  credit='<a href="https://commons.wikimedia.org/wiki/File:1973_Porsche_911_Carrera_RSR_4.jpg">Calreyn88</a> · <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0 1.0</a>',
  detail='낮은 보닛과 앞 펜더. 같은 사진의 부분 확대.',
  quote='앞은 가볍고 뒤는 단단해 보이는 긴장이, 정지한 차에 방향을 만들어 준다.'),
 'f40':dict(name='Ferrari F40',ko='페라리 F40',photo='f40',width=1600,height=869,mini='wedge',
  caption='Ferrari F40. 낮은 앞부분에서 뒤쪽의 윙까지.',
  credit='<a href="https://commons.wikimedia.org/wiki/File:1991_Ferrari_F40_Red.jpg">MrWalkr</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>',
  detail='빨간 면과 검은 깊이. 같은 사진의 부분 확대.',
  quote='채운 면만큼, 비워 둔 자리도 기억에 남는다.')
}

def photo(s,cls='',eager=False,detail=False):
 return f'''<img class="{cls}" src="/edition/assets/{s['photo']}-1600.webp" srcset="/edition/assets/{s['photo']}-800.webp 800w, /edition/assets/{s['photo']}-1600.webp 1600w" sizes="(min-width: 1100px) 1100px, 100vw" width="{s['width']}" height="{s['height']}" alt="{escape(s['detail'] if detail else s['caption'])}" {'fetchpriority="high"' if eager else 'loading="lazy"'} decoding="async">'''

def miniature(s,cls='',eager=False):
 return f'''<div class="miniature {cls}" aria-hidden="true"><img src="/journal/assets/miniatures/{s['mini']}.webp" width="1200" height="{588 if s['mini']=='coupe' else 435}" alt="" {'fetchpriority="low"' if eager else 'loading="lazy"'} decoding="async"></div>'''

def figcaption(s,detail=False):
 return f'''<figcaption><span>{s['detail'] if detail else s['caption']}</span><span>{s['credit']} · WebP 변환{(' · CSS 크롭' if detail else '')}</span></figcaption>'''

def header(variant,slug):
 return f'''<a class="skip" href="#article">본문으로</a>
 <div class="lab-bar"><a href="{BASE}">017 · 독립 프리뷰</a><nav aria-label="시안 비교"><a href="{BASE}a/{slug}/" {'aria-current="page"' if variant=='a' else ''}>A · 사진</a><a href="{BASE}b/{slug}/" {'aria-current="page"' if variant=='b' else ''}>B · 미니어처</a></nav></div>
 <header class="masthead"><a href="{BASE}" aria-label="017 비교 첫 화면"><img src="/assets/wordmark.svg" width="1109" height="255" alt="TOHEŞAR"></a><nav aria-label="기사 선택"><a href="{BASE}{variant}/911/" {'aria-current="page"' if slug=='911' else ''}>911</a><a href="{BASE}{variant}/f40/" {'aria-current="page"' if slug=='f40' else ''}>F40</a></nav></header>'''

def end(variant,slug,s):
 other='f40' if slug=='911' else '911'; ns=STORIES[other]
 title='바람이 지나갈<br>자리를 남기다.' if other=='f40' else '형태가 시간을<br>통과하는 방식.'
 return f'''<nav class="next-story" aria-label="다음 기사"><a href="{BASE}{variant}/{other}/"><div class="next-heading"><span>다음 이야기</span><span aria-hidden="true">↗</span></div><div class="next-content"><div><p class="model-name">{ns['name']}</p><h2>{title}</h2><span class="read-next">이어서 읽기 <span aria-hidden="true">→</span></span></div><figure>{photo(ns)}<figcaption>{ns['credit']} · WebP 변환 / CSS 크롭</figcaption></figure></div></a></nav>
 <footer><a href="{BASE}">017 · 두 시안 비교하기 ↗</a><a href="https://tohesar.com/journal/{slug}/">기존 기사 원문 ↗</a><img src="/assets/cedilla-icon.svg" width="28" height="28" alt=""><p>TOHEŞAR · 2026</p></footer>'''

for slug,s in STORIES.items():
 source=BeautifulSoup((ROOT/f'journal/{slug}/index.html').read_text(),'html.parser')
 title=source.h1.decode_contents()
 deck=source.select_one('.story-deck').decode_contents()
 opening=source.select_one('.story-opening').decode_contents()
 chapters=source.select('.story-chapter')
 sources=str(source.select_one('.story-sources'))
 # Keep original footnotes and outbound citations; no source-file mutations.
 for variant in ['a','b']:
  model=s['name'].split(' ')[-1]
  intro=f'''<div class="title-block"><p class="model-name">{s['ko']}</p><h1>{title}</h1><p class="deck">{deck}</p><p class="byline">TOHEŞAR <span>2026.10.28</span></p></div>'''
  if variant=='a':
   hero=f'''<div class="editorial-opening"><div class="title-block"><p class="model-name">{s['ko']}</p><h1>{title}</h1></div><figure class="hero-photo">{photo(s,eager=True)}{figcaption(s)}</figure><div class="standfirst"><p class="deck">{deck}</p><p class="byline">TOHEŞAR <span>2026.10.28</span></p></div></div>'''
  else:
   hero=f'''<div class="atmosphere-opening"><div class="opening-still"><div class="paper-slip" aria-hidden="true"></div><figure class="photo-print">{photo(s,eager=True)}<figcaption>{s['credit']} · WebP 변환</figcaption></figure>{miniature(s,'opening-object',True)}</div>{intro}<p class="opening-caption">{s['caption']}<br>미니어처: TOHEŞAR AI 보조 일러스트</p></div>'''
  sections=[]
  for i,ch in enumerate(chapters):
   body=ch.select_one('.chapter-body')
   sections.append(f'''<section class="chapter chapter-{i+1}" id="chapter-{i+1}" aria-labelledby="heading-{i+1}"><div class="chapter-number" aria-hidden="true">0{i+1}</div><div class="chapter-text">{str(body).replace('class="chapter-body"','').replace('<h2>',f'<h2 id="heading-{i+1}">')}</div></section>''')
   if i==0:
    if variant=='a':
     sections.append(f'''<figure class="detail-photo"><div class="detail-window">{photo(s,detail=True)}</div>{figcaption(s,True)}</figure>''')
    else:
     sections.append(f'''<aside class="quiet-spread"><div class="quote-paper"><p>{s['quote']}</p></div>{miniature(s,'resting-object')}<span class="quiet-folio" aria-hidden="true">{model} / 02</span></aside>''')
   if i==1:
    if slug=='911':
     sections.append(f'''<figure class="evening-photo"><img src="/assets/yokohama-arrival.webp" width="1122" height="1402" alt="석양의 요코하마와 은색 쿠페를 그린 기존 TOHEŞAR 비주얼 스터디" loading="lazy" decoding="async"><figcaption>요코하마, 저녁의 빛. TOHEŞAR AI 보조 비주얼 스터디.<br>실제 촬영 사진이나 964 사양을 판독하는 자료가 아닙니다.</figcaption></figure>''')
    elif variant=='a':
     sections.append(f'''<aside class="editorial-pause"><p>{s['quote']}</p>{miniature(s,'pause-object')}</aside>''')
    else:
     sections.append(f'''<figure class="detail-photo"><div class="detail-window">{photo(s,detail=True)}</div>{figcaption(s,True)}</figure>''')
   if variant=='a' and slug=='911' and i==2:
    sections.append(f'''<aside class="editorial-pause"><p>다시 처음의 선으로 돌아간다.</p>{miniature(s,'pause-object')}</aside>''')
  extra=f'''<div class="preview-sources"><p>이 프리뷰는 기존 기사 원문 전체를 유지하고 사진과 지면의 구성을 실험합니다. {s['caption']}</p><p>실사진: {s['credit']}. 기존 WebP 사용, 지면에 맞춘 CSS 크롭. 사진 부분 확대의 라이선스도 원본과 동일합니다.</p><p>미니어처: TOHEŞAR Build 006 AI 보조 일러스트. 특정 모델의 정확한 도해·제조사 공식 상품이 아닙니다.</p></div>'''
  html=f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="{'#f5f0e8' if variant=='a' else '#eee9e7'}"><title>{variant.upper()} · {s['name']} — TOHEŞAR 017</title><link rel="icon" href="/assets/cedilla-favicon.svg"><link rel="stylesheet" href="../../reading.css"><link rel="stylesheet" href="../../{variant}.css"></head><body class="direction-{variant} story-{slug}">{header(variant,slug)}<main id="article"><article>{hero}<div class="opening-copy">{opening}</div>{''.join(sections)}<div class="sources">{sources}{extra}</div></article>{end(variant,slug,s)}</main></body></html>'''
  dest=HERE/variant/slug/'index.html';dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(html)
  print(dest.relative_to(ROOT))
