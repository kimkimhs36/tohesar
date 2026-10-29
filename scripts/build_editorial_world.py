"""013: authored invitations keep the city essay inside the existing journal."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
CSS='<link rel="stylesheet" href="/journal/assets/world013.css">'
def inject(path,key,body,before):
 p=ROOT/path;s=p.read_text();start=f'<!-- {key}:START -->';end=f'<!-- {key}:END -->'
 # The authored 015 home already includes the city essay in its reading sequence.
 if path=='journal/index.html' and 'recovery015-journal' in s:return
 if start not in s:
  assert before in s,(path,before)
  s=s.replace(before,start+end+before,1)
 s=re.sub(re.escape(start)+'.*?'+re.escape(end),lambda _:start+body+end,s,flags=re.S)
 if CSS not in s:s=s.replace('</head>',CSS+'</head>')
 p.write_text(s)
def build():
 feature='''<section class="city-invitation" aria-labelledby="city-invite-title"><div class="city-invite-top"><span>VISUAL ESSAY / YOKOHAMA</span><span>THE CITY & THE CAR</span></div><a class="city-invite-photo" href="/journal/yokohama/" data-travel aria-label="요코하마 특별 에디토리얼 읽기"><img src="/assets/yokohama-arrival.webp" width="1122" height="1402" alt="상상한 요코하마 항구의 저녁빛과 은빛 쿠페" loading="lazy"></a><div class="city-invite-copy"><span class="eyebrow">새로운 특별 에디토리얼</span><h2 id="city-invite-title"><a href="/journal/yokohama/" data-travel>도시가 차에<br>남기는 빛.</a></h2><p>푸른 시간의 차체에서 라일락빛 지면까지.<br>사진과 작은 자동차, 한국어 에세이로 이어지는<br>요코하마의 다섯 장면.</p><a class="city-invite-link" href="/journal/yokohama/" data-travel>Yokohama 특집 읽기</a><small>TOHEŞAR · AI 보조 비주얼 픽션<br>실제 현장 촬영이나 여행 안내가 아닌 시각적 에세이</small></div></section>'''
 inject('journal/index.html','EDITORIAL-WORLD',feature,'<!-- ISSUE:START -->')
 strip='''<a class="city-index-strip" href="/journal/yokohama/" data-travel><span>YOKOHAMA / SPECIAL ESSAY</span><strong>도시와 자동차, 하나의 지면으로.</strong><em>특집 읽기</em></a>'''
 inject('journal/visual/index.html','CITY-ESSAY',strip,'<section class="photo-sequence"')
 note='''<aside class="city-issue-note"><span>BEYOND ISSUE 001 / YOKOHAMA</span><h2>형태를 읽은 눈으로,<br>도시의 빛을 바라보다.</h2><p>911의 곡선은 어떤 풍경을 담을까. 사진과 작은 자동차가 같은 지면에 머무는 시각적 에세이로 이어집니다.</p><a href="/journal/yokohama/" data-travel>Yokohama 특별 에디토리얼 읽기</a><small>AI 보조 비주얼 픽션 · 실제 현장 사진 아님</small></aside>'''
 inject('journal/issues/001/index.html','CITY-CONTINUATION',note,'</main>')
 print('Rendered 013 city essay invitations in Journal, Visual Culture and Issue 001.')
if __name__=='__main__':build()
