# TOHEŞAR — Art Direction Lab 017

비공개 검토 사이트: https://tohesar-art-direction-017-lab.teambkit.chatgpt.site

운영 디자인을 대체하지 않는 독립 프리뷰. 기준: `70d2a818c0be7f695b840fe5a2f2f0255d240b97` (main). 016을 병합하거나 기준으로 삼지 않았다. 채택은 창립자의 결정이다.

저장소 루트에서 `python -m http.server 8177` 후 `/experiments/art-direction-017/`를 연다. 빌드·JavaScript·외부 CDN 없이 작동한다.

- [A / 911](a/911/) · [A / F40](a/f40/): Photographic Editorial
- [B / 911](b/911/) · [B / F40](b/f40/): Miniature Atmosphere
- [iPhone 911 비교](review/iphone-911-comparison.png) · [F40 비교](review/iphone-f40-comparison.png)
- [브라우저 검증](review/verification.json) · [보존 검증](review/preservation.json)

A는 온전한 차체를 보여 주는 사진, 피치 도입부, 라일락 사진 지면, 16–17px 산세리프 본문을 사용한다. 미니어처는 한 번의 쉼에만 놓인다. B는 사진 인화지와 작은 자동차가 놓인 정물, 17–18px 세리프 본문, 두 군데의 국소적 오브제 배치를 사용한다. 이미지·본문을 따라 함께 스크롤하며 페이지 전체에 흩뿌리지 않는다.

## 기존 구현에서 확인한 문제

`wallpaper011.css`, `beauty014-wallpaper.css`, `wallpaper-artworks.json`, `wallpaper-layouts.json` 및 현재 911·F40을 직접 읽고 렌더링했다.

- arc·blade의 24개 모티프는 백분율 좌표를 달리해도 유사 크기·시점·간격의 반복 패턴으로 읽힌다. 기사와 무관한 차종·색상이 계속 시선을 분산한다.
- y 좌표가 지면 전체 높이에 종속된다. 문단·사진에 고정된 관계가 없어 글 길이와 화면 폭에 따라 배치 의미가 바뀐다. 390px에서 첫 자동차의 실루엣이 화면 밖으로 잘리고 여러 차가 문장 뒤에서 지워진다.
- 본문 뒤 `::before`의 불투명한 종이색·blur는 독서 공간을 지키지만 자동차의 일부를 소거한다. 014의 `opacity × 1.23`, `saturate(1.09)` 및 좁아진 blur는 충돌 자체를 해결하지 않는다.
- 좌우 반전·회전·작은 이동만으로는 사진, 자동차, 종이가 하나의 광원과 바닥을 공유하지 못한다. 기존 스크롤 코드는 수동 이벤트와 RAF를 사용하고 휴식 중 루프가 없는 점은 인정한다. 성능 문제를 근거 없이 주장하지 않으며, 여기서는 움직임 없이 공간의 관계를 해결했다.

011의 여덟 아트워크는 인쇄 그래픽으로는 사용할 수 있으나 이 지면의 정물 감성에는 맞지 않아 사용하지 않았다. 006의 더 선명한 측면 쿠페·웨지 두 종을 소수 사용했다. 이것도 실물 미니카 사진이 아닌 AI 보조 일러스트라는 한계가 남는다.

## 실제 화면에서 수정한 점

`review/iteration-1/`은 첫 390px·iPad 렌더다. 첫 구현은 F40의 코와 윙을 자르고 A의 설명·날짜가 사진을 너무 늦게 보여 줬다. 최종은 도입부 사진을 원래 비율로 보존하고, A의 설명·날짜를 사진 아래로 옮겼다. iPad에서는 제목과 사진을 나란히 편집했다. B는 인화지 폭·높이를 각 사진 비율에 맞추고 미니어처를 줄였으며 한글 세리프로 독서 질감을 구분했다. 글 뒤를 지우는 blur는 없다.

004 (`851221c`)와 016 (`2b293ac`)은 별도의 읽기 전용 worktree에서 직접 WebKit 렌더했다. 014 Journal 및 과거 experience도 재렌더했다. [004](review/reference/004-cover-390-opening.png)에서는 자동차 한 대의 크기, 빛과 여백이 관계를 만드는 점을 참고했다. 표지 레이아웃은 복제하지 않았다. [016](review/reference/016-journal-390-opening.png)은 비교 대상이며 승인된 디자인이 아니다.

## 자산

- 911 실사진: [Calreyn88 / Commons](https://commons.wikimedia.org/wiki/File:1973_Porsche_911_Carrera_RSR_4.jpg), [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). 기존 `edition/assets/porsche-911-{800,1600}.webp` 사용. 1973 Carrera RSR이며 964 사진이 아님을 첫 캡션에 명시했다.
- F40 실사진: [MrWalkr / Commons](https://commons.wikimedia.org/wiki/File:1991_Ferrari_F40_Red.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). 기존 WebP 사용. CSS 크롭·부분 확대를 명시하고 이미지 파생 표시에도 동일 라이선스를 적용한다.
- 911 석양 이미지: 기존 TOHEŞAR AI 보조 비주얼 스터디. 실촬영·연식 증거로 사용하지 않는다.
- 미니어처: 기존 Build 006 측면 일러스트. 출처·한계는 `creative/visual-world-006/README.md`와 같다. 제조사 공식 상품이나 실물 촬영을 주장하지 않는다.
- 산세리프: 기존 로컬 Noto Sans KR. 기존 `world/assets/fonts/korean.css`의 깨진 `/assets/fonts` 경로를 **이 프리뷰의 새 fonts.css에서만** 실제 파일 경로로 바로잡았다.
- B 세리프: Noto Serif CJK KR Regular (SIL OFL 1.1)의 원문 글자 서브셋. 기존 `edition/assets/serif.woff2`는 이 원문의 한글 다수를 포함하지 않아 새 프리뷰 자산으로 분리했다. [라이선스](assets/Noto-Serif-LICENSE.txt).

## 재현·검증

이미 생성된 HTML은 그대로 서빙하면 된다. 원문을 다시 가져올 때만 `python experiments/art-direction-017/build.py` (beautifulsoup4 필요)를 실행한다. 새 원문 글자를 추가하면 세리프 폰트의 글자 범위도 갱신해야 한다. 기존 기사나 자산을 쓰는 경로는 읽기 전용이다.

`BASE_URL=http://127.0.0.1:8177 python experiments/art-direction-017/verify.py` (playwright, beautifulsoup4, pillow 및 WebKit 필요).

검증은 375×844, 390×844, 430×932, 1194×834의 네 기사 조합이다. 도입부·본문·오브제·다음 기사와 390px 전체 스크롤을 캡처한다. 원문의 제목·데크·도입부·모든 본문 제목·문단·출처를 비교한다. 이미지 로드, 모든 로컬 링크, 가로 넘침, 오브제와 글의 충돌, A/B 및 다음 기사 이동, JS 없이 읽기, reduced-motion, 문서 좌표 고정과 스크롤 RAF 간격을 확인한다. 기준 커밋의 **모든 기존 파일**을 Git blob hash로 비교한다.

이 환경의 WebKit 공유 라이브러리는 사용자 영역에 설치했다. Playwright의 시스템 경로 탐지와 다른 위치이므로 라이브러리 로드를 확인한 후 `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1`로 실행했다. 저장소·브라우저 보안 설정은 변경하지 않았다.

기술 통과는 디자인 승인이 아니다. Playwright WebKit 에뮬레이션이며 실제 iPhone Safari 주소창·기기 GPU·현장 네트워크 성능은 검증하지 않았다. 전시장 사진의 복잡한 배경과 일러스트 미니어처의 물성 한계도 남는다.
