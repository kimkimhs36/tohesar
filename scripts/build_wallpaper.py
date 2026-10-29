"""011: authored background compositions around existing manuscripts, never a showcase.

The asset registry and layout coordinates are shared build inputs. HTML includes
every decorative image so no-JS and reduced-motion editions are first-class.
"""
from pathlib import Path
from html import escape
import json
import re

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'journal/data'

def scene(body, name, variant='arc', density='medium'):
    registry = json.loads((DATA / 'wallpaper-artworks.json').read_text())
    layouts = json.loads((DATA / 'wallpaper-layouts.json').read_text())
    assets = {a['id']: a for a in registry['artworks']}
    layout = layouts[variant]
    cars = []
    for i, c in enumerate(layout):
        a = assets[c['art']]
        style = ';'.join(f'--{k}:{v}' for k,v in c.items() if k != 'art')
        cars.append(f'<span class="wallpaper-car" data-wallpaper-car style="{style}"><img src="{a["web"]}" width="{a["width"]}" height="{a["height"]}" alt="" loading="lazy" decoding="async"></span>')
    return (f'<!-- WALLPAPER:{name}:START --><div class="wallpaper-paper wallpaper-{variant}" '
            f'id="wallpaper-{name}" data-wallpaper="{variant}" data-density="{density}">'
            '<div class="wallpaper-art" aria-hidden="true" inert>'+''.join(cars)+'</div>'
            '<div class="wallpaper-reading">'+body+'</div></div>'
            f'<!-- WALLPAPER:{name}:END -->')

def unwrap(s):
    # Rebuilding unwraps only our own generated shells, preserving the manuscript.
    pattern = r'<!-- WALLPAPER:([\w-]+):START --><div[^>]+><div class="wallpaper-art".*?</div><div class="wallpaper-reading">(.*?)</div></div><!-- WALLPAPER:\1:END -->'
    return re.sub(pattern, lambda m:m[2], s, flags=re.S)

def attach(s):
    if '/journal/assets/wallpaper011.css' not in s:
        s=s.replace('</head>','<link rel="stylesheet" href="/journal/assets/wallpaper011.css"><script src="/journal/assets/wallpaper011.js" defer></script></head>')
    return s

def wrap_between(s, start, end, name, variant):
    a=s.index(start); b=s.index(end,a)
    return s[:a]+scene(s[a:b],name,variant)+s[b:]

def build():
    p=ROOT/'journal/911/index.html';s=unwrap(p.read_text())
    s=wrap_between(s,'<div class="story-opening">','<figure class="story-wide">','opening','arc')
    # A second actual chapter follows the photograph; the text is never replaced.
    a=s.index('<figure class="story-wide">'); a=s.index('<section class="story-chapter">',a)
    b=s.index('<section class="motion-sequence"',a)
    s=s[:a]+scene(s[a:b],'living','drift')+s[b:]
    s=wrap_between(s,'<section class="story-chapter"><div class="chapter-side"><span>03</span>','<aside class="story-sources"','ending','arc')
    s=s.replace('<body class="story-page">','<body class="story-page wallpaper-story">')
    p.write_text(attach(s))
    p=ROOT/'journal/f40/index.html';s=unwrap(p.read_text())
    s=wrap_between(s,'<div class="story-opening">','<section class="air-sequence"','planes','blade')
    s=s.replace('<body class="story-page">','<body class="story-page wallpaper-story wallpaper-f40">')
    p.write_text(attach(s))
    p=ROOT/'journal/miniatures/index.html';p.write_text(attach(p.read_text()))
    print('Rendered 011 wallpaper behind the existing 911 and F40 manuscripts.')

if __name__=='__main__':build()
