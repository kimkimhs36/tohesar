# Cinematic 028

027의 커버와 기사 지면을 유지한 상태에서 홈의 세 사진을 각 기사의 첫 사진과 연결한다. `*-frames.jpg`는 390px에서 기존 홈, 전환 중간 프레임, 기존 기사 도착 화면 순서다. `f40-transition.mp4`는 실제 Chromium 연속 캡처다.

같은 출처의 사진 링크만 공유 요소로 지정한다. 이동을 가로채지 않으며, 브라우저 미지원·모션 축소·이미지 미준비 시 일반 이동을 유지한다. 임시 이름은 전환 종료와 BFCache 복원 시 제거한다. 버전이 다른 덮개 코드가 섞이지 않도록 네 페이지의 travel 자산 URL을 갱신한다.

`python3 scripts/publish.py build` 두 번 실행해 네 페이지의 해시 일치를 확인했다. `tests/navigation.cjs`는 세 기사, 각 화면 크기, 왕복과 뒤로/앞으로, 새로고침, 축소 모션, 키보드 및 JavaScript 미실행을 확인한다. Chromium과 Playwright WebKit은 데스크톱 리눅스 엔진이며 실제 iPhone Safari 검사는 아니다.
