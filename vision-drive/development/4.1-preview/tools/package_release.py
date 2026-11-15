#!/usr/bin/env python3
"""Build release binaries/manifest and deterministic source package; never flashes."""
from pathlib import Path
import hashlib,json,os,shutil,subprocess,sys,zipfile
root=Path(__file__).resolve().parents[1]
release=root/'release';build=root/'firmware/.pio/build/ks5023';public=root/'web/downloads'
release.mkdir(exist_ok=True)
for name in ['firmware.bin','bootloader.bin','partitions.bin']:shutil.copy2(build/name,release/name)
file='vision-drive-4.1.0-merged.bin'
core=Path(os.environ.get('PLATFORMIO_CORE_DIR',Path.home()/'.platformio'))
subprocess.run([sys.executable,str(core/'packages/tool-esptoolpy/esptool.py'),'--chip','esp32','merge_bin','-o',str(release/file),'--flash_mode','dio','--flash_freq','40m','--flash_size','4MB','0x1000',str(release/'bootloader.bin'),'0x8000',str(release/'partitions.bin'),'0x10000',str(release/'firmware.bin')],check=True)
data=(release/file).read_bytes()
app=(release/'firmware.bin').read_bytes()
manifest={'version':'4.1.0','file':file,'size':len(data),'sha256':hashlib.sha256(data).hexdigest(),'app_file':'firmware.bin','app_offset':65536,'app_size':len(app),'app_sha256':hashlib.sha256(app).hexdigest(),'chip':'ESP32','board':'Keyestudio KS5023 / esp32cam','flash_size':4194304,'offset':0,'platform':'espressif32@6.9.0','framework':'Arduino ESP32 2.0.17','hardware_verified':False,'note':'Back up and verify the full flash and partition layout first; install app partition only. This build has not been tested on physical hardware.'}
(release/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
public.mkdir(exist_ok=True)
for name in [file,'manifest.json']:shutil.copy2(release/name,public/name)
if '--archive' in sys.argv:
 archive=release/'VISION_DRIVE_04.zip'
 with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=7) as z:
  for p in sorted(root.rglob('*')):
   rel=p.relative_to(root)
   if not p.is_file() or any(s in rel.parts for s in ['.pio','.git','__pycache__']) or p.name.endswith('.pyc') or p.name in ('VISION_DRIVE_04.zip','STUDIO_03_ORIGINAL.zip','ipad-first.png','ipad-upgraded.png','site-first.png','website-desktop.png','website-mobile.png','browser-debug.log','browser-results.json','webkit-install.log','webkit-deps.log'):continue
   z.write(p,'VISION_DRIVE_04/'+str(rel))
 shutil.copy2(archive,public/archive.name)
 print('Source archive:',archive.stat().st_size,'bytes')
print('Firmware SHA-256:',manifest['sha256'])