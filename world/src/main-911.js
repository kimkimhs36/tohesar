import {createWorld} from './world-911.js';

const $=s=>document.querySelector(s),canvas=$('#world'),status=$('#status'),enter=$('#enter'),enterLabel=$('#enter-label'),pause=$('#pause'),range=$('#journey'),dialog=$('#archive');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let world,progress=0,playing=false,started=false,lastTime=0,elapsed=0,raf=0,contextLost=false,archiveWasPlaying=false,pan={x:0,y:0},slowTime=0,samples=[],samplesCount=0,renderFrames=0;
let audioContext,audioGain,soundOn=false;
const diagnostics={engine:'Three.js r180 / WebGL2',target:'iPhone Safari',deviceVerified:false,frames:0,resolutionScale:0,contextLosses:0,fallback:false,frameTimings:[],errors:[]};
window.__TOHESAR={diagnostics,get progress(){return progress;},setProgress(p){navigate(p);},get world(){return world;}};
if(/Instagram/i.test(navigator.userAgent))$('#browser-hint').hidden=false;
function report(text){status.textContent=text;}
function fail(err){diagnostics.fallback=true;diagnostics.errors.push(String(err));document.body.classList.remove('ready');enter.disabled=false;enterLabel.textContent='요코하마 아카이브 열기';report('3D를 사용할 수 없어 사진과 저널로 이어갑니다.');playing=false;}
function updateUI(){range.value=String(Math.round(progress*1000));document.body.classList.toggle('traveling',started&&progress<.94);document.body.classList.toggle('arrived',progress>=.94);document.body.classList.toggle('paused',started&&!playing);pause.hidden=!started||progress>=1||reduce.matches;pause.textContent=playing?'PAUSE Ⅱ':'PLAY ▷';pause.setAttribute('aria-label',playing?'카메라 이동 일시정지':'카메라 이동 재생');if(progress>=.94){$('#chapter-label').textContent='03 — THE MEMORY';$('#chapter-title').innerHTML='A place.<br><em>A memory.</em>';$('#chapter-subtitle').textContent='지나온 장면은 기록이 된다.';enterLabel.textContent='이 장면의 기록을 열다';}else if(started){enterLabel.textContent=playing?'잠시 멈춰 바라보기':reduce.matches?'다음 장면으로 이동':'이어서 걷기';}else{enterLabel.textContent=reduce.matches?'장면을 한 장씩 둘러보기':'빛이 남아 있는 곳으로';}}
function navigate(p){progress=Math.max(0,Math.min(1,p));started=true;playing=false;updateUI();drawOnce();}
function drawOnce(){if(world&&!contextLost){world.render(progress,elapsed,reduce.matches?0:1,pan);}}
function loop(now){raf=0;if(document.hidden||contextLost||dialog.open||!world)return;const rawDt=lastTime?(now-lastTime)/1000:0;const dt=Math.min(rawDt,.12);lastTime=now;elapsed+=dt;
 if(playing){progress=Math.min(1,progress+dt/11);if(progress>=1)playing=false;updateUI();}
 world.render(progress,elapsed,reduce.matches?0:1,pan);renderFrames++;diagnostics.frames=renderFrames;diagnostics.resolutionScale=world.pixelRatio;
 // Sustained load only; keep a minimum 1.25x buffer and never remove core materials.
 if(dt>0&&renderFrames>35&&!reduce.matches){samples.push(rawDt*1000);samplesCount++;if(samples.length>180)samples.shift();if(rawDt>.045)slowTime+=rawDt;else slowTime=Math.max(0,slowTime-dt*.6);if(slowTime>5&&world.pixelRatio>1.25){world.setScale(Math.max(1.25,world.pixelRatio-.25));slowTime=0;}if(samplesCount%90===0)diagnostics.frameTimings=[...samples];}
 if(!reduce.matches||playing)raf=requestAnimationFrame(loop);
}
function resumeLoop(){if(!raf&&!contextLost&&!document.hidden&&!dialog.open&&world){lastTime=0;raf=requestAnimationFrame(loop);}}
function openArchive(){archiveWasPlaying=playing;playing=false;updateUI();dialog.showModal();if(raf)cancelAnimationFrame(raf);raf=0;audioGain?.gain.setTargetAtTime(0,audioContext.currentTime,.25);$('#archive-close').focus();}
function closeArchive(){dialog.close();playing=archiveWasPlaying&&!reduce.matches;updateUI();if(soundOn)audioGain?.gain.setTargetAtTime(.15,audioContext.currentTime,.5);resumeLoop();}
$('#archive-open').addEventListener('click',openArchive);$('#archive-close').addEventListener('click',closeArchive);dialog.addEventListener('cancel',e=>{e.preventDefault();closeArchive();});dialog.addEventListener('click',e=>{if(e.target===dialog&&e.clientX<dialog.getBoundingClientRect().left)closeArchive();});
$('.skip').addEventListener('click',e=>{e.preventDefault();openArchive();});
enter.addEventListener('click',()=>{if(!world||diagnostics.fallback||progress>=.94){openArchive();return;}started=true;if(reduce.matches){navigate(Math.min(1,progress+.5));return;}playing=!playing;updateUI();resumeLoop();});
pause.addEventListener('click',()=>{playing=!playing;updateUI();resumeLoop();});
range.addEventListener('input',()=>{navigate(Number(range.value)/1000);});
document.querySelectorAll('[data-stop]').forEach(b=>b.addEventListener('click',()=>navigate(Number(b.dataset.stop))));
$('#home').addEventListener('click',e=>{e.preventDefault();progress=0;playing=false;started=false;$('#chapter-label').textContent='01 — THE ARRIVAL';$('#chapter-title').innerHTML='Somewhere,<br><em>between.</em>';$('#chapter-subtitle').textContent='하루가 끝나기 전, 잠시 머무는 곳.';updateUI();drawOnce();});
let down=null;canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,p:progress};});canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();pan={x:(e.clientX-r.left)/r.width-.5,y:(e.clientY-r.top)/r.height-.5};});canvas.addEventListener('pointerup',e=>{if(!down)return;const dy=e.clientY-down.y;const dx=e.clientX-down.x;if(Math.hypot(dx,dy)<12&&world?.hitPoster(e.clientX,e.clientY))openArchive();else if(Math.abs(dy)>35){navigate(progress+(dy<0?.25:-.25));}down=null;});canvas.addEventListener('pointercancel',()=>{down=null;});
async function sound(){try{if(!audioContext){const AC=window.AudioContext||window.webkitAudioContext;audioContext=new AC();audioGain=audioContext.createGain();audioGain.gain.value=0;audioGain.connect(audioContext.destination);
 // Original synthesized harbour air + quiet suspended chord; no licensed recording.
 const buffer=audioContext.createBuffer(1,audioContext.sampleRate*4,audioContext.sampleRate);const data=buffer.getChannelData(0);let brown=0;for(let i=0;i<data.length;i++){brown=(brown+Math.random()*.025-.0125)/1.007;data[i]=brown;}const air=audioContext.createBufferSource();air.buffer=buffer;air.loop=true;const lp=audioContext.createBiquadFilter();lp.type='lowpass';lp.frequency.value=530;air.connect(lp);lp.connect(audioGain);air.start();
 for(const [i,f]of [110,164.8138,220,261.6256].entries()){let osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type='sine';osc.frequency.value=f;gain.gain.value=i===0?.032:.012;osc.connect(gain);gain.connect(audioGain);osc.start();}}
 await audioContext.resume();diagnostics.audioState=audioContext.state;soundOn=!soundOn;audioGain.gain.setTargetAtTime(soundOn?.15:0,audioContext.currentTime,.8);$('#sound').innerHTML=`<span class="sound-bars" aria-hidden="true">ııı</span> SOUND ${soundOn?'ON':'OFF'}`;$('#sound').setAttribute('aria-pressed',String(soundOn));$('#sound').setAttribute('aria-label',soundOn?'공간 사운드 끄기':'공간 사운드 켜기');}catch(e){report('사운드를 재생할 수 없습니다. 무음으로 감상해 주세요.');}}
$('#sound').addEventListener('click',sound);
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=0;audioContext?.suspend();}else{if(soundOn)audioContext?.resume().catch(()=>{});resumeLoop();}});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;diagnostics.contextLosses++;if(raf)cancelAnimationFrame(raf);raf=0;document.body.classList.remove('ready');report('그래픽 연결이 잠시 쉬고 있습니다. 기록은 계속 열 수 있습니다.');});
canvas.addEventListener('webglcontextrestored',async()=>{try{world?.dispose();world=await createWorld(canvas,report);contextLost=false;drawOnce();document.body.classList.add('ready');report('');resumeLoop();}catch(e){contextLost=false;fail(e);}});
reduce.addEventListener('change',()=>{playing=false;updateUI();if(raf)cancelAnimationFrame(raf);raf=0;drawOnce();resumeLoop();});
window.addEventListener('resize',()=>{world?.resize();drawOnce();});window.visualViewport?.addEventListener('resize',()=>{world?.resize();drawOnce();});
const timeout=setTimeout(()=>{if(!world){enter.disabled=false;enterLabel.textContent='기다리는 동안 아카이브 열기';report('연결이 느립니다. 사진과 저널은 먼저 열 수 있습니다.');}},12000);
async function boot(){try{world=await createWorld(canvas,report);clearTimeout(timeout);enter.disabled=false;diagnostics.vehicleSource=world.vehicleSource;document.body.classList.add('ready');report(world.vehicleSource==='Procedural coupe fallback'?'911 로딩 실패: 임시 차량을 표시 중입니다.':'');updateUI();resumeLoop();}catch(e){clearTimeout(timeout);console.error(e);fail(e);}

}
boot();
