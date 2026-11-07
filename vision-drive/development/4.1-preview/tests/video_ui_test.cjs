// Actual UI script in a mocked DOM/network. No requests leave this process.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'web/drive/index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'web/drive/drive.js'), 'utf8');
const dom = new JSDOM(html, {url:'http://192.168.4.1/', runScripts:'outside-only', pretendToBeVisual:true});
const w = dom.window;
let goodCamera=true, snapshots=0, draws=0, tracksStopped=0, recordedFps=0, downloads=0;
const requests=[];
w.fetch=async (url, options={})=>{
  requests.push(String(url));
  if(String(url).includes(':81/capture')){
    snapshots++;
    return goodCamera
      ? {ok:true,blob:async()=>new w.Blob(['jpeg'],{type:'image/jpeg'})}
      : {ok:false};
  }
  if(url==='/api/status')return {ok:true,json:async()=>({product:'VISION DRIVE',version:'4.1.0',camera:true,armed:false})};
  if(url==='/api/stop')return {ok:true,json:async()=>({ok:true})};
  throw Error('Unexpected request in network-free test: '+url);
};
w.URL.createObjectURL=()=> 'blob:mock-'+snapshots;
w.URL.revokeObjectURL=()=>{};
w.Image=class {constructor(){this.naturalWidth=320;this.naturalHeight=240;}async decode(){}};
const displayed=w.document.getElementById('camera');
Object.defineProperties(displayed,{naturalWidth:{value:320},naturalHeight:{value:240}});
const context={save(){},restore(){},translate(){},scale(){},drawImage(){draws++;}};
w.HTMLCanvasElement.prototype.getContext=function(){return context;};
w.HTMLCanvasElement.prototype.captureStream=function(fps){recordedFps=fps;return {getTracks:()=>[{stop(){tracksStopped++;}}]};};
w.HTMLAnchorElement.prototype.click=function(){downloads++;};
w.MediaRecorder=class {
 constructor(){this.state='inactive';this.mimeType='video/webm';}
 start(){this.state='recording';}
 stop(){this.state='inactive';w.setTimeout(()=>{this.ondataavailable?.({data:new w.Blob(['frame'])});this.onstop?.();},0);}
};
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(predicate,ms=4000){
 const end=Date.now()+ms;while(Date.now()<end&&!predicate())await delay(20);
 assert(predicate(),'timed out waiting for UI state');
}
(async()=>{
 try{
  w.eval(script);
  await until(()=>w.document.getElementById('frame-state').textContent.includes('FPS'));
  assert(snapshots>=10,'rate should use completed frames');
  w.document.getElementById('record').click();
  assert.equal(recordedFps,30,'recording should allow up to 30 fps');
  const before=draws;
  await until(()=>draws>=before+3);
  goodCamera=false;
  await until(()=>tracksStopped===1&&downloads===1);
  assert.equal(w.document.getElementById('record').textContent,'녹화');
  assert(!requests.some(url=>url==='/api/arm'||url==='/api/control'),'test must not arm or drive');
  console.log('VISION DRIVE UI: received FPS, 30 fps recording and interrupted-video cleanup PASS (mock only)');
 }finally{w.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});