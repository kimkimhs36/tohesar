"""Data-driven articles; only explicitly verified records may enter public routes."""
from datetime import date
from html import escape
from pathlib import Path
from urllib.parse import urlsplit
import json
import re
import struct

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
    if not isinstance(image, dict):
        raise ValueError('image must be an object')
    for key in ('src', 'alt', 'credit', 'source_url', 'licence_url'):
        required(image, key)
    for key in ('source_url', 'licence_url'):
        https(image[key])
    for key in ('src', 'src_small'):
        if image.get(key):
            path = image[key]
            if not isinstance(path, str) or not path.startswith('/') or '..' in path or not (ROOT / path.lstrip('/')).is_file():
                raise ValueError(f'missing or unsafe image: {path}')
            with (ROOT / path.lstrip('/')).open('rb') as f:
                header = f.read(128)
            raster = (header.startswith(b'\x89PNG\r\n\x1a\n') or header.startswith(b'\xff\xd8\xff') or
                      header.startswith((b'GIF87a', b'GIF89a')) or
                      (header.startswith(b'RIFF') and header[8:12] == b'WEBP') or
                      (header[4:8] == b'ftyp' and (b'avif' in header[:64] or b'avis' in header[:64])))
            if not raster:
                raise ValueError(f'unsupported or invalid image file: {path}')
    for key in ('width', 'height', 'src_small_width'):
        if key in image and (type(image[key]) is not int or image[key] <= 0):
            raise ValueError(f'invalid image dimension: {key}')
    if ('width' in image) != ('height' in image):
        raise ValueError('image width and height must be supplied together')
    if 'src_small_width' in image and (not image.get('src_small') or not image.get('width') or image['src_small_width'] >= image['width']):
        raise ValueError('small image needs a smaller width and both image sources')


def validate_story(story, publish=False):
    slug = required(story, 'slug')
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', slug):
        raise ValueError(f'invalid slug: {slug}')
    if story.get('status') not in ('draft', 'review', 'published'):
        raise ValueError(f'{slug}: invalid status')
    for key in ('title', 'deck', 'description', 'date', 'author', 'lead'):
        required(story, key)
    date.fromisoformat(story['date'])
    if story.get('paper', 'ivory') not in ('ivory', 'lilac', 'sage', 'peach'):
        raise ValueError(f'{slug}: invalid paper')
    art = story.get('art_direction', {})
    if not isinstance(art, dict) or art.get('miniatures', 'trace') not in ('quiet', 'trace', 'atelier'):
        raise ValueError(f'{slug}: invalid miniature art direction')
    if art.get('placement', 'reading') not in ('reading', 'opening', 'both'):
        raise ValueError(f'{slug}: invalid miniature placement')
    if art.get('car', 'journal') not in ('journal', 'coral', 'sage', 'lilac', 'blue', 'butter', 'mint', 'rose', 'tomato'):
        raise ValueError(f'{slug}: invalid miniature car')
    if art.get('opening', 'full') not in ('full', 'inset', 'offset'):
        raise ValueError(f'{slug}: invalid opening composition')
    image_check(story['hero'])
    if not isinstance(story.get('chapters'), list) or not story['chapters']:
        raise ValueError(f'{slug}: chapters required')
    for chapter in story['chapters']:
        if not isinstance(chapter, dict):
            raise ValueError(f'{slug}: chapter must be an object')
        required(chapter, 'heading')
        if chapter.get('composition', 'normal') not in ('normal', 'offset', 'inset'):
            raise ValueError(f'{slug}: invalid composition')
        if not isinstance(chapter.get('paragraphs'), list) or not chapter['paragraphs'] or any(not isinstance(p, str) or not p.strip() for p in chapter['paragraphs']):
            raise ValueError(f'{slug}: paragraphs required')
        if chapter.get('image'):
            image_check(chapter['image'])
        if 'images' in chapter:
            if not isinstance(chapter['images'], list) or len(chapter['images']) > 12:
                raise ValueError(f'{slug}: invalid chapter images')
            for image in chapter['images']:
                image_check(image)
    if not isinstance(story.get('sources'), list):
        raise ValueError(f'{slug}: sources must be a list')
    if publish and not story['sources']:
        raise ValueError(f'{slug}: factual sources required before publication')
    for source in story['sources']:
        if not isinstance(source, dict):
            raise ValueError(f'{slug}: source must be an object')
        required(source, 'label'); https(required(source, 'url'))
    glossary = story.get('glossary', [])
    if not isinstance(glossary, list) or len(glossary) > 20:
        raise ValueError(f'{slug}: glossary must be a list of at most 20 terms')
    body = [story['lead']] + [p for chapter in story['chapters'] for p in chapter['paragraphs']]
    seen = []
    for item in glossary:
        if not isinstance(item, dict):
            raise ValueError(f'{slug}: glossary entry must be an object')
        term = required(item, 'term')
        definition = required(item, 'definition')
        https(required(item, 'source_url'))
        if len(term) > 60 or len(definition) > 600 or '\n' in term:
            raise ValueError(f'{slug}: glossary entry too long or multiline')
        if any(term in other or other in term for other in seen):
            raise ValueError(f'{slug}: duplicate or overlapping glossary term')
        if not any(term in paragraph for paragraph in body):
            raise ValueError(f'{slug}: glossary term not present in body: {term}')
        seen.append(term)
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


def intrinsic_dimensions(src):
    """Read common local photo headers without adding a runtime image dependency.

    Unknown formats retain the writer's explicit dimensions. This is layout
    metadata only; it does not validate image rights or decode the photograph.
    """
    path = ROOT / src.lstrip('/')
    if not src.startswith('/') or '..' in src:
        return None
    try:
        with path.open('rb') as photo:
            header = photo.read(32)
            if header.startswith(b'\x89PNG\r\n\x1a\n') and len(header) >= 24:
                size = struct.unpack('>II', header[16:24])
            elif header.startswith((b'GIF87a', b'GIF89a')) and len(header) >= 10:
                size = struct.unpack('<HH', header[6:10])
            elif header.startswith(b'RIFF') and header[8:12] == b'WEBP':
                if header[12:16] == b'VP8X' and len(header) >= 30:
                    size = (1 + int.from_bytes(header[24:27], 'little'),
                            1 + int.from_bytes(header[27:30], 'little'))
                elif header[12:16] == b'VP8L' and len(header) >= 25 and header[20] == 0x2f:
                    bits = int.from_bytes(header[21:25], 'little')
                    size = ((bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1)
                elif header[12:16] == b'VP8 ' and header[23:26] == b'\x9d\x01\x2a' and len(header) >= 30:
                    size = tuple(n & 0x3fff for n in struct.unpack('<HH', header[26:30]))
                else:
                    return None
            elif header.startswith(b'\xff\xd8'):
                photo.seek(2)
                while True:
                    marker = photo.read(1)
                    if marker != b'\xff':
                        return None
                    while marker == b'\xff':
                        marker = photo.read(1)
                    if not marker or marker in (b'\xd9', b'\xda'):
                        return None
                    raw_length = photo.read(2)
                    if len(raw_length) != 2:
                        return None
                    length = int.from_bytes(raw_length, 'big')
                    if length < 2:
                        return None
                    if marker[0] in (0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf):
                        frame = photo.read(5)
                        if len(frame) != 5:
                            return None
                        height, width = struct.unpack('>HH', frame[1:5])
                        size = (width, height)
                        break
                    photo.seek(length - 2, 1)
            else:
                return None
            return size if all(size) else None
    except (OSError, ValueError, struct.error):
        return None


def figure(image, cls, eager=False):
    # Common intake omits dimensions. Reserve the real photograph's space so
    # loading a below-the-fold image does not move the text being read.
    width, height = intrinsic_dimensions(image['src']) or (image.get('width'), image.get('height'))
    small = intrinsic_dimensions(image['src_small']) if image.get('src_small') else None
    small_width = small[0] if small else image.get('src_small_width')
    # Width descriptors must describe the actual files, not assumed 800/1600px sizes.
    same_frame = not small or not height or abs(small[0] / small[1] - width / height) < .01
    srcset = f' srcset="{esc(image["src_small"])} {small_width}w, {esc(image["src"])} {width}w" sizes="100vw"' if small_width and width and small_width < width and same_frame else ''
    dimensions = f' width="{width}" height="{height}"' if width and height else ''
    loading = ' fetchpriority="high"' if eager else ' loading="lazy"'
    return (f'<figure class="{cls}"><img src="{esc(image["src"])}"{srcset}{dimensions} alt="{esc(image["alt"])}"{loading} decoding="async">'
            f'<figcaption class="es-caption">{esc(image["credit"])} · <a href="{esc(image["source_url"])}" aria-label="사진 출처: {esc(image["alt"])}">사진 출처</a> / '
            f'<a href="{esc(image["licence_url"])}" aria-label="사진 이용 조건: {esc(image["alt"])}">이용 조건</a></figcaption></figure>')


def render_text(text, glossary, rendered):
    """Mark only the first occurrence of each term; all author input is escaped."""
    available = [g for g in glossary if g['term'] not in rendered]
    if not available:
        return esc(text)
    by_term = {g['term']: (index, g) for index, g in enumerate(glossary, 1)}
    pattern = re.compile('|'.join(re.escape(g['term']) for g in sorted(available, key=lambda g: len(g['term']), reverse=True)))
    output, cursor = [], 0
    for match in pattern.finditer(text):
        term = match.group()
        if term in rendered:
            continue
        rendered.add(term)
        index, item = by_term[term]
        ident = f'editorial-term-{index}'
        output.append(esc(text[cursor:match.start()]))
        output.append(f'<span class="term-note"><button type="button" class="term-trigger" aria-expanded="false" aria-controls="{ident}" hidden>{esc(term)}</button><span class="term-fallback">{esc(term)}</span><span class="term-definition" id="{ident}" role="note">{esc(item["definition"])} <a href="{esc(item["source_url"])}">출처</a></span></span>')
        cursor = match.end()
    output.append(esc(text[cursor:]))
    return ''.join(output)


def render(story, preview=False):
    validate_story(story, publish=not preview)
    glossary = story.get('glossary', [])
    rendered = set()
    lead = render_text(story['lead'], glossary, rendered)
    chapters = []
    for chapter in story['chapters']:
        paras = ''.join(f'<p>{render_text(p, glossary, rendered)}</p>' for p in chapter['paragraphs'])
        images = ([chapter['image']] if chapter.get('image') else []) + chapter.get('images', [])
        fig = ''.join(figure(image, 'es-section-image') for image in images)
        chapters.append(f'<section class="es-section" data-composition="{esc(chapter.get("composition", "normal"))}"><div class="es-section-copy"><h2>{esc(chapter["heading"])}</h2>{paras}</div>{fig}</section>')
    sources = ''.join(f'<li><a href="{esc(s["url"])}">{esc(s["label"])}</a></li>' for s in story['sources']) or '<li>사실 출처를 추가하고 검토해야 합니다.</li>'
    title = esc(story['title']).replace('\n', '<br>')
    deck = f'<p class="es-deck">{esc(story["deck"])}</p>' if story['deck'] != story['lead'] else ''
    robots = '<meta name="robots" content="noindex,nofollow">' if preview else ''
    notes = '<link rel="stylesheet" href="/journal/assets/reader-notes.css"><script src="/journal/assets/reader-notes.js" defer></script>' if glossary else ''
    nav = (ROOT / 'journal/partials/navigation.html').read_text().strip()
    footer_nav = (ROOT / 'journal/partials/footer-navigation.html').read_text().strip()
    return f'''<!doctype html>
{MARKER}
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">{robots}<title>{esc(story['title'].replace(chr(10), ' '))} — TOHEŞAR</title><meta name="description" content="{esc(story['description'])}"><link rel="icon" href="/assets/cedilla-favicon.svg"><link rel="stylesheet" href="/journal/assets/editorial-system.css">{notes}<link rel="stylesheet" href="/journal/assets/article-motion.css"><script src="/journal/assets/article-motion.js" defer></script><link rel="stylesheet" href="/journal/assets/navigation.css"><script src="/journal/assets/navigation.js" defer></script></head>
<body class="es-page" data-paper="{esc(story.get('paper', 'ivory'))}" data-miniatures="{esc(story.get('art_direction', {}).get('miniatures', 'trace'))}" data-miniature-placement="{esc(story.get('art_direction', {}).get('placement', 'reading'))}" data-miniature-car="{esc(story.get('art_direction', {}).get('car', 'journal'))}" data-opening="{esc(story.get('art_direction', {}).get('opening', 'full'))}"><a class="es-skip" href="#content">본문으로 건너뛰기</a><header class="es-header"><a class="es-wordmark" href="/journal/"><img src="/assets/wordmark.svg" alt="TOHEŞAR" width="1109" height="255"></a>{nav}</header>
<main id="content"><article>{figure(story['hero'], 'es-hero', True)}<header class="es-opening"><img class="es-masthead" src="/assets/wordmark.svg" width="1109" height="255" alt="TOHEŞAR"><span class="es-category">{esc(story.get('subject', ''))}</span><h1 class="es-title">{title}</h1>{deck}<div class="es-meta"><span>{esc(story['author'])}</span><time datetime="{esc(story['date'])}">{esc(story['date'].replace('-', '.'))}</time></div></header><div class="es-body"><div class="es-lead"><p>{lead}</p></div>{''.join(chapters)}</div><section class="es-sources"><div class="es-sources-inner"><h2>출처와 사진</h2><ul class="es-source-list">{sources}</ul></div></section><aside class="es-return"><p>이야기는 여기서 잠시 멈춥니다.</p><a href="/">홈으로</a></aside></article></main><footer class="es-footer"><div class="es-footer-inner"><a href="/journal/"><img src="/assets/wordmark.svg" alt="TOHEŞAR" width="1109" height="255"></a>{footer_nav}</div></footer></body></html>\n'''


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
