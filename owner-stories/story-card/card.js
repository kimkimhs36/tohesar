/* TOHEŞAR OWNER STORIES: Local photo -> editable editorial PNG, no uploads. */
(() => {
  'use strict';
  const byId=id=>document.getElementById(id);
  const canvas=byId('story-canvas'),ctx=canvas?.getContext('2d');
  if(!ctx)return;
  const model=byId('car-name'),story=byId('car-caption'),input=byId('car-photo');
  const tone=byId('car-tone'),position=byId('car-position'),status=byId('card-status');
  const uploadText=byId('photo-name');
  const W=1080,H=1920;
  let photo=null,objectURL=null,pending=false,ready=false;
  const say=s=>{status.textContent=s};
  const wrap=(text,width,maxLines,font,initial=90,min=30)=>{
    const words=String(text).replace(/\s+/g,' ').trim().split(' ');
    for(let size=initial;size>=min;size-=3){
      ctx.font=font(size);let lines=[],line='';
      for(const word of words){
        const part=line?line+' '+word:word;
        if(ctx.measureText(part).width<=width){line=part;continue}
        if(line){lines.push(line);line=''}
        if(ctx.measureText(word).width<=width){line=word;continue}
        for(const c of Array.from(word)){
          if(line&&ctx.measureText(line+c).width>width){lines.push(line);line=''}
          line+=c;
        }
      }
      if(line)lines.push(line);
      if(lines.length<=maxLines)return{lines,size};
    }
    const size=min;ctx.font=font(size);
    let lines=[],line='';
    for(const c of Array.from(String(text))){
      if(line&&ctx.measureText(line+c).width>width){lines.push(line);line=''}
      line+=c;
    }
    if(line)lines.push(line);
    if(lines.length>maxLines){
      lines=lines.slice(0,maxLines);
      let last=lines[maxLines-1];
      while(last&&ctx.measureText(last+'…').width>width)last=last.slice(0,-1);
      lines[maxLines-1]=last+'…';
    }
    return{lines,size};
  };
  function draw(){
    ready=false;
    const wash=ctx.createLinearGradient(0,0,W,H);
    wash.addColorStop(0,'#adc5b9');wash.addColorStop(.5,'#d6ded4');wash.addColorStop(1,'#e5b9a9');
    ctx.fillStyle=wash;ctx.fillRect(0,0,W,H);
    if(photo&&photo.naturalWidth&&photo.naturalHeight){
      const w=photo.naturalWidth,h=photo.naturalHeight,scale=Math.max(W/w,H/h);
      const sw=W/scale,sh=H/scale;
      ctx.save();
      ctx.filter={film:'saturate(.82) contrast(.96) sepia(.07)',neutral:'saturate(.96)',mono:'grayscale(1) contrast(1.08)'}[tone.value]||'none';
      ctx.drawImage(photo,(w-sw)/2,(h-sh)*Number(position.value)/100,sw,sh,0,0,W,H);
      ctx.restore();
    }else{
      ctx.strokeStyle='rgba(253,247,241,.3)';ctx.lineWidth=2;
      for(let n=0;n<5;n++){ctx.beginPath();ctx.ellipse(850,660,270+n*95,490+n*90,.15,0,Math.PI*2);ctx.stroke()}
      ctx.fillStyle='#324e4c';ctx.font='400 150px Georgia,serif';
      ctx.fillText('YOUR',72,750);ctx.fillText('CAR.',72,900);
    }
    const shade=ctx.createLinearGradient(0,0,0,H);
    shade.addColorStop(0,'rgba(12,29,31,.7)');shade.addColorStop(.2,'rgba(12,29,31,.06)');
    shade.addColorStop(.49,'rgba(12,29,31,.02)');shade.addColorStop(.65,'rgba(12,29,31,.45)');
    shade.addColorStop(1,'rgba(10,25,28,.94)');ctx.fillStyle=shade;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#f6eee4';ctx.textAlign='left';ctx.textBaseline='alphabetic';
    ctx.font='400 49px Georgia,serif';ctx.fillText('TOHEŞAR',72,112);
    ctx.strokeStyle='rgba(252,241,232,.65)';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(72,146);ctx.lineTo(1009,146);ctx.stroke();
    ctx.font='500 22px Arial,sans-serif';ctx.fillText('OWNER STORIES   /   COMMUNITY 001',72,196);
    const name=wrap((model.value||'My Automotive Story').slice(0,44),920,3,n=>'400 '+n+'px Georgia,serif',98,59);
    const start=1450-(name.lines.length-1)*name.size*1.09;
    ctx.font='400 '+name.size+'px Georgia,serif';ctx.fillStyle='#fbf1e8';
    name.lines.forEach((v,i)=>ctx.fillText(v,69,start+i*name.size*1.09));
    const copy=wrap((story.value||'Every curve has a story.').slice(0,115),920,3,n=>'400 '+n+'px Arial,sans-serif',36,27);
    const y=start+(name.lines.length-1)*name.size*1.09+76;
    ctx.font='400 '+copy.size+'px Arial,sans-serif';ctx.fillStyle='#f1d9c9';
    copy.lines.forEach((v,i)=>ctx.fillText(v,73,y+i*copy.size*1.45));
    ctx.strokeStyle='rgba(252,241,232,.6)';ctx.beginPath();ctx.moveTo(72,1779);ctx.lineTo(1009,1779);ctx.stroke();
    ctx.fillStyle='#f9efe5';ctx.font='400 27px Georgia,serif';ctx.fillText('Every curve has a story.',72,1836);
    ctx.textAlign='right';ctx.font='500 20px Arial,sans-serif';ctx.fillText('TOHESAR.COM / OWNER-STORIES',1007,1836);
    ctx.textAlign='left';ready=true;
  }
  function render(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;draw()})}
  async function choose(file){
    if(!file)return;
    if(!file.type.startsWith('image/'))return say('이미지 파일을 선택해 주세요.');
    if(file.size>20*1024*1024)return say('20MB 이하의 이미지를 선택해 주세요.');
    if(objectURL)URL.revokeObjectURL(objectURL);
    objectURL=URL.createObjectURL(file);
    try{
      const img=new Image();
      await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=objectURL});
      photo=img;uploadText.textContent=file.name.slice(0,65);
      say('사진을 불러왔어요. 색감과 위치를 조절해 보세요.');
    }catch(e){photo=null;say('이 사진을 열 수 없어요. JPG 또는 PNG로 다시 시도해 주세요.')}
    render();
  }
  const blob=()=>new Promise(resolve=>{if(!ready)draw();canvas.toBlob(resolve,'image/png')});
  async function download(){
    const data=await blob();if(!data)return say('이미지를 생성하지 못했어요.');
    const url=URL.createObjectURL(data),a=document.createElement('a');
    a.href=url;a.download='TOHESAR-OWNER-STORY.png';document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),20000);
    say('1080×1920 PNG를 생성했어요. 모바일에서 저장이 안 되면 공유 버튼을 이용하세요.');
  }
  async function share(){
    const data=await blob();if(!data)return say('이미지를 생성하지 못했어요.');
    const file=new File([data],'TOHESAR-OWNER-STORY.png',{type:'image/png'});
    if(!navigator.share||!navigator.canShare||!navigator.canShare({files:[file]}))return say('이 브라우저에서는 이미지 직접 공유를 지원하지 않아요. PNG 저장을 이용하세요.');
    try{await navigator.share({files:[file],title:'TOHEŞAR OWNER STORIES',text:'내 자동차의 이야기 — tohesar.com/owner-stories/'});say('공유 화면을 열었어요.')}
    catch(e){if(e?.name!=='AbortError')say('공유할 수 없어요. PNG 저장을 이용하세요.')}
  }
  for(const el of [model,story,tone,position])el.addEventListener('input',render);
  input.addEventListener('change',()=>choose(input.files?.[0]));
  byId('save').addEventListener('click',download);
  byId('share').addEventListener('click',share);
  addEventListener('pagehide',()=>{if(objectURL)URL.revokeObjectURL(objectURL)},{once:true});
  draw();
})();