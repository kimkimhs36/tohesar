# 공통 기사 시스템 검증 — 2026-11-02

Type 01 검토 데이터를 로컬 미리보기로 생성해 기존 지면과 비교했다. 새 지면은 원본 비율 사진 세 장을 전체 폭과 비대칭 구도로 배치하고, 기존 Type 01과 승인된 F40·Giulia·미니카는 각자의 연출을 유지한다. 새 지면은 읽기 중심으로 더 절제되어 있으며 기존 특수 지면의 타이포그래피와 오프닝을 대체하지 않는다. 검토 중 발견한 768px 본문 넘침과 초기화 선택자 충돌을 수정했다.

- Chromium 실제 렌더링: 미리보기 375, 390, 430, 768, 1440px에서 HTTP 200, 가로 넘침 및 확인된 깨진 이미지, JavaScript 예외 없음. 390px은 스크롤하며 지연 로딩 사진을 확인했다.
- 기존 F40·Giulia·미니카: 같은 폭에서 가로 넘침, 깨진 이미지, JavaScript 예외 없음. COVER 004도 캡처했다.
- `test_editorial_system.py` 5개, `test_publishing_008.py` 8개 통과. `publish.py check` 통과, `publish.py links` 12페이지의 로컬 링크·앵커 1422개 통과.
- 기존 `scripts/test_browser.py`는 별도 서버가 필요하며 서버를 기동한 실행에서도 뉴스 장애 문구 assertion이 실패했다. 일반 unittest 검색에서는 서버가 없으면 import 중 연결 실패한다. 이 기존 테스트의 실패는 해결되지 않았다.

스크린샷은 작업 환경의 `/workspace/scratch/tohesar-baseline/`에 있다. Chromium 모바일 뷰포트는 iPhone Safari 실기기 검증을 대체하지 않는다. WebKit 실행에 필요한 OS 라이브러리가 없어 Safari 엔진 검증을 수행하지 못했다. Type 01 콘텐츠와 사진 권리는 별도 편집 검토가 필요하므로 `review` 상태이며 공개하지 않았다. 기존 생성기 전체를 실행하는 발행 빌드는 승인 지면에 영향을 줄 수 있으므로 배포 전 생성 diff와 실기기 화면을 검토해야 한다.
