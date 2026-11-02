# TOHEŞAR · 2026.11.02 디자인 연속 개발

기준: `bacd737` → 디자인 커밋 `90f682f`, `b39afee`.
기존 브랜치: `design/tohesar-journal-unified-018-20261101`.
현재 저장소는 정적 HTML/CSS이며, 이 세션에 이전 로컬 체크아웃은 없어 최신 저널 브랜치와 연결된 프리뷰 기록을 확인한 뒤 복원했다.

프리뷰: https://tohesar-journal-unified-018-review-cndzedr4y-teambkit.vercel.app
기존 프로젝트: `tohesar-journal-unified-018-review` / **preview**.
Vercel 인증이 적용되어 있으며 소유자 로그인으로 접근할 수 있다. main·운영 도메인·배포 보호 설정은 변경하지 않았다.

- 메인: 표지 → Jaguar 사진 → 이슈 → 비대칭 디자인 지면 → 뉴스 → 도시의 흐름. 사진에 얹힌 박스를 줄이고 아이보리·피치·라일락의 미세한 배경 변화와 읽기 크기를 조정했다.
- 뉴스룸: 사진·제목의 겹침을 풀고 헤드라인·출처·날짜·검색 필터 위계를 정리했다.
- 기사: 한국어 행간과 너비, 사진 캡션, Jaguar의 읽기 지면과 비교 구간, F40의 가로 화면 펼침을 조정했다. 반복 장식 미니카는 본문에서 걷어내고 기존 형태 관찰 장면의 미니카는 유지했다. F40·Jaguar의 고정 스크롤 길이를 줄였다.
- COVER 004, 제호, 기사 원고, 사진 파일, 출처와 뉴스 데이터·엔진은 보존했다.

검증: WebKit 375×812, 390×844, 430×932, 1194×834 / 8경로 / 32화면 가로 넘침 없음. 뉴스 검색·출처/주제 필터·12→24건·초기화·메뉴·기사 저장·Index와 reduced-motion 확인. 기존 정적 링크/출처 검사 및 Chromium 독서 흐름 회귀 검사 통과. 상세: [verification.json](verification.json).

390px 캡처는 실제 배포 프리뷰의 WebKit 렌더링이다. 캡처에서만 Vercel 도구 모음을 숨겼다. 배포 CSS 해시 대조: [deployment-check.json](deployment-check.json). 375·430px 및 iPad 캡처는 동일 소스의 로컬 WebKit 렌더링이다.

[메인](iphone-main-390.png) · [사진 지면](iphone-main-photo-390.png) · [뉴스룸](iphone-newsroom-390.png) · [뉴스 검색](iphone-news-390.png) · [F40](iphone-f40-390.png) · [본문](iphone-reading-390.png) · [Jaguar](iphone-type01-390.png) · [iPad 메인](ipad-main-1194.png) · [iPad F40](ipad-f40-1194.png)

남은 영역: 실물 iPhone Safari의 주소창·터치 성능 확인, 기타 특집(요코하마·Visual Culture·미니어처·Issue)의 본문 전체 정밀 검토. 디자인 최종 승인은 창립자에게 있다.
