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
    s=re.sub('<!-- PASSAGE:START -->.*?<!-- PASSAGE:END -->',lambda _:'<!-- PASSAGE:START -->'+passage()+'<!-- PASSAGE:END -->',s,flags=re.S)
    p.write_text(s)
    print('Rendered Miniature Passage in the 911 essay; Issue passage comes from its generator.')
if __name__=='__main__':build()
