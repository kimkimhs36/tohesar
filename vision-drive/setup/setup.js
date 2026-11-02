import {ESPLoader,Transport} from './vendor/esptool.bundle.js';
import {readFlashVerified} from './flash-io.js';
const $=id=>document.getElementById(id),SIZE=4*1024*1024;
let loader,transport,mac='',busy=false,backupHash='',verified=false,backupRecord=null,metadataSaved=false;
const controls=['connect','disconnect','backup','verify-backup','flash','restore','restore-bin','restore-json','consent','restore-consent','save-meta'];
function refresh(){
 for(const id of controls)$(id).disabled=busy;
 $('connect').disabled=busy||!!loader||!navigator.serial;
 $('disconnect').disabled=busy||!loader;
 $('backup').disabled=busy||!loader;
 $('verify-backup').disabled=busy||!backupHash;
 $('save-meta').disabled=busy||!backupRecord;
 $('flash').disabled=busy||!loader||!verified||!metadataSaved||!$('consent').checked;
 $('restore').disabled=busy||!loader||!$('restore-bin').files.length||!$('restore-json').files.length||!$('restore-consent').checked;
}
function log(s){$('terminal').textContent=(($('terminal').textContent+s+'\n').slice(-20000));}
async function sha(buffer){const b=await crypto.subtle.digest('SHA-256',buffer);return [...new Uint8Array(b)].map(n=>n.toString(16).padStart(2,'0')).join('');}
function save(data,name,type){const u=URL.createObjectURL(new Blob([data],{type})),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),15000);}
async function work(fn){if(busy)return;busy=true;refresh();$('progress').value=0;try{await fn();}catch(e){log(String(e));$('result').textContent='중단: '+e.message+' · 기기에 기록 중이었다면 전원을 켜지 말고 백업으로 복원하세요.';}finally{busy=false;refresh();}}
const progress=(n,total)=>{$('progress').value=n/total*100;};
function binary(bytes){let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return s;}
async function readVerified(size){return readFlashVerified(loader,transport,size,progress,buffer=>SparkMD5.ArrayBuffer.hash(buffer));}
function clearBackup(){
 verified=false;backupHash='';backupRecord=null;metadataSaved=false;$('verify-backup').value='';$('consent').checked=false;
 $('backup-state').textContent='백업 전 · 새 설치에는 전체 백업과 BIN·JSON 저장 확인이 필요합니다.';
}
function backupStatus(){
 $('backup-state').textContent=verified?(metadataSaved?'저장한 백업 파일 SHA-256 일치 · JSON 저장 확인 · 설치 가능':'저장한 백업 파일 SHA-256 일치 · 백업 JSON 기록도 저장하세요.'):'BIN과 JSON을 저장한 뒤, 저장한 BIN 파일을 다시 선택하세요.';
}
async function writeVerified(bytes,hash){
 if(loader.chip.CHIP_NAME!=='ESP32')throw Error('ESP32 기기가 아닙니다');
 clearBackup();$('restore-consent').checked=false; // consume approval even if writing or readback fails
 $('result').textContent='플래시 기록 중 · USB를 분리하지 마세요';
 await loader.writeFlash({fileArray:[{data:binary(bytes),address:0}],flashSize:'keep',flashMode:'keep',flashFreq:'keep',eraseAll:false,compress:true,reportProgress:(_i,n,total)=>progress(n,total)});
 $('result').textContent='기록 완료 · 다시 읽어 검증 중';
 const back=await readVerified(bytes.length);if(await sha(back)!==hash)throw Error('기록 후 SHA-256 불일치');
 $('result').textContent='기록 및 읽기 검증 완료. 연결 해제 후 GPIO0–GND를 해제하고 전원을 다시 켜세요.';
}
$('connect').onclick=()=>work(async()=>{
 const device=await navigator.serial.requestPort();transport=new Transport(device,true);
 try{
  loader=new ESPLoader({transport,baudrate:115200,terminal:{clean(){},writeLine:log,write:log}});
  const chip=await loader.main();if(loader.chip.CHIP_NAME!=='ESP32')throw Error('KS5023용 ESP32만 지원합니다');
  if(await loader.getFlashSize()!==4096)throw Error('공식 구성인 4 MB 플래시가 아닙니다');
  mac=await loader.chip.readMac(loader);$('device').textContent=chip+' / '+mac+' / 4 MB';$('result').textContent='읽기 연결됨 · 아직 플래시에 기록하지 않았습니다.';
 }catch(e){loader=null;if(transport)await transport.disconnect().catch(()=>{});throw e;}
});
$('disconnect').onclick=()=>work(async()=>{if(transport)await transport.disconnect();loader=null;transport=null;mac='';clearBackup();$('device').textContent='연결 해제됨';$('result').textContent='GPIO0–GND를 해제한 뒤 재시작하세요.';});
$('backup').onclick=()=>work(async()=>{
 clearBackup();$('result').textContent='4 MB 전체 백업 읽는 중 · 몇 분 걸릴 수 있습니다';
 const bytes=await readVerified(SIZE);backupHash=await sha(bytes);
 const name='stock-'+mac.replaceAll(':','')+'-'+new Date().toISOString().slice(0,10);
 save(bytes,name+'.bin','application/octet-stream');
 // A separate click avoids browsers silently blocking multiple automatic downloads.
 const metadata={format:'vision-drive-backup-v1',mac,size:SIZE,sha256:backupHash,created:new Date().toISOString()};
 backupRecord={metadata,name};backupStatus();
 $('result').textContent='백업 읽기·MD5 검증 완료. BIN과 JSON을 함께 보관하세요.';
});
$('save-meta').onclick=()=>{if(busy||!backupRecord)return;save(JSON.stringify(backupRecord.metadata,null,2),backupRecord.name+'.json','application/json');metadataSaved=true;backupStatus();refresh();};
$('verify-backup').onchange=()=>work(async()=>{verified=false;backupStatus();const file=$('verify-backup').files[0];if(!file||file.size!==SIZE||await sha(await file.arrayBuffer())!==backupHash)throw Error('방금 읽은 백업 파일과 다릅니다');verified=true;backupStatus();});
$('flash').onclick=()=>work(async()=>{
 if(!verified||!metadataSaved||!$('consent').checked)throw Error('백업 BIN 확인·JSON 저장과 기기 기록 동의가 필요합니다');
 const r=await fetch('../downloads/manifest.json',{cache:'no-store'});if(!r.ok)throw Error('매니페스트 다운로드 실패');const m=await r.json();
 const f=await fetch('../downloads/'+m.file,{cache:'no-store'});if(!f.ok)throw Error('펌웨어 다운로드 실패');const bytes=new Uint8Array(await f.arrayBuffer());
 if(bytes.length!==m.size||await sha(bytes)!==m.sha256)throw Error('펌웨어 SHA-256 불일치');await writeVerified(bytes,m.sha256);
});
$('restore').onclick=()=>work(async()=>{
 if(!$('restore-consent').checked)throw Error('복원 동의 필요');
 const meta=JSON.parse(await $('restore-json').files[0].text()),bytes=new Uint8Array(await $('restore-bin').files[0].arrayBuffer());
 if(meta.format!=='vision-drive-backup-v1'||meta.mac!==mac||meta.size!==SIZE||bytes.length!==SIZE||await sha(bytes)!==meta.sha256)throw Error('기기 MAC 또는 백업 SHA-256 불일치');
 await writeVerified(bytes,meta.sha256);
});
for(const id of ['consent','restore-consent','restore-bin','restore-json'])$(id).onchange=refresh;
$('support').textContent=navigator.serial&&isSecureContext?'이 브라우저는 Web Serial을 지원합니다.':'데스크톱 Chrome 또는 Edge에서 HTTPS로 이 페이지를 열어 주세요. iPad·Safari는 USB 설치를 지원하지 않습니다.';
refresh();
