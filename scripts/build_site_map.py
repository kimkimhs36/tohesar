#!/usr/bin/env python3
"""Render the explore and site map pages with the shared journal navigation."""
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
nav = (ROOT / 'journal/partials/navigation.html').read_text().strip()
shortcuts = '<nav class="site-shortcuts" aria-label="주요 메뉴"><a href="/journal/">저널</a><a href="/owner-stories/">차주 이야기</a></nav>'

def shell(title, content, current):
    return f'''<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#eee9e2"><title>{title} — TOHEŞAR</title><link rel="icon" href="/assets/cedilla-favicon.svg"><link rel="stylesheet" href="/journal/assets/navigation.css?v=20261108"><link rel="stylesheet" href="/journal/assets/site-map.css"><link rel="stylesheet" href="/journal/assets/discovery025.css"><script src="/journal/assets/navigation.js?v=20261108" defer></script></head>
<body><a class="map-skip" href="#content">본문으로 건너뛰기</a><header class="site-header map-header"><a href="/" aria-label="TOHEŞAR 홈"><img src="/assets/wordmark.svg" alt="TOHEŞAR" width="1109" height="255"></a>{shortcuts}{nav}</header><main id="content">{content}</main><footer class="map-footer"><div class="map-footer-intro"><a href="/journal/" aria-label="TOHEŞAR 저널"><img src="/assets/wordmark.svg" alt="TOHEŞAR" width="1109" height="255"></a><p>자동차를 바라보는 또 하나의 시선.<br>오래 남는 형태와 이야기를 기록합니다.</p></div><nav aria-label="하단 메뉴"><a href="/journal/">저널</a><a href="/journal/explore/">둘러보기</a><a href="/edition/">뉴스룸</a><a href="/sitemap/">전체 구조</a></nav><small>© TOHEŞAR 2026 · INDEPENDENT AUTOMOTIVE CULTURE</small></footer></body></html>\n'''

explore = '''<header class="map-intro"><p class="map-path"><a href="/">홈</a> / 둘러보기</p><h1>자동차를 바라보는<br>다양한 시선.</h1><p>형태와 이미지, 작은 모형과 하나의 주제까지. TOHEŞAR의 이야기를 관심에 따라 둘러보세요.</p></header>
<div class="explore-list">
<section class="explore-entry"><a href="/journal/design/"><div class="explore-image"><img src="/journal/assets/giulia/profile-1600.webp" srcset="/journal/assets/giulia/profile-800.webp 800w, /journal/assets/giulia/profile-1600.webp 1600w" sizes="(max-width:700px) calc(100vw - 48px), 55vw" alt="Alfa Romeo Giulia의 측면" width="1600" height="1067"></div><div class="explore-copy"><h2>디자인</h2><p>자동차의 비례와 형태를 자세히 들여다봅니다.</p><span>디자인 아틀라스 보기</span></div></a><small class="explore-credit">사진: Owen.outdoors · <a href="https://www.pexels.com/photo/alfa-romeo-giulia-in-side-view-26756716/">원본</a> / <a href="https://www.pexels.com/license/">Pexels License</a> · WebP 변환</small></section>
<section class="explore-entry"><a href="/journal/miniatures/"><div class="explore-image explore-image-art"><img src="/journal/assets/miniatures/wedge.webp" alt="낮고 날렵한 자동차 미니어처 일러스트" loading="lazy" width="1200" height="435"></div><div class="explore-copy"><h2>미니카</h2><p>작은 크기 안에 남은 자동차의 선과 형태를 살펴봅니다.</p><span>미니카 보기</span></div></a></section>
<section class="explore-entry"><a href="/journal/visual/"><div class="explore-image"><img src="/journal/assets/design/type01-arrival-800.webp" alt="저녁빛 속 Jaguar Type 01 공식 사진" loading="lazy" width="800" height="589"></div><div class="explore-copy"><h2>시각 문화</h2><p>자동차와 빛, 형태가 만나는 순간을 기록합니다.</p><span>시각 문화 보기</span></div></a><small class="explore-credit">사진 © Jaguar Land Rover Limited · <a href="https://media.jlr.com/jaguar/en-gb/news/2026/10/jaguar-type-01-new-era-begins">공식 출처</a> / <a href="https://media.jlr.com/jaguar/en-gb/user-licence">이용 조건</a></small></section>
<section class="explore-entry explore-entry-text"><a href="/journal/issues/"><div class="explore-copy"><h2>특집호</h2><p>하나의 주제로 이어지는 이야기들을 모았습니다.</p><span>특집호 보기</span></div></a></section></div>'''

sitemap = '''<header class="map-intro"><p class="map-path"><a href="/">홈</a> / 전체 구조</p><h1>TOHEŞAR 둘러보기</h1><p>관심 있는 이야기부터 시작해 보세요.</p></header>
<div class="map-tree"><section><h2><a href="/journal/">저널</a></h2><p>자동차를 바라보는 이야기와 특집.</p><ul><li><a href="/journal/911/">Porsche 911</a></li><li><a href="/journal/f40/">Ferrari F40</a></li><li><a href="/journal/design/giulia/">Alfa Romeo Giulia</a></li><li><a href="/journal/design/type-01/">Jaguar Type 01</a></li><li><a href="/journal/field-notes/001/">FIELD NOTES 001 — 어떤 차는 선으로 남는다</a></li><li><a href="/journal/yokohama/">요코하마</a></li><li><a href="/journal/issues/">특집호</a><ul><li><a href="/journal/issues/001/">첫 번째 특집호</a></li></ul></li></ul></section>
<section><h2><a href="/journal/explore/">둘러보기</a></h2><p>관심에 따라 형태와 문화를 탐색합니다.</p><ul><li><a href="/journal/design/">디자인 아틀라스</a></li><li><a href="/journal/miniatures/">미니카</a></li><li><a href="/journal/visual/">시각 문화</a></li><li><a href="/journal/issues/">특집호</a></li></ul></section>
<section><h2><a href="/edition/">뉴스룸</a></h2><p>자동차 소식과 기록을 살펴봅니다.</p><ul><li><a href="/edition/news/">뉴스</a></li><li><a href="/edition/archive/">아카이브</a></li></ul></section><section><h2><a href="/owner-stories/">차주의 이야기</a></h2><p>자동차를 오래 바라본 사람들의 경험과 사진을 기록합니다.</p><ul><li><a href="/owner-stories/">OWNER STORIES 참여</a></li><li><a href="/owner-stories/story-card/">내 차 사진으로 스토리 카드 만들기</a></li></ul></section></div>'''

for path, title, content in [('journal/explore/index.html', '둘러보기', explore), ('sitemap/index.html', '전체 구조', sitemap)]:
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(shell(title, content, title))
print('Rendered explore and site map.')
