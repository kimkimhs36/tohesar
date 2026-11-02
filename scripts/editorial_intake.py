#!/usr/bin/env python3
"""Turn a small agent-authored JSON brief into a review-only editorial preview."""
import argparse
import fcntl
import hashlib
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
    def parse_paragraphs(value, label):
        if isinstance(value, str):
            result = [p.strip() for p in value.split('\n\n') if p.strip()]
        elif isinstance(value, list):
            result = value
        else:
            raise ValueError(f'{label}: 문단 배열 또는 문자열이 필요합니다')
        if not result or any(not isinstance(p, str) or not p.strip() for p in result):
            raise ValueError(f'{label}: 빈 문단은 허용되지 않습니다')
        return result

    if 'chapters' in brief:
        if 'body' in brief:
            raise ValueError('여러 장을 입력할 때는 body 대신 lead를 사용하세요')
        lead = editorial.required(brief, 'lead')
        raw_chapters = brief['chapters']
        if not isinstance(raw_chapters, list) or not raw_chapters:
            raise ValueError('chapters에 하나 이상의 장이 필요합니다')
        chapters = []
        for raw in raw_chapters:
            if not isinstance(raw, dict):
                raise ValueError('각 장은 객체여야 합니다')
            chapter = {'heading': editorial.required(raw, 'heading'),
                       'paragraphs': parse_paragraphs(raw.get('paragraphs'), '장 본문'),
                       'composition': raw.get('composition', 'normal')}
            if 'image' in raw:
                if not isinstance(raw['image'], dict) or not raw['image']:
                    raise ValueError('장 사진에는 출처와 이용 조건이 필요합니다')
                chapter['image'] = raw['image']
            chapters.append(chapter)
    else:
        paragraphs = parse_paragraphs(brief.get('body'), 'body')
        if len(paragraphs) < 2:
            raise ValueError('도입과 본문에 각각 한 문단 이상 필요합니다')
        lead = paragraphs[0]
        chapters = [{'heading': brief.get('heading') or title.replace('\n', ' '),
                     'composition': 'normal', 'paragraphs': paragraphs[1:]}]
    # Content defaults are deliberately mechanical; do not invent facts or rights.
    story = dict(slug=editorial.required(brief, 'slug'), status='review',
        title=title, subject=brief.get('subject', ''), deck=brief.get('deck') or lead,
        description=brief.get('description') or (brief.get('deck') or lead)[:160],
        date=brief.get('date') or date.today().isoformat(), author=brief.get('author') or 'TOHEŞAR',
        paper=brief.get('paper', 'ivory'), art_direction=brief.get('art_direction', {'miniatures':'trace','placement':'reading'}),
        hero=brief.get('hero', {}), lead=lead, chapters=chapters,
        sources=brief.get('sources', []), glossary=brief.get('glossary', []))
    editorial.validate_story(story)
    return story


def intake(brief):
    story = prepare(brief)
    html = editorial.render(story, preview=True)
    # The lock has a stable per-repository name; never unlink it while waiters
    # may still hold an open descriptor.
    key = hashlib.sha256(str(editorial.DATA.resolve()).encode()).hexdigest()
    lock_path = Path(tempfile.gettempdir()) / f'tohesar-intake-{key}.lock'
    with lock_path.open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        data = json.loads(editorial.DATA.read_text(encoding='utf-8'))
        editorial.load_stories()
        if any(item.get('slug') == story['slug'] for item in data['stories']):
            raise ValueError(f"이미 존재하는 slug: {story['slug']}")
        preview_path = editorial.ROOT / '.editorial-preview' / story['slug'] / 'index.html'
        preview_path.parent.mkdir(parents=True, exist_ok=True)
        # Never overwrite existing preview data. Writing the preview first avoids
        # accepting a story whose preview could not be saved.
        with preview_path.open('x', encoding='utf-8') as preview_file:
            try:
                preview_file.write(html)
            except Exception:
                preview_path.unlink(missing_ok=True)
                raise
        try:
            data['stories'].append(story)
            fd, tmp = tempfile.mkstemp(dir=editorial.DATA.parent, prefix='.editorial-intake-', suffix='.tmp')
            try:
                with os.fdopen(fd, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                    f.write('\n')
                os.replace(tmp, editorial.DATA)
            finally:
                if os.path.exists(tmp): os.unlink(tmp)
        except Exception:
            preview_path.unlink(missing_ok=True)
            raise
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
