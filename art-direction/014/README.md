# TOHEŞAR — THE BEAUTY PROJECT 014

실제 웹사이트의 시각적 개선과 비교 기록입니다. [시각 검토 페이지](index.html)에서 브라우저 BEFORE / AFTER, 후보 3종, 최종 iPhone 크기 화면을 확인할 수 있습니다.

- 기준 브랜치: `feature/tohesar-editorial-world-013`
- 기준 HEAD: `7d327697ef999634ac831d5b0b005adb4d7cb7c7`
- 새 브랜치: `feature/tohesar-beauty-project-014`
- 독립 프로젝트: `tohesar-beauty-014-review`

## 선택한 방향

Yokohama에서 A / Diptych, B / Tidal Page, C / Contact Sheet를 실제 제작·렌더링했습니다. A는 모바일에서 사진의 등장이 늦었고, C는 여러 프레임이 경쟁했습니다. 사진과 제목, 피치빛 한글 문장이 하나의 장면으로 이어지는 B를 선택했습니다. 이후 데스크톱 사진 폭과 제목 길이, 모바일 크롭을 추가로 다듬었습니다.

Wallpaper는 기존 8종의 원본을 검토하고 보존했습니다. 별도 전시 구역으로 옮기지 않고 실제 한국어 문단의 뒤와 주변에서 형태가 읽히도록 배치와 가독성 보호 처리를 개선했습니다. 1차의 가장자리 중심 배치와 2차의 문단 중심 배치를 비교한 캡처도 남겼습니다.

Journal은 산세리프 마스트헤드와 사진, 피치빛 제목 지면의 관계를 재편집했습니다. ISSUE 001은 기존 도입부와 연결 구조를 보존하면서 911의 곡선, F40의 날카로운 면, Giulia의 긴 비례, Type 01의 넓은 GT 실루엣, Miniature의 작은 그래픽을 서로 다른 지면으로 구성했습니다. 이미 완성도가 높았던 Giulia 단독 기사의 도입부는 대부분 유지했습니다.

두 번째 시각 검토에서 출처 캡션의 배경이 사진까지 흐리게 덮던 문제를 수정했습니다. 911 챕터의 글 뒤 보호막도 라벤더 지면과 같은 색으로 맞춰 불필요한 밝은 얼룩을 제거했습니다. Type 01 데스크톱 사진은 과도한 하늘을 줄이되 차량 전체를 보존했습니다.

## 실제 비교 자료

- `before/`: 013 독립 미리보기의 실제 Chromium 캡처
- `candidates/`: A·B·C의 모바일·데스크톱 후보와 당시 스타일
- `iterations/yokohama/`: Yokohama와 Wallpaper의 첫 개선 렌더링
- `iterations/pass2/`: 선택 방향의 추가 시각 개선
- `iterations/editorial/`: Journal·기사·ISSUE의 반복 검토
- `after/`: 최종 웹사이트 브라우저 캡처

주요 비교 크기는 390 × 844, 430 × 932, 820 × 1180, 1180 × 820, 1440 × 900 CSS px입니다. 파일명은 렌더링 너비와 장면을 나타냅니다. 최종 캡처는 WebP, 기준 캡처는 PNG입니다.

## 보존 및 소스

기존 기사 원고, 사진과 일러스트 원본, 이미지 출처·라이선스 링크, 워드마크와 세디유, AI 보조 비주얼 픽션·일러스트 표기를 보존했습니다. 새로운 기사나 뉴스, CMS, 별도 커버를 추가하지 않았습니다. 공식 도메인과 013 브랜치는 변경 대상이 아닙니다.

변경은 `journal/partials/yokohama013.html`, Wallpaper 생성기, `scripts/build_beauty_editorial.py`와 `journal/assets/beauty014-*.css`에 반영했습니다. 생성된 HTML만 임시 수정하지 않으며 기존 발행 흐름에서 다시 적용할 수 있습니다.

Journal·ISSUE·단독 기사 7개 지면은 편집 CSS 적용 전후의 태그 밖 텍스트를 비교해 원고가 동일함을 확인했습니다. 편집 지면의 50개 페이지·화면 조합을 Chromium으로 렌더링해 수평 넘침이 없음을 확인했습니다. 전체 최종 검증과 배포 정보는 저장소의 BUILD 014 릴리스 기록 및 검증 결과를 함께 확인하세요.

## 미검증 사항

실제 iPhone·iPad 하드웨어의 Safari는 미검증입니다. Chromium/WebKit 자동화 렌더링을 실제 기기 테스트로 표현하지 않습니다. 실제 Safari의 주소창 변화, 손가락 스크롤 감각, 기기별 색 표현은 별도 확인이 필요합니다.

## 검증 결과

- Chromium 154 및 Playwright WebKit 26.5: 요청한 다섯 크기 통과. 주요 12개 경로에서 가로 넘침·이미지 누락·JavaScript 오류 없음.
- Wallpaper 스크롤·역스크롤 복원, 모션 감소, JavaScript 비활성화 지면 확인.
- Index 메뉴, 검색, 뉴스 필터, 이미지 확대 통과.
- 발행 CLI 및 발행 테스트 6개 통과. 전체 발행 빌드 반복 시 생성 파일 해시 동일.
- 독립 배포의 주요 HTML/CSS 6개가 검토한 로컬 파일과 바이트 단위로 일치.
- WebKit 390px DPR3 추가 캡처에서 작은 자동차 윤곽 확인. Linux WebKit DPR1에서는 축소 이미지의 가장자리가 더 거칠게 렌더링될 수 있음.

검증 영수증: [브라우저](validation/browser-checks.json), [기사 원고](validation/copy-preservation.json), [원본·CLI](validation/preservation-and-cli.json), [배포 소스](deployed/release-checks.json), [보존 범위](preservation.json).

웹사이트 구현 커밋: `c9622d41387ac77ae02d792618df55394bece5c0`. 후속 커밋은 이 비교 자료와 검토 스크립트를 추가하며 애플리케이션 소스는 동일합니다.

독립 미리보기: https://tohesar-beauty-014-review.vercel.app/  
시각 비교: https://tohesar-beauty-014-review.vercel.app/art-direction/014/
