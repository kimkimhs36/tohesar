"""Regenerate committed preview fonts after adding Korean editorial copy.
Requires Python fonttools[woff] (including Brotli). Not run on Vercel.
Sources: Google Fonts / Noto under SIL OFL, copied alongside the output.
"""
from pathlib import Path
import json, subprocess, tempfile, hashlib
from fontTools.ttLib import TTFont
from fontTools import subset
from fontTools.varLib.instancer import instantiateVariableFont
root = Path(__file__).resolve().parents[1]
corpus = ''.join(p.read_text() for p in sorted((root/'src').rglob('*')) if p.suffix in ['.astro', '.ts', '.json'])
corpus += (root/'content-assets.json').read_text()
points = sorted({ord(c) for c in corpus} | set(range(32, 256)))
output = root/'public/fonts'
output.mkdir(exist_ok=True)
with tempfile.TemporaryDirectory() as temp:
    for kind, family in [('serif','NotoSerifKR'),('sans','NotoSansKR')]:
        source = Path('/tmp/tohesar-fonts')/f'{kind}.ttf'
        if not source.exists():
            source = Path(temp)/f'{kind}.ttf'
            subprocess.run(['curl','-fsSL',f'https://raw.githubusercontent.com/google/fonts/main/ofl/{family.lower()}/{family}%5Bwght%5D.ttf','-o',str(source)], check=True)
        font = TTFont(source)
        options = subset.Options()
        options.flavor = 'woff2'
        options.layout_features = ['*']
        sub = subset.Subsetter(options=options)
        sub.populate(unicodes=points)
        sub.subset(font)
        font = instantiateVariableFont(font, {'wght':(400,650)}, inplace=True)
        font.flavor='woff2'
        font.save(output/f'tohesar-{kind}.woff2')
        print(kind, (output/f'tohesar-{kind}.woff2').stat().st_size)
        licence = output/f'OFL-{family}.txt'
        if not licence.exists():
            subprocess.run(['curl','-fsSL',f'https://raw.githubusercontent.com/google/fonts/main/ofl/{family.lower()}/OFL.txt','-o',str(licence)],check=True)
(output/'coverage.json').write_text(json.dumps({'source':'google/fonts OFL NotoSerifKR / NotoSansKR', 'generated':'2026-10-25', 'unicode_codepoints':points},indent=2)+'\n')
