"""Data-driven articles; only explicitly verified records may enter public routes."""
from datetime import date
from html import escape
from pathlib import Path
from urllib.parse import urlsplit
import json
import re

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'journal/data/editorial-stories.json'
MARKER = '<!-- generated editorial-system article -->'
START = '<!-- editorial-system listing start -->'
END = '<!-- editorial-system listing end -->'


def esc(value):
    return escape(str(value), quote=True)


def required(obj, key):
    value = obj.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f'missing {key}')
    return value


def https(value):
    parsed = urlsplit(value)
    if parsed.scheme != 'https' or not parsed.netloc or parsed.username or parsed.password:
        raise ValueError(f'HTTPS source required: {value}')


def image_check(image):
    for key in ('src', 'alt', 'credit', 'source_url', 'licence_url'):
        required(image, key)
    for key in ('source_url', 'licence_url'):
        https(image[key])
    for key in ('src', 'src_small'):
        if image.get(key):
            path = image[key]
            if not path.startswith('/') or '..' in path or not (ROOT / path.lstrip('/')).is_file():
                raise ValueError(f'missing or unsafe image: {path}')


def validate_story(story, publish=False):
    slug = required(story, 'slug')
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', slug):
        raise ValueError(f'invalid slug: {slug}')
    if story.get('status') not in ('draft', 'review', 'published'):
        raise ValueError(f'{slug}: invalid status')
    for key in ('title', 'deck', 'description', 'date', 'author', 'lead'):
        required(story, key)
    date.fromisoformat(story['date'])
    if story.get('paper', 'ivory') not in ('ivory', 'lilac'):
        raise ValueError(f'{slug}: invalid paper')
    art = story.get('art_direction', {})
    if not isinstance(art, dict) or art.get('miniatures', 'trace') not in ('quiet', 'trace', 'atelier'):
        raise ValueError(f'{slug}: invalid miniature art direction')
    if art.get('placement', 'reading') not in ('reading', 'opening', 'both'):
        raise ValueError(f'{slug}: invalid miniature placement')
    image_check(story['hero'])
    if not isinstance(story.get('chapters'), list) or not story['chapters']:
        raise ValueError(f'{slug}: chapters required')
    for chapter in story['chapters']:
        required(chapter, 'heading')
        if chapter.get('composition', 'normal') not in ('normal', 'offset', 'inset'):
            raise ValueError(f'{slug}: invalid composition')
        if not chapter.get('paragraphs') or any(not isinstance(p, str) or not p.strip() for p in chapter['paragraphs']):
            raise ValueError(f'{slug}: paragraphs required')
        if chapter.get('image'):
            image_check(chapter['image'])
    if not story.get('sources'):
        raise ValueError(f'{slug}: sources required')
    for source in story['sources']:
        required(source, 'label'); https(required(source, 'url'))
    if publish:
        review = story.get('verification', {})
        if review.get('status') != 'verified':
            raise ValueError(f'{slug}: verification required before publication')
        required(review, 'reviewer'); required(review, 'note')
        verified = date.fromisoformat(required(review, 'verified_at'))
        if verified > date.today() or date.fromisoformat(story['date']) > date.today():
            raise ValueError(f'{slug}: future publication or verification date')


def load_stories():
    data = json.loads(DATA.read_text())
    if data.get('schema') != 1 or not isinstance(data.get('stories'), list):
        raise ValueError('invalid editorial data schema')
    slugs = set()
    for story in data['stories']:
        slug = required(story, 'slug')
        if slug in slugs:
            raise ValueError(f'duplicate editorial slug: {slug}')
        slugs.add(slug)
        # Incomplete drafts can be saved; previews and published stories must be complete.
        if story.get('status') not in ('draft', 'review', 'published'):
            raise ValueError(f'{slug}: invalid status')
        if story['status'] == 'published':
            validate_story(story, publish=True)
    return data['stories']


def figure(image, cls, eager=False):
    srcset = f' srcset="{esc(image["src_small"])} 800w, {esc(image["src"])} 1600w" sizes="100vw"' if image.get('src_small') else ''
    loading = ' fetchpriority="high"' if eager else ' loading="lazy"'
    return (f'<figure class="{cls}"><img src="{esc(image["src"])}"{srcset} alt="{esc(image["alt"])}"{loading}>'
            f'<figcaption class="es-caption">{esc(image["credit"])} · <a href="{esc(image["source_url"])}">사진 출처</a> / '
            f'<a href="{esc(image["licence_url"])}">이용 조건</a></figcaption></figure>')


def render(story, preview=False):
    validate_story(story, publish=not preview)
    chapters = []
    for chapter in story['chapters']:
        paras = ''.join(f'<p>{esc(p)}</p>' for p in chapter['paragraphs'])
        fig = figure(chapter['image'], 'es-section-image') if chapter.get('image') else ''
        chapters.append(f'<section class="es-section" data-composition="{esc(chapter.get("composition", "normal"))}"><div class="es-section-copy"><h2>{esc(chapter["heading"])}</h2>{paras}</div>{fig}</section>')
    sources = ''.join(f'<li><a href="{esc(s["url"])}">{esc(s["label"])}</a></li>' for s in story['sources'])
    title = esc(story['title']).replace('\n', '<br>')
    robots = '<meta name="robots" content="noindex,nofollow">' if preview else ''
    nav = (ROOT / 'journal/partials/navigation.html').read_text().strip()
    footer_nav = (ROOT / 'journal/partials/footer-navigation.html').read_text().strip()
    return f'''<!doctype html>
{MARKER}
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">{robots}<title>{esc(story['title'].replace(chr(10), ' '))} — TOHEŞAR</title><meta name="description" content="{esc(story['description'])}"><link rel="icon" href="/assets/cedilla-favicon.svg"><link rel="stylesheet" href="/journal/assets/editorial-system.css"><link rel="stylesheet" href="/journal/assets/navigation.css"><script src="/journal/assets/navigation.js" defer></script></head>
<body class="es-page" data-paper="{esc(story.get('paper', 'ivory'))}" data-miniatures="{esc(story.get('art_direction', {}).get('miniatures', 'trace'))}" data-miniature-placement="{esc(story.get('art_direction', {}).get('placement', 'reading'))}"><a class="es-skip" href="#content">본문으로 건너뛰기</a><header class="es-header"><a class="es-wordmark" href="/journal/"><img src="/assets/wordmark.svg" alt="TOHEŞAR" width="1109" height="255"></a>{nav}</header>
<main id="content"><article><header class="es-opening"><span class="es-category">{esc(story.get('subject', ''))}</span><h1 class="es-title">{title}</h1><p class="es-deck">{esc(story['deck'])}</p><div class="es-meta"><span>{esc(story['author'])}</span><time datetime="{esc(story['date'])}">{esc(story['date'].replace('-', '.'))}</time></div></header>{figure(story['hero'], 'es-hero', True)}<div class="es-body"><div class="es-lead"><p>{esc(story['lead'])}</p></div>{''.join(chapters)}</div><section class="es-sources"><div class="es-sources-inner"><h2>출처와 사진</h2><ul class="es-source-list">{sources}</ul></div></section></article></main><footer class="es-footer"><div class="es-footer-inner"><a href="/journal/"><img src="/assets/wordmark.svg" alt="TOHEŞAR" width="1109" height="255"></a>{footer_nav}</div></footer></body></html>\n'''


def preview(slug):
    stories = load_stories()
    story = next((s for s in stories if s['slug'] == slug), None)
    if not story:
        raise ValueError(f'unknown story: {slug}')
    out = ROOT / '.editorial-preview' / slug / 'index.html'
    html = render(story, preview=True)
    out.parent.mkdir(parents=True, exist_ok=True); out.write_text(html)
    print(f'Preview: {out.relative_to(ROOT)} (not published)')


def preflight():
    stories = load_stories()
    published = [s for s in stories if s['status'] == 'published']
    # Preflight every output before changing anything. Never overwrite an authored page.
    outputs = []
    for story in published:
        path = ROOT / 'journal/stories' / story['slug'] / 'index.html'
        if path.exists() and MARKER not in path.read_text():
            raise ValueError(f'refusing to overwrite authored page: {path}')
        outputs.append((path, render(story)))
    index = ROOT / 'journal/index.html'
    original = index.read_text()
    if (START in original) != (END in original):
        raise ValueError('broken editorial listing markers')
    base = re.sub(re.escape(START) + r'.*?' + re.escape(END), '', original, flags=re.S)
    if '</main>' not in base:
        raise ValueError('journal index missing main closing tag')
    return published, outputs, index, base


def build():
    published, outputs, index, base = preflight()
    listing = ''
    if published:
        entries = ''.join(f'<article class="news-item"><h3><a href="/journal/stories/{esc(s["slug"])}/">{esc(s["title"].replace(chr(10), " "))}</a></h3><p>{esc(s["deck"])}</p></article>' for s in published)
        listing = f'{START}<section class="section-pad" aria-labelledby="editorial-stories-title"><h2 id="editorial-stories-title">새로운 이야기</h2>{entries}</section>{END}'
    for path, html in outputs:
        path.parent.mkdir(parents=True, exist_ok=True); path.write_text(html)
    # Remove only files owned by this generator that are no longer published.
    keep = {p for p, _ in outputs}
    for path in (ROOT / 'journal/stories').glob('*/index.html'):
        if path not in keep and MARKER in path.read_text():
            path.unlink()
    index.write_text(base.replace('</main>', listing + '</main>', 1))
    print(f'Editorial system: {len(outputs)} published stories; no status changed.')
