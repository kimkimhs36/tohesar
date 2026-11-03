#!/usr/bin/env python3
"""Build an isolated review package for a prepared article; never publish or commit."""
import argparse
import json
from pathlib import Path
import shutil

import editorial_intake
import editorial_system as editorial


def make_review(input_path, output):
    root = editorial.ROOT.resolve()
    inbox = (root / 'journal' / 'inbox').resolve()
    source = Path(input_path).resolve(strict=True)
    if not source.is_relative_to(inbox) or source.suffix.lower() != '.json' or not source.is_file():
        raise ValueError('input must be a JSON file inside journal/inbox')
    story = editorial_intake.prepare(json.loads(source.read_text(encoding='utf-8')))
    if any(s['slug'] == story['slug'] for s in editorial.load_stories()):
        raise ValueError('article slug already exists')
    page = editorial.render(story, preview=True)
    target = Path(output).resolve()
    if target == root or root.is_relative_to(target) or target.is_relative_to(root):
        raise ValueError('output must be outside the checkout')
    if target.exists():
        raise ValueError('output already exists')
    # Never package symlink targets from outside the checkout.
    for directory in (root / 'journal/assets', root / 'assets'):
        if directory.is_symlink() or any(p.is_symlink() for p in directory.rglob('*')):
            raise ValueError('symlinks are not allowed in packaged asset directories')
    images = [story['hero']] + [image for c in story['chapters'] for image in (([c['image']] if c.get('image') else []) + c.get('images', []))]
    for img in images:
        for key in ('src', 'src_small'):
            if img.get(key):
                resolved = (root / img[key].lstrip('/')).resolve(strict=True)
                if not resolved.is_relative_to(root):
                    raise ValueError('image escapes checkout')
    target.mkdir(parents=True)
    (target / 'journal').mkdir()
    shutil.copytree(root / 'journal/assets', target / 'journal/assets')
    shutil.copytree(root / 'assets', target / 'assets')
    # Images may be stored elsewhere in the repository; preserve their absolute URL paths.
    for img in images:
        for key in ('src', 'src_small'):
            if img.get(key):
                relative = Path(img[key].lstrip('/'))
                dest = target / relative
                if not dest.exists():
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(root / relative, dest)
    path = target / '.editorial-preview' / story['slug'] / 'index.html'
    path.parent.mkdir(parents=True)
    path.write_text(page, encoding='utf-8')
    (target / 'review-story.json').write_text(json.dumps(story, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (target / 'README.txt').write_text('검토 전용. 이 디렉터리에서 python3 -m http.server 8000 실행 후 /.editorial-preview/' + story['slug'] + '/ 접속. 다른 페이지 링크는 이 패키지에 포함되지 않습니다. 자동 형식 검사는 사실이나 사진 사용 권리를 보증하지 않습니다.\n', encoding='utf-8')
    return path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    try:
        print(f'Review package: {make_review(args.input, args.output)}')
    except (OSError, ValueError, KeyError, TypeError) as exc:
        parser.exit(1, f'Review blocked: {exc}\n')


if __name__ == '__main__':
    main()
