/* VISION DRIVE 4.0 — native browser UI. Simulation never constructs a robot transport. */
'use strict';
(() => {
const $=id=>document.getElementById(id), sim=document.body.dataset.mode==='simulation';
const local=!sim && location.protocol==='http:' && location.hostname==='192.168.4.1';
let stopRequest=null;
let armed=false,token=0,seq=0,epoch=0,busy=false,arming=false,power=85,trim=0,led=false,x=0,y=0,pointer=null;
let lastFrame=0,frameOK=false,connected=false,stopped=false,videoEpoch=0,blobURL='',mirrored=false,recorder=null,recordTimer=0,captureAbort=null;
const events=[], rtts=[], openedAt=new Date().toISOString(), keys=new Set();let lastDiagnostic=null,diagnosing=false;const simState={x:0,y:0,angle:0};let sentL=0,sentR=0;
function log(event,detail={}){events.push({at:new Date().toISOString(),event,...detail});if(events.length>1000)events.shift();}
function toast(s){$('toast').textContent=s;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),3500);}
function setStatus(s,kind=''){$('link-state').textContent=s;$('link-dot').className=kind;}
function setNote(s){$('safety-note').textContent=s;}
function vector(){let l=y+x,r=y-x,n=Math.max(1,Math.abs(l),Math.abs(r));l/=n;r/=n;if(trim>0)l*=1-trim/100;if(trim<0)r*=1+trim/100;return [Math.round(l*power),Math.round(r*power)];}
function direction(){if(!x&&!y)return 'NEUTRAL';if(Math.abs(x)>Math.abs(y))return x>0?'TURN RIGHT':'TURN LEFT';return y>0?'FORWARD':'REVERSE';}
function render(){
 const [l,r]=armed?vector():[0,0];$('left-output').textContent=l;$('right-output').textContent=r;$('direction').textContent=armed?direction():'NEUTRAL';
 $('knob').style.transform=`translate(${x*45}px,${-y*45}px)`;document.body.classList.toggle('armed',armed);
 $('arm').classList.toggle('is-armed',armed);$('arm').innerHTML=armed?sim?'시뮬레이션 활성 <span>●</span>':'구동 준비됨 <span>●</span>':arming?'준비 확인 중 <span>…</span>':sim?'시뮬레이션 시작 <span>↗</span>':'구동 준비 <span>↗</span>';
 $('arm').disabled=arming || !!stopRequest || (!sim && (!connected||!frameOK||performance.now()-lastFrame>900));
 document.querySelectorAll('[data-power]').forEach(b=>b.disabled=armed||arming);$('trim').disabled=armed||arming;$('led').disabled=!armed;
 $('led').setAttribute('aria-pressed',String(led));$('led').querySelector('b').textContent=led?'ON':'OFF';
}
function neutral(){x=y=0;keys.clear();pointer=null;document.querySelectorAll('[data-dir]').forEach(b=>b.classList.remove('active'));render();}
async function request(path,data,timeout=250){
 if(!local)throw Error('Local robot only');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);
 try {const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:controller.signal,cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);return await response.json();}finally{clearTimeout(timer);}
}
function sendStop(){if(!local)return Promise.resolve();if(stopRequest)return stopRequest;stopRequest=request('/api/stop',{},220).catch(()=>{}).finally(()=>{stopRequest=null;render();});render();return stopRequest;}
function stop(reason='정지 · 잠금',send=true){
 epoch++;armed=false;token=0;arming=false;led=false;neutral();setNote(reason);setStatus(sim?'시뮬레이션 · 잠금':connected?'로봇 연결 · 잠금':'연결 대기',connected?'ready':'');log('lock',{reason});
 if(send&&local)sendStop();
 if(recorder?.state==='recording')recorder.stop();
}
async function arm(){
 if(armed){stop('직접 잠금');return;}
 if(arming||stopRequest)return;
 neutral();const e=++epoch;arming=true;render();
 try{
  if(!sim && (!frameOK||performance.now()-lastFrame>900))throw Error('영상 확인 필요');
  const response=sim?{token:1}:await request('/api/arm',{});
  if(e!==epoch){if(local)sendStop();return;}
  token=response.token;seq=0;armed=true;arming=false;setStatus(sim?'시뮬레이션 · 조작 중':'로봇 연결 · 구동 준비','armed');setNote(sim?'가상 입력만 표시합니다 · 실제 로봇은 움직이지 않습니다':'누르는 동안만 이동합니다 · STOP으로 잠금');log('armed');render();ensureSteeringVisible();
 }catch(error){if(e!==epoch)return;stop('준비 불가 · 현재 영상과 연결을 확인하세요');}
}
function ensureSteeringVisible(){
 if(!matchMedia('(max-width:899px)').matches)return;
 requestAnimationFrame(()=>{if(!armed||pointer!==null||keys.size)return;const joy=$('joystick').getBoundingClientRect(),stopBox=$('stop').getBoundingClientRect();let delta=0;
  if(joy.bottom>stopBox.top-12)delta=joy.bottom-stopBox.top+12;else if(joy.top<16)delta=joy.top-16;
  if(delta)window.scrollBy(0,delta);
 });
}
async function heartbeat(){
 if(!armed||busy||sim)return;
 if(!frameOK||performance.now()-lastFrame>900){stop('영상 갱신 중단 · 잠금');return;}
 busy=true;const e=epoch,start=performance.now(),[left,right]=vector();
 try{await request('/api/control',{token,seq:++seq,left,right,led:led?1:0});if(e!==epoch)return;const rtt=performance.now()-start;rtts.push(rtt);if(rtts.length>1500)rtts.shift();$('latency').textContent=`응답 ${Math.round(rtt)} ms`;if(left!==sentL||right!==sentR)log('command-ack',{left,right,led});sentL=left;sentR=right;}
 catch(error){if(e===epoch){connected=false;stop('제어 응답 없음 · 로봇 명령 만료 후 정지');}}
 finally{busy=false;}
}
setInterval(heartbeat,80);
async function pollStatus(){
 if(!local)return;
 const c=new AbortController(),t=setTimeout(()=>c.abort(),800);
 try{const r=await fetch('/api/status',{signal:c.signal,cache:'no-store'});if(!r.ok)throw Error();const s=await r.json();if(s.product!=='VISION DRIVE'||s.version!=='4.0.0')throw Error();connected=true;
  if(armed&&!s.armed)stop('로봇 안전 잠금 · 다시 준비하세요',false);
  if(!armed&&!arming)setStatus(s.camera?'로봇 연결 · 잠금':'카메라 오류 · 구동 불가','ready');
 }catch(e){connected=false;if(armed||arming)stop('로봇 연결 끊김 · 잠금');else setStatus('로봇 응답 대기');}
 finally{clearTimeout(t);render();}
}
async function captureLoop(e){
 if(!local||e!==videoEpoch||document.hidden)return;
 const c=new AbortController(),timer=setTimeout(()=>c.abort(),1100);captureAbort=c;let next='';
 try{
  const r=await fetch('http://192.168.4.1:81/capture?t='+Date.now(),{signal:c.signal,cache:'no-store'});if(!r.ok)throw Error();const blob=await r.blob();if(!blob.type.startsWith('image/jpeg'))throw Error();
  next=URL.createObjectURL(blob);const decoded=new Image();decoded.src=next;await decoded.decode();
  if(e!==videoEpoch){URL.revokeObjectURL(next);return;}
  $('camera').src=next;const old=blobURL;blobURL=next;if(old)URL.revokeObjectURL(old);
  lastFrame=performance.now();frameOK=true;$('camera').hidden=false;$('standby').hidden=true;$('frame-state').textContent='JPEG / 수신 프레임';
 }catch(error){if(next&&next!==blobURL)URL.revokeObjectURL(next);if(e===videoEpoch){frameOK=false;if(armed||arming)stop('카메라 응답 없음 · 잠금');$('frame-state').textContent='영상 대기 · 구동 잠금';$('camera').hidden=true;$('standby').hidden=false;}}
 finally{clearTimeout(timer);if(e===videoEpoch)setTimeout(()=>captureLoop(e),frameOK?40:600);render();}
}
function restartVideo(){if(sim){toast('시뮬레이션은 실제 영상이 없습니다');return;}stop('영상 재연결 · 현재 장면을 확인하세요');frameOK=false;const current=++videoEpoch;captureAbort?.abort();Promise.resolve(stopRequest).then(()=>{if(current===videoEpoch)captureLoop(current);});}
setInterval(()=>{if(!sim&&lastFrame&&performance.now()-lastFrame>900){frameOK=false;if(armed)stop('영상 갱신 중단 · 잠금');$('frame-state').textContent='프레임 오래됨 · 잠금';$('camera').hidden=true;$('standby').hidden=false;render();}},100);
function setVector(a,b){if(!armed)return;x=Math.abs(a)<.08?0:Math.max(-1,Math.min(1,a));y=Math.abs(b)<.08?0:Math.max(-1,Math.min(1,b));render();}
function joystickEvent(e){const r=$('joystick').getBoundingClientRect(),dx=(e.clientX-r.left-r.width/2)/(r.width*.36),dy=-(e.clientY-r.top-r.height/2)/(r.height*.36),n=Math.max(1,Math.hypot(dx,dy));setVector(dx/n,dy/n);}
$('joystick').addEventListener('pointerdown',e=>{if(!armed||pointer!==null||keys.size)return;e.preventDefault();pointer=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);joystickEvent(e);});
$('joystick').addEventListener('pointermove',e=>{if(e.pointerId===pointer){e.preventDefault();joystickEvent(e);}});
for(const type of ['pointerup','pointercancel','lostpointercapture'])$('joystick').addEventListener(type,e=>{if(e.pointerId===pointer)neutral();});
const directions={forward:[0,1],backward:[0,-1],left:[-1,0],right:[1,0]};
for(const b of document.querySelectorAll('[data-dir]')){
 b.addEventListener('pointerdown',e=>{if(!armed||pointer!==null||keys.size)return;e.preventDefault();pointer=e.pointerId;b.setPointerCapture(e.pointerId);setVector(...directions[b.dataset.dir]);b.classList.add('active');});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,e=>{if(e.pointerId===pointer)neutral();});
}
const keyMap={w:'forward',arrowup:'forward',s:'backward',arrowdown:'backward',a:'left',arrowleft:'left',d:'right',arrowright:'right'};
function keyVector(){const vals=[...keys].map(k=>keyMap[k]);setVector((vals.includes('right')?1:0)-(vals.includes('left')?1:0),(vals.includes('forward')?1:0)-(vals.includes('backward')?1:0));}
window.addEventListener('keydown',e=>{if(e.key==='Escape'||e.code==='Space'&&!/INPUT|TEXTAREA/.test(e.target.tagName)){e.preventDefault();stop();return;}const k=e.key.toLowerCase();if(!keyMap[k]||/INPUT|TEXTAREA/.test(e.target.tagName)||$('guide-dialog').open)return;e.preventDefault();if(!armed||pointer!==null)return;keys.add(k);keyVector();});
window.addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(keys.delete(k))keyVector();});
window.addEventListener('blur',()=>stop('창 이탈 · 잠금'));
window.addEventListener('pagehide',()=>{stop('페이지 종료 · 잠금',false);if(local)fetch('/api/stop',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',keepalive:true}).catch(()=>{});});
document.addEventListener('visibilitychange',()=>{if(document.hidden){videoEpoch++;captureAbort?.abort();frameOK=false;stop('화면 숨김 · 잠금');}else{pollStatus();if(!sim)captureLoop(++videoEpoch);}});
$('stop').addEventListener('click',()=>stop());$('arm').addEventListener('click',arm);
for(const b of document.querySelectorAll('[data-power]')) b.addEventListener('click',()=>{if(armed||arming)return;power=Number(b.dataset.power);$('power-number').textContent=Math.round(power/255*100);document.querySelectorAll('[data-power]').forEach(i=>{i.classList.toggle('selected',i===b);i.setAttribute('aria-pressed',String(i===b));});document.querySelectorAll('.power-scale i').forEach((i,n)=>i.classList.toggle('selected',n<Math.round(power/255*12)));log('power',{power});});
$('trim').addEventListener('input',()=>{trim=Number($('trim').value);$('trim-value').value=trim>0?'+'+trim:String(trim);});
$('led').addEventListener('click',()=>{if(armed){led=!led;log('led-command',{led});render();}});
$('mirror').addEventListener('click',()=>{mirrored=!mirrored;$('camera').classList.toggle('mirrored',mirrored);$('mirror').setAttribute('aria-pressed',String(mirrored));});
$('grid').addEventListener('click',()=>{$('guides').hidden=!$('guides').hidden;$('grid').setAttribute('aria-pressed',String(!$('guides').hidden));});
$('reconnect').addEventListener('click',restartVideo);
$('help').addEventListener('click',()=>{stop('안내 열기 · 잠금');showTab('notes');$('guide-dialog').showModal();});$('close-help').addEventListener('click',()=>$('guide-dialog').close());$('guide-dialog').addEventListener('close',()=>{if(diagnosing)stop('진단 화면 닫기 · 잠금');});
$('fullscreen').addEventListener('click',async()=>{stop('전체 화면 전환 · 잠금');try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else toast('Safari: 공유 메뉴에서 홈 화면에 추가하면 넓게 볼 수 있습니다');}catch(e){toast('이 브라우저에서 전체 화면을 열 수 없습니다');}});
function download(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),15000);}
function frameCanvas(){if(!frameOK||performance.now()-lastFrame>1000)throw Error('현재 수신 영상이 없습니다');const c=document.createElement('canvas');c.width=$('camera').naturalWidth;c.height=$('camera').naturalHeight;const ctx=c.getContext('2d');if(mirrored){ctx.translate(c.width,0);ctx.scale(-1,1);}ctx.drawImage($('camera'),0,0);return c;}
$('snapshot').addEventListener('click',()=>{try{const c=frameCanvas();c.toBlob(b=>{if(b)download(b,'VISION-DRIVE-'+Date.now()+'.jpg');},'image/jpeg',.95);}catch(e){toast(e.message);}});
$('record').addEventListener('click',()=>{
 if(recorder?.state==='recording'){recorder.stop();return;}
 try{
  const c=frameCanvas();if(!window.MediaRecorder||!c.captureStream)throw Error('이 브라우저는 녹화를 지원하지 않습니다. 사진 저장을 사용하세요.');
  const chunks=[];const stream=c.captureStream(12);recorder=new MediaRecorder(stream);recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  const draw=setInterval(()=>{try{const f=frameCanvas();c.getContext('2d').drawImage(f,0,0);}catch(e){if(recorder.state==='recording')recorder.stop();}},80);
  recorder.onstop=()=>{clearInterval(draw);clearTimeout(recordTimer);stream.getTracks().forEach(t=>t.stop());$('record').textContent='녹화';download(new Blob(chunks,{type:recorder.mimeType}),'VISION-DRIVE-'+Date.now()+(recorder.mimeType.includes('mp4')?'.mp4':'.webm'));};
  recorder.start();$('record').textContent='■ 녹화 종료';recordTimer=setTimeout(()=>{if(recorder.state==='recording')recorder.stop();},60000);toast('최대 60초 · 이 브라우저에 수신된 영상을 저장합니다');
 }catch(e){toast(e.message);}
});
try{$('notes').value=localStorage.getItem('vd4-notes')||'';}catch(e){}
$('notes').addEventListener('input',()=>{try{localStorage.setItem('vd4-notes',$('notes').value);}catch(e){}});
function statistics(values){const a=[...values].sort((a,b)=>a-b);return {count:a.length,median:a.length?a[Math.floor(a.length/2)]:null,p95:a.length?a[Math.ceil(a.length*.95)-1]:null,max:a.length?a[a.length-1]:null};}
function summary(){return {version:'4.0.0',mode:sim?'simulation':'robot',openedAt,exportedAt:new Date().toISOString(),note:$('notes').value,meaning:'Commands and HTTP responses; no physical motion sensing or physical test pass determination',responses:statistics(rtts),diagnostics:lastDiagnostic,events:[...events]};}
function saveJSON(){download(new Blob([JSON.stringify(summary(),null,2)],{type:'application/json'}),'VISION-DRIVE-log.json');}
$('export').addEventListener('click',saveJSON);$('save-json').addEventListener('click',saveJSON);
function showTab(name){
 for(const tab of ['notes','diagnostics','report']){$(tab+'-content').hidden=tab!==name;$(tab+'-tab').classList.toggle('selected',tab===name);$(tab+'-tab').setAttribute('aria-pressed',String(tab===name));}
 if(name==='report'){const s=statistics(rtts);$('rtt-count').textContent=String(s.count);$('rtt-summary').textContent=s.count?`${Math.round(s.median)} / ${Math.round(s.p95)} ms`:'측정 없음';}
}
for(const name of ['notes','diagnostics','report'])$(name+'-tab').addEventListener('click',()=>showTab(name));
$('run-diagnostics').addEventListener('click',async()=>{
 if(sim){$('diagnostic-result').textContent='시뮬레이션에는 로봇 연결이 없어 응답 시간을 측정하지 않습니다.';return;}
 if(diagnosing||!local)return;stop('통신 진단 · 구동 잠금');const e=epoch;diagnosing=true;$('run-diagnostics').disabled=true;$('diagnostic-plot').replaceChildren();
 const samples=[];let failures=0;
 try{
  for(let i=0;i<20;i++){
   if(e!==epoch)break;const c=new AbortController(),timer=setTimeout(()=>c.abort(),500),start=performance.now();let value=null;
   try{const r=await fetch('/api/status',{cache:'no-store',signal:c.signal});if(!r.ok)throw Error();const status=await r.json();if(status.product!=='VISION DRIVE')throw Error();value=performance.now()-start;}
   catch(error){failures++;}finally{clearTimeout(timer);}
   if(e!==epoch)break;samples.push(value);$('diagnostic-result').textContent=`잠금 상태에서 측정 중 · ${i+1} / 20`;
   const bar=document.createElement('i');bar.style.height=value===null?'100%':Math.min(100,Math.max(4,value/500*100))+'%';bar.classList.toggle('failed',value===null);bar.title=value===null?'응답 실패':value.toFixed(1)+' ms';$('diagnostic-plot').append(bar);
   await new Promise(resolve=>setTimeout(resolve,100));
  }
  if(e===epoch){const stat=statistics(samples.filter(v=>v!==null));lastDiagnostic={at:new Date().toISOString(),samples,failures,measure:'HTTP GET /api/status RTT, not camera or actuator latency',...stat};
   $('diagnostic-result').textContent=stat.count?`응답 ${stat.count} / ${samples.length} · 중앙값 ${Math.round(stat.median)} ms · P95 ${Math.round(stat.p95)} ms · 최대 ${Math.round(stat.max)} ms · 실패 ${failures}회`:'모든 요청이 실패했습니다. 로봇 Wi-Fi와 전원을 확인하세요.';log('diagnostics',{count:stat.count,failures});}
  else $('diagnostic-result').textContent='진단 중단 · 다시 시작할 수 있습니다.';
 }finally{diagnosing=false;$('run-diagnostics').disabled=false;}
});
$('save-report').addEventListener('click',()=>{
 const data=summary(),s=data.responses,escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const rows=events.filter(e=>['armed','lock','power','command-ack','diagnostics'].includes(e.event)).slice(-200).map(e=>`<tr><td>${escape(e.at)}</td><td>${escape(e.event)}</td><td>${escape(JSON.stringify(Object.fromEntries(Object.entries(e).filter(([k])=>!['at','event'].includes(k)))))}</td></tr>`).join('');
 const stat=s.count?`${s.count}개 / 중앙값 ${Math.round(s.median)} ms / P95 ${Math.round(s.p95)} ms`:'측정 없음';
 const html=`<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>VISION DRIVE 시운전 기록</title><style>body{max-width:960px;margin:50px auto;padding:0 24px;background:#e9e6de;color:#252823;font:14px/1.8 Arial,sans-serif}header{border-bottom:2px solid;padding-bottom:16px;display:flex;justify-content:space-between;font:11px monospace}h1{font-size:42px;font-weight:400;margin:35px 0}h2{font-size:20px;font-weight:400;border-top:1px solid #adb69e;padding-top:22px}p{white-space:pre-wrap}table{border-collapse:collapse;width:100%;font:10px/1.7 monospace}td,th{text-align:left;border-bottom:1px solid #bac2ae;padding:8px;vertical-align:top;word-break:break-word}aside{border-left:3px solid #bb421f;padding:10px 20px}small{font-size:11px}@media print{body{background:white;margin:15px}tr{break-inside:avoid}}</style><header><span>VISION DRIVE / 04</span><span>TOHEŞAR × TEAM BKIT</span></header><h1>시운전 기록.</h1><aside>${sim?'가상 시뮬레이션 기록입니다. 실제 로봇 시험 결과가 아닙니다.':'명령과 HTTP 응답 기록입니다. 실제 모터 움직임·정지 시간·센서값을 확인한 결과가 아닙니다.'}</aside><h2>세션</h2><p>시작: ${escape(data.openedAt)}
내보내기: ${escape(data.exportedAt)}
모드: ${escape(data.mode)}
제어 응답: ${escape(stat)}</p><small>최근 최대 1500개 응답의 왕복 시간입니다. 영상 또는 모터 동작 지연이 아닙니다.</small><h2>관찰 메모</h2><p>${escape(data.note||'기록된 관찰 메모가 없습니다.')}</p><h2>통신 진단</h2><p>${escape(lastDiagnostic?JSON.stringify(lastDiagnostic,null,2):'실행하지 않았습니다.')}</p><h2>명령 기록</h2><small>최근 최대 200개 주요 이벤트. 전체 기록은 JSON으로 내보낼 수 있습니다.</small><table><tr><th>시각 / UTC</th><th>이벤트</th><th>요청·응답</th></tr>${rows}</table><p><small>관찰자가 직접 확인한 물리적 시험 결과는 메모와 별도 측정 자료로 남겨 주세요.</small></p></html>`;
 download(new Blob([html],{type:'text/html;charset=utf-8'}),'VISION-DRIVE-report-'+Date.now()+'.html');
});
function simulation(){
 const canvas=$('simulation'),ctx=canvas.getContext('2d');canvas.hidden=false;$('standby').hidden=true;let previous=0;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function draw(t){const box=canvas.getBoundingClientRect(),w=box.width,h=box.height,dpr=Math.min(devicePixelRatio,2);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);const dt=Math.min((t-previous)/1000||0,.05);previous=t;
  if(armed&&!reduce){const [l,r]=vector();simState.angle+=(l-r)/255*dt*1.1;const v=(l+r)/510*dt*80;simState.x=Math.max(-w*.35,Math.min(w*.35,simState.x+Math.sin(simState.angle)*v));simState.y=Math.max(-h*.26,Math.min(h*.26,simState.y-Math.cos(simState.angle)*v));}
  ctx.fillStyle='#202820';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#3b4839';ctx.lineWidth=.65;
  for(let i=-w;i<w*2;i+=38){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,h);ctx.stroke();}for(let i=0;i<h;i+=38){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(w,i);ctx.stroke();}
  ctx.strokeStyle='#73836a';ctx.lineWidth=1;ctx.setLineDash([7,9]);ctx.strokeRect(w*.12,h*.15,w*.76,h*.66);ctx.setLineDash([]);ctx.strokeStyle='#b8c1a4';ctx.beginPath();ctx.moveTo(w*.5,h*.15-8);ctx.lineTo(w*.5,h*.15+8);ctx.stroke();
  ctx.fillStyle='#aebd9e';ctx.font='9px monospace';ctx.fillText('CONTROL STUDY / 01',24,29);ctx.fillText('VIRTUAL SPACE · NO HARDWARE',24,h-65);
  ctx.save();ctx.translate(w/2+simState.x,h/2+simState.y);ctx.rotate(simState.angle);
  if(led){ctx.fillStyle='#dae6b21c';ctx.beginPath();ctx.moveTo(-10,-25);ctx.lineTo(-65,-120);ctx.lineTo(65,-120);ctx.lineTo(10,-25);ctx.fill();}
  ctx.fillStyle='#141c16';ctx.fillRect(-29,-21,12,42);ctx.fillRect(17,-21,12,42);ctx.fillStyle='#dcdac5';ctx.fillRect(-18,-30,36,60);ctx.strokeStyle='#8e9c7e';ctx.strokeRect(-13,-25,26,50);ctx.fillStyle='#303d2c';ctx.fillRect(-12,-23,24,17);ctx.fillStyle='#c8663d';ctx.beginPath();ctx.arc(0,-15,5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#6f7d60';ctx.beginPath();ctx.moveTo(-8,10);ctx.lineTo(8,10);ctx.moveTo(0,2);ctx.lineTo(0,18);ctx.stroke();ctx.restore();requestAnimationFrame(draw);
 }requestAnimationFrame(draw);
}
if(sim){
 $('mode-label').textContent='SIMULATION / 실제 로봇에 연결되지 않습니다';$('view-name').textContent='01 — VIRTUAL TEST FIELD';$('latency').textContent='가상 입력 · 통신 없음';$('frame-state').textContent='INPUT VISUALIZATION · NOT LIVE';$('safety-spec').textContent='가상 입력 실험 · 실제 속도 및 궤적 예측 아님';$('mode-explanation').textContent='이 화면은 입력 시각화용 시뮬레이션입니다. 로봇으로 명령을 보내지 않으며 실제 속도·회전 반경을 예측하지 않습니다.';connected=true;setStatus('시뮬레이션 · 잠금','ready');simulation();
 for(const id of ['snapshot','record','mirror','reconnect'])$(id).hidden=true;
}else if(local){sendStop().then(()=>{pollStatus();captureLoop(++videoEpoch);});setInterval(pollStatus,1600);}
else{setStatus('로봇 Wi-Fi에서 열어 주세요');$('standby-title').textContent='로봇에 직접 연결하세요.';$('standby-detail').textContent='VISION-DRIVE Wi-Fi → http://192.168.4.1';}
document.querySelectorAll('.power-scale i').forEach((i,n)=>i.classList.toggle('selected',n<4));
render();log('opened',{mode:sim?'simulation':'robot'});
})();
