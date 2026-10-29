"""010 editorial passages. Source markup/assets stay independent of generated HTML."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
def passage():
    return (ROOT/'journal/partials/miniature-passage.html').read_text()
def build():
    p=ROOT/'journal/911/index.html';s=p.read_text()
    if '<!-- PASSAGE:START -->' not in s:
        s=s.replace('<aside class="metadata-related">','<!-- PASSAGE:START --><!-- PASSAGE:END --><aside class="metadata-related">',1)
    # 011: retain the source, but let the actual manuscript carry its wallpaper.
    s=re.sub('<!-- PASSAGE:START -->.*?<!-- PASSAGE:END -->','<!-- PASSAGE:START --><!-- PASSAGE:END -->',s,flags=re.S)
    p.write_text(s)
    p=ROOT/'journal/miniatures/index.html';s=p.read_text()
    archive='<details class="passage-archive"><summary>010 ARCHIVE / Miniature Passage</summary>'+passage()+'</details>'
    if '<!-- PASSAGE-ARCHIVE:START -->' not in s:
        s=s.replace('</main>','<!-- PASSAGE-ARCHIVE:START --><!-- PASSAGE-ARCHIVE:END --></main>',1)
    s=re.sub('<!-- PASSAGE-ARCHIVE:START -->.*?<!-- PASSAGE-ARCHIVE:END -->',lambda _:'<!-- PASSAGE-ARCHIVE:START -->'+archive+'<!-- PASSAGE-ARCHIVE:END -->',s,flags=re.S)
    p.write_text(s)
    print('Preserved 010 Passage in a closed Atelier archive; 011 articles use wallpaper.')
if __name__=='__main__':build()
