#!/usr/bin/env python3
"""Backup-first alternative for desktop service. Does not auto-start firmware.
Requires Python 3.9+ and esptool==4.8.1 (one-time service setup).
Never called by build/tests. Every write requires --confirm and matching backup MAC.
"""
import argparse,hashlib,json,re,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SIZE=4*1024*1024

def run(port,*args):
 cmd=[sys.executable,'-m','esptool','--chip','esp32','--port',port,'--baud','115200','--after','no_reset',*map(str,args)]
 p=subprocess.run(cmd,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
 print(p.stdout,end='')
 if p.returncode:raise RuntimeError('esptool failed; leave motors disconnected and use restore')
 return p.stdout

def mac(port):
 out=run(port,'read_mac');found=re.findall(r'MAC:\s*([0-9a-fA-F:]{17})',out)
 if not found:raise RuntimeError('Device MAC could not be read')
 return found[-1].lower()

def digest(data):return hashlib.sha256(data).hexdigest()

def validate_backup(path,device):
 data=path.read_bytes();meta=json.loads(path.with_suffix('.json').read_text())
 if meta.get('format')!='vision-drive-backup-v1' or meta.get('mac','').lower()!=device or meta.get('size')!=SIZE or len(data)!=SIZE or digest(data)!=meta.get('sha256'):
  raise RuntimeError('Backup size, MAC or SHA-256 mismatch')
 return data

def main():
 p=argparse.ArgumentParser(description=__doc__)
 p.add_argument('action',choices=['backup','install','restore']);p.add_argument('--port',required=True)
 p.add_argument('--backup',type=Path,required=True,help='Full stock .bin path; .json sidecar stored/read alongside it')
 p.add_argument('--confirm',choices=['INSTALL','RESTORE'])
 p.add_argument('--expected-ssid-suffix',help='Four hex digits from the currently connected VISION-DRIVE Wi-Fi name')
 a=p.parse_args()
 if a.backup.suffix.lower()!='.bin':p.error('--backup must name a .bin file so the JSON sidecar has a separate path')
 if a.action=='install' and not re.fullmatch(r'[0-9a-fA-F]{4}',a.expected_ssid_suffix or ''):
  p.error('install requires the four-digit expected VISION-DRIVE SSID suffix')
 device=mac(a.port)
 if a.expected_ssid_suffix:
  parts=device.split(':')
  if len(parts)!=6 or (parts[5]+parts[4]).upper()!=a.expected_ssid_suffix.upper():
   raise RuntimeError('Board MAC does not match the expected VISION-DRIVE Wi-Fi; no write performed')
 if a.action=='backup':
  if a.backup.exists() or a.backup.with_suffix('.json').exists():raise RuntimeError('Will not overwrite an existing backup')
  a.backup.parent.mkdir(parents=True,exist_ok=True);run(a.port,'read_flash','0',hex(SIZE),a.backup)
  data=a.backup.read_bytes()
  if len(data)!=SIZE:raise RuntimeError('Incomplete backup')
  run(a.port,'verify_flash','0',a.backup)
  a.backup.with_suffix('.json').write_text(json.dumps({'format':'vision-drive-backup-v1','mac':device,'size':SIZE,'sha256':digest(data)},indent=2))
  print('Backup verified. Keep BIN and JSON privately. No flash write performed.');return
 validate_backup(a.backup,device)
 if a.confirm!=('INSTALL' if a.action=='install' else 'RESTORE'):raise RuntimeError('Explicit --confirm INSTALL or RESTORE required; disconnect motor power first')
 if a.action=='install':
  manifest=json.loads((ROOT/'release/manifest.json').read_text());file=ROOT/'release'/manifest['app_file'];data=file.read_bytes()
  if manifest.get('app_offset')!=0x10000 or len(data)!=manifest['app_size'] or digest(data)!=manifest['app_sha256']:raise RuntimeError('Release SHA-256 or app offset mismatch')
  partition=(ROOT/'release/partitions.bin').read_bytes()
  if len(partition)!=3072 or a.backup.read_bytes()[0x8000:0x8000+len(partition)]!=partition:raise RuntimeError('Existing partition layout does not match; no write performed')
  offset='0x10000'
 else:file=a.backup;offset='0'
 # Installing only the app preserves NVS, radio calibration, bootloader and partition table.
 run(a.port,'write_flash','--flash_mode','keep','--flash_freq','keep','--flash_size','keep',offset,file)
 run(a.port,'verify_flash',offset,file)
 print('Write and readback verification complete. Disconnect, remove GPIO0–GND, then power cycle manually.')

if __name__=='__main__':
 try:main()
 except Exception as e:print('STOP:',e,file=sys.stderr);sys.exit(1)