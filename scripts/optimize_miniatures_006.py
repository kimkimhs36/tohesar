"""Export tightly framed transparent WebP derivatives; original artwork is never overwritten."""
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
for name,source in [('coupe','creative/journal-world-005/miniature-source.png'),('wedge','creative/visual-world-006/wedge-source.png'),('gt','creative/visual-world-006/gt-source.png')]:
    im=Image.open(ROOT/source).convert('RGBA')
    bbox=im.getchannel('A').getbbox()
    im=im.crop(bbox)
    im.thumbnail((1200,700),Image.Resampling.LANCZOS)
    target=ROOT/f'journal/assets/miniatures/{name}.webp'
    im.save(target,quality=88,method=6)
    print(name,im.size,target.stat().st_size)
