#!/usr/bin/env python3
"""Turn a small agent-authored JSON brief into a review-only editorial preview."""
import argparse
from datetime import date
import json
import os
from pathlib import Path
import tempfile

import editorial_system as editorial


def prepare(brief):
    if not isinstance(brief, dict):
        raise ValueError('입력은 JSON 객체여야 합니다')
    forbidden = {'status', 'verification'} & brief.keys()
    if forbidden:
        raise ValueError('입력에서 발행 상태와 검증 상태를 지정할 수 없습니다')
    title = editorial.required(brief, 'title')
    body = brief.get('body')
    if isinstance(body, str):
        paragraphs = [p.strip() for p in body.split('\n\n') if p.strip()]
    elif isinstance(body, list):
        paragraphs = body
    else:
        raise ValueError('body는 문단 배열 또는 빈 줄로 구분한 문자열이어야 합니다')
    if not paragraphs or any(not isinstance(p, str) or not p.strip() for p in paragraphs):
        raise ValueError('본문 문단이 필요합니다')
    if len(paragraphs) < 2:
        raise ValueError('도입과 본문에 각각 한 문단 이상 필요합니다')
    # Content defaults are deliberately mechanical; do not invent facts or rights.
    story = dict(slug=editorial.required(brief, 'slug'), status='review',
        title=title, subject=brief.get('subject', ''), deck=brief.get('deck') or paragraphs[0],
        description=brief.get('description') or (brief.get('deck') or paragraphs[0])[:160],
        date=brief.get('date') or date.today().isoformat(), author=brief.get('author') or 'TOHEŞAR',
        paper=brief.get('paper', 'ivory'), art_direction=brief.get('art_direction', {'miniatures':'trace','placement':'reading'}),
        hero=brief.get('hero', {}), lead=paragraphs[0],
        chapters=[{'heading': brief.get('heading') or title.replace('\n', ' '),
                   'composition':'normal', 'paragraphs':paragraphs[1:]}],
        sources=brief.get('sources', []))
    editorial.validate_story(story)
    return story


def intake(brief):
    story = prepare(brief)
    data = json.loads(editorial.DATA.read_text(encoding='utf-8'))
    editorial.load_stories()  # Validate existing published records before any write.
    if any(item.get('slug') == story['slug'] for item in data['stories']):
        raise ValueError(f"이미 존재하는 slug: {story['slug']}")
    # Rendering also checks the preview before persisting any metadata.
    html = editorial.render(story, preview=True)
    preview_path = editorial.ROOT / '.editorial-preview' / story['slug'] / 'index.html'
    preview_path.parent.mkdir(parents=True, exist_ok=True)
    data['stories'].append(story)
    fd, tmp = tempfile.mkstemp(dir=editorial.DATA.parent, prefix='.editorial-intake-', suffix='.tmp')
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write('\n')
        os.replace(tmp, editorial.DATA)
    finally:
        if os.path.exists(tmp): os.unlink(tmp)
    preview_path.write_text(html, encoding='utf-8')
    return preview_path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', required=True, type=Path, help='UTF-8 JSON input file')
    args = parser.parse_args()
    try:
        path = intake(json.loads(args.input.read_text(encoding='utf-8')))
    except (ValueError, KeyError, TypeError, OSError) as exc:
        parser.exit(1, f'기사 접수 중단: {exc}\n')
    print(f'검토용 미리보기: {path.relative_to(editorial.ROOT)} (공개되지 않음)')

if __name__ == '__main__':
    main()
