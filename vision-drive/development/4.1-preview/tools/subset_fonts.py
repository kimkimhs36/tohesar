"""Optional asset regeneration; normal firmware builds use checked-in WOFF2 files.
Install fonttools[woff] to run. Rename subset families to respect reserved font names.
"""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
root=Path(__file__).resolve().parents[1]
text=''.join((root/'web/drive'/f).read_text() for f in ['index.html','drive.js','drive.css'])
for source,output,family,chars in [
 (root/'web/assets/BarlowCondensed-Medium.ttf','instrument.woff2','BKIT Instrument 04',''.join(chr(i) for i in range(32,127))+'×−'),
 (root/'web/assets/Pretendard-Regular.woff2','text.woff2','BKIT Text 04',text+''.join(chr(i) for i in range(32,127)))]:
 font=TTFont(source);options=subset.Options();options.flavor='woff2';options.layout_features=['*'];s=subset.Subsetter(options=options);s.populate(text=chars);s.subset(font)
 for record in font['name'].names:
  if record.nameID in [1,3,4,6,16,17]:record.string=(family.replace(' ','') if record.nameID==6 else family).encode(record.getEncoding())
 font.flavor='woff2';font.save(root/'web/drive'/output)
 print(output,(root/'web/drive'/output).stat().st_size)