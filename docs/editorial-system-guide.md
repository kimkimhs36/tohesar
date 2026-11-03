# 데이터 기반 기사 제작

`journal/data/editorial-stories.json`의 `stories`에 기사를 추가한다. `slug`는 영문 소문자·숫자·하이픈으로 고유하게 지정하고, `status`는 `draft`로 시작한다. 제목, 설명, 날짜, 작성자, 도입문, 장별 제목과 문단, 대표 사진 및 출처를 입력한다. 사진은 저장소 안의 절대 경로와 대체 텍스트, 크레딧, HTTPS 원본 및 이용 조건 URL을 지정한다. 기존 Type 01 데이터가 전체 필드의 예시다. 이미지 권리는 URL의 존재만으로 확보되지 않으므로 직접 확인한다.

사진 파일은 JPEG, PNG, WebP, GIF 또는 AVIF를 사용한다. 실제 픽셀 크기를 알고 있다면 `width`와 `height`를 함께 입력하면 이미지 로딩 전에도 공간을 확보한다. 모바일용 `src_small`을 넣을 때 작은 파일의 실제 픽셀 너비를 `src_small_width`에 기록하면 반응형 이미지로 제공된다. 치수를 모르면 생략할 수 있으며, 이때는 잘못된 크기를 추측하지 않고 원본 이미지를 사용한다.

장별 `composition`은 `normal`, `offset`, `inset` 중 선택한다. `paper`는 `ivory` 또는 `lilac`이다.
기사의 `art_direction.miniatures`는 `quiet`(미니카 없음), `trace`(본문 가장자리에 낮은 밀도로), `atelier`(더 뚜렷한 가장자리 미니카) 중 하나다. 기본값은 `trace`다. 이 선택은 배경의 존재감만 바꾸며 제목/대표 사진/서체/출처 레이아웃은 바꾸지 않는다. 배경을 글 뒤에 불투명한 카드처럼 씌우지 않고, 본문 가운데 읽기 영역을 비워두는 구조다. 개별 이미지·권리 표기와 같은 콘텐츠는 공통 시스템의 속성으로 자동 생성된다.

`/docs/editorial-system-review/`는 018 브랜치의 미적 검토용 페이지다. 우측/아래 비교 컨트롤에서 여백·은은한 미니카·선명한 미니카 모드를 전환한다. 이 페이지는 `noindex,nofollow`이고 일반 Journal 내비게이션에 노출하지 않는다. 공개 승인된 기사나 실기기 검증을 뜻하지 않는다. 새 기사의 내용이 바뀌면 검토 페이지도 새 자료로 다시 생성해야 한다.
 사진의 원본 비율은 유지된다. 특별 연출이 필요한 기존 지면은 이 시스템으로 자동 변환하지 않는다.

```sh
python3 scripts/publish.py preview-story type-01-standard
python3 scripts/publish.py preview --port 8000
```

로컬에서 `http://127.0.0.1:8000/.editorial-preview/type-01-standard/`를 연다. 미리보기는 Git 및 Vercel 배포에서 제외되며 검색 제외 메타 태그를 포함한다. 초안의 필수 값이 빠지면 미리보기가 중단된다.

사실, 사진 권리와 지면을 검토한 후에만 `verification`에 `status: verified`, `reviewer`, `note`, `verified_at` (YYYY-MM-DD)을 기록하고 `status`를 `published`로 바꾼다. 미래 날짜는 허용되지 않는다. `python3 scripts/publish.py check`로 검증하고 `python3 scripts/publish.py build`로 공개 페이지와 저널 목록을 생성한다. 빌드는 상태를 자동으로 바꾸지 않으며, 생성기 소유 표시가 없는 기존 페이지는 덮어쓰지 않는다. 발행 취소 시 다음 빌드에서 이 생성기가 만든 페이지와 목록 항목만 제거된다. 결과 변경분을 검토하고 브랜치에서 확인한 후 별도 배포 절차를 따른다.

검증: `python3 -m unittest discover -s scripts -p 'test_editorial_system.py'` 및 `python3 scripts/publish.py links`. 기존 발행 빌드는 여러 특수 지면도 재생성하므로 변경분을 반드시 검토한다. COVER 004와 승인된 F40, Giulia, 미니카 지면은 별도 소스로 유지한다.

## 027 사진과 지면

새 기사의 사진·제목·종이와 추가 사진, 색 및 미니카 선택은 [기사 에이전트 안내](editorial-agent/README.md#사진과-지면-조정)를 따른다. 기존의 검토 및 발행 검증 조건은 그대로 적용된다.
