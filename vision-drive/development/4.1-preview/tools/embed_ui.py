from pathlib import Path
import gzip
try:
    root = Path(__file__).resolve().parents[1]
except NameError:
    Import('env')
    root = Path(env['PROJECT_DIR']).resolve().parent
parts = [('index.html','text/html'),('drive.css','text/css'),('drive.js','application/javascript'),('instrument.woff2','font/woff2'),('text.woff2','font/woff2')]
out = ['// Generated from web/drive. Do not edit.\n#pragma once\n']
for i,(name,mime) in enumerate(parts):
    data = gzip.compress((root/'web/drive'/name).read_bytes(),mtime=0)
    out.append('static const unsigned char asset%d[] PROGMEM = {%s};\n' % (i, ','.join(map(str,data))))
(root/'firmware/include/ui.h').write_text(''.join(out))