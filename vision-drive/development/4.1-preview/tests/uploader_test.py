from pathlib import Path
from playwright.sync_api import sync_playwright
import json,tempfile,subprocess,sys
ROOT=Path(__file__).resolve().parents[1]
MOCK=r'''
export class Transport{constructor(){}async disconnect(){}async write(){}async *read(){const packet=window.mockPackets.shift();if(!packet)throw Error('No mock packet');yield packet;}}
export class ESPLoader{
 constructor(){window.mockFlash=window.mockFlash||new Uint8Array(4194304).fill(42);window.mockWrites=window.mockWrites||0;this.chip={CHIP_NAME:'ESP32',readMac:async()=>'aa:bb:cc:dd:ee:ff'};}
 async main(){return 'ESP32-D0WDQ6';}async getFlashSize(){return 4096;}
 async checkCommand(_name,_op,data){const size=new DataView(data.buffer).getUint32(4,true);window.mockPackets=[];for(let n=0;n<size;n+=4096)window.mockPackets.push(window.mockFlash.slice(n,Math.min(n+4096,size)));const hash=window.SparkMD5.ArrayBuffer.hash(window.mockFlash.slice(0,size).buffer);window.mockPackets.push(Uint8Array.from(hash.match(/../g),h=>parseInt(h,16)));return 0;}
 async flashMd5sum(start,size){return window.SparkMD5.ArrayBuffer.hash(window.mockFlash.slice(start,start+size).buffer);}
 async writeFlash(options){window.mockWrites++;if(window.mockFailWrite){window.mockFailWrite=false;window.mockFlash[0]^=1;throw Error('Simulated write failure');}const f=options.fileArray[0];window.mockFlash.set(Uint8Array.from(f.data,c=>c.charCodeAt(0)),f.address);if(window.mockCorruptWrite){window.mockCorruptWrite=false;window.mockFlash[0]^=1;}options.reportProgress?.(0,f.data.length,f.data.length);}
}
'''
checks=[]
def check(x,name):assert x,name;checks.append(name)
invalid=subprocess.run([sys.executable,str(ROOT/'tools/flash.py'),'backup','--port','MOCK-NEVER-OPEN','--backup','stock.json'],capture_output=True,text=True)
check(invalid.returncode==2 and 'separate path' in invalid.stderr,'CLI rejects backup paths that could collide with JSON before opening serial')
with tempfile.TemporaryDirectory() as tmp, sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(accept_downloads=True)
 page.add_init_script("Object.defineProperty(navigator,'serial',{value:{requestPort:async()=>({})}})")
 page.route('**/vendor/esptool.bundle.js',lambda r:r.fulfill(body=MOCK,content_type='application/javascript'))
 page.goto('http://127.0.0.1:8787/setup/')
 check(page.locator('#flash').is_disabled(),'install locked before connection')
 page.locator('#connect').click();page.wait_for_timeout(50)
 check('aa:bb' in page.locator('#device').inner_text(),'identified chip and flash size KB')
 check(page.evaluate('window.mockWrites')==0,'connect never writes flash')
 check(page.locator('#flash').is_disabled(),'install locked without backup')
 with page.expect_download() as d:page.locator('#backup').click()
 backup=Path(tmp)/'stock.bin';d.value.save_as(backup)
 check(backup.stat().st_size==4194304,'full 4 MB backup saved')
 page.locator('#verify-backup').set_input_files(backup);page.wait_for_timeout(120)
 page.locator('#consent').check()
 check(page.locator('#flash').is_disabled(),'JSON sidecar download required even with verified BIN and consent')
 page.locator('#consent').uncheck()
 with page.expect_download() as d:page.locator('#save-meta').click()
 metadata=Path(tmp)/'stock.json';d.value.save_as(metadata)
 check('SHA-256 일치' in page.locator('#backup-state').inner_text(),'saved backup SHA-256 compared')
 check(page.locator('#flash').is_disabled(),'explicit install checkbox required')
 page.locator('#consent').check();check(page.locator('#flash').is_enabled(),'backup plus consent enables install')
 page.locator('#flash').click();page.wait_for_function('window.mockWrites===1');page.wait_for_function("document.getElementById('result').textContent.startsWith('기록 및 읽기 검증 완료')")
 check(page.evaluate('window.mockWrites')==1,'one explicit install write')
 check(page.locator('#flash').is_disabled(),'new install requires new backup')
 page.locator('#restore-bin').set_input_files(backup);page.locator('#restore-json').set_input_files(metadata)
 check(page.locator('#restore').is_disabled(),'restore consent required')
 page.locator('#restore-consent').check();page.locator('#restore').click();page.wait_for_function('window.mockWrites===2');page.wait_for_function("document.getElementById('result').textContent.startsWith('기록 및 읽기 검증 완료')")
 check(page.evaluate('window.mockFlash.every(x=>x===42)'),'restore returns exact previous bytes')
 bad=Path(tmp)/'bad.json';meta=json.loads(metadata.read_text());meta['mac']='11:22:33:44:55:66';bad.write_text(json.dumps(meta))
 page.locator('#restore-json').set_input_files(bad);page.locator('#restore-consent').check();page.locator('#restore').click();page.wait_for_timeout(80)
 check(page.evaluate('window.mockWrites')==2,'wrong MAC blocked without writing')
 check('MAC' in page.locator('#result').inner_text(),'wrong MAC explained')
 damaged=Path(tmp)/'damaged.bin';damaged.write_bytes(b'X'*4194304);page.locator('#restore-bin').set_input_files(damaged);page.locator('#restore-json').set_input_files(metadata);page.locator('#restore').click();page.wait_for_timeout(100)
 check(page.evaluate('window.mockWrites')==2,'tampered restore blocked without writing')
 def prepare_install():
  with page.expect_download() as d:page.locator('#backup').click()
  current=Path(tmp)/'current.bin';d.value.save_as(current)
  with page.expect_download() as d:page.locator('#save-meta').click()
  d.value.save_as(Path(tmp)/'current.json')
  page.locator('#verify-backup').set_input_files(current)
  page.wait_for_function("document.getElementById('backup-state').textContent.includes('SHA-256 일치')")
  page.locator('#consent').check()
 prepare_install()
 before=page.evaluate('window.mockWrites')
 page.evaluate('window.mockFailWrite=true');page.locator('#flash').click()
 page.wait_for_function("document.getElementById('result').textContent.includes('Simulated write failure')")
 check(page.evaluate('window.mockWrites')==before+1,'simulated write failure reaches write once')
 check(page.locator('#flash').is_disabled() and page.locator('#verify-backup').is_disabled(),'write failure consumes backup verification')
 check(not page.locator('#consent').is_checked(),'write failure consumes explicit approval')
 check(page.locator('#save-meta').is_disabled(),'write failure disables stale sidecar download')
 page.locator('#restore-bin').set_input_files(backup);page.locator('#restore-json').set_input_files(metadata);page.locator('#restore-consent').check()
 check(page.locator('#restore').is_enabled(),'saved stock backup remains available for recovery after failure')
 page.locator('#restore').click();page.wait_for_function("document.getElementById('result').textContent.startsWith('기록 및 읽기 검증 완료')")
 check(page.evaluate('window.mockFlash.every(x=>x===42)'),'recovery after write failure returns original bytes')
 prepare_install();before=page.evaluate('window.mockWrites')
 manifest=json.loads((ROOT/'web/downloads/manifest.json').read_text());manifest['sha256']='0'*64
 page.route('**/downloads/manifest.json',lambda r:r.fulfill(json=manifest))
 page.locator('#flash').click();page.wait_for_function("document.getElementById('result').textContent.includes('펌웨어 SHA-256 불일치')")
 check(page.evaluate('window.mockWrites')==before,'manifest hash mismatch blocked before writing')
 page.unroute('**/downloads/manifest.json')
 page.evaluate('window.mockCorruptWrite=true');page.locator('#flash').click()
 page.wait_for_function("document.getElementById('result').textContent.includes('기록 후 SHA-256 불일치')")
 check(page.locator('#flash').is_disabled() and page.locator('#verify-backup').is_disabled(),'readback failure consumes backup verification')
 check(not page.locator('#consent').is_checked(),'readback failure consumes explicit approval')
 browser.close()
(ROOT/'release/uploader-results.json').write_text(json.dumps({'passed':len(checks),'checks':checks,'hardware':False,'method':'mock esptool-js adapter, real browser file/download/hash flows'},ensure_ascii=False,indent=2))
print('PASS:',len(checks),'uploader checks (mock serial only)')