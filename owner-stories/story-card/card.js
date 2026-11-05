/* TOHEŞAR OWNER STORIES: Local photo -> editable editorial PNG, no uploads. */
(() => {
  'use strict';
  const byId=id=>document.getElementById(id);
  const canvas=byId('story-canvas'),ctx=canvas?.getContext('2d');
  if(!ctx)return;
  const model=byId('car-name'),story=byId('car-caption'),input=byId('car-photo');
  const tone=byId('car-tone'),position=byId('car-position'),horizontal=byId('car-horizontal'),layout=byId('car-layout'),status=byId('card-status');
  const uploadText=byId('photo-name');
  const quickUpload=document.querySelector('.quick-upload');
  const W=1080,H=1920;
  // Always reproduce the official TOHEŞAR artwork; do not redraw the Ş as generic type.
  const wordmark=new Image();
  let wordmarkReady=false;
  function paintWordmark(x,y,width,dark=false){
    if(wordmarkReady){
      ctx.save();
      if(dark)ctx.filter='brightness(0)';
      ctx.drawImage(wordmark,x,y,width,width*255/1109);
      ctx.restore();
    }else{
      ctx.fillStyle=dark?'#253a37':'#f6eee4';
      ctx.font='400 49px Georgia,serif';
      ctx.fillText('TOHEŞAR',x,y+48);
    }
  }
  wordmark.onload=()=>{wordmarkReady=true;render()};
  wordmark.onerror=()=>{wordmarkReady=false};
  wordmark.src='/assets/wordmark.svg';
  let photo=null,objectURL=null,pending=false,ready=false,selectionId=0;
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

  /* Printed-photo editorial direction: an intentional alternative to the cinema full-bleed.
     No generic card grids, decorative neon, or tuning-era OEM+ branding. */
  function drawGallery(){
    ready=false;
    ctx.fillStyle='#f4ece5';ctx.fillRect(0,0,W,H);
    const subtle=ctx.createLinearGradient(0,0,W,H);
    subtle.addColorStop(0,'rgba(226,188,170,.22)');
    subtle.addColorStop(.57,'rgba(250,249,241,0)');
    subtle.addColorStop(1,'rgba(171,199,187,.26)');
    ctx.fillStyle=subtle;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#253a37';ctx.textBaseline='alphabetic';ctx.textAlign='left';
    paintWordmark(65,67,246,true);
    ctx.textAlign='right';ctx.font='500 23px Arial,sans-serif';
    ctx.fillText('OWNER STORIES  /  001',1015,102);ctx.textAlign='left';
    ctx.strokeStyle='rgba(37,58,55,.46)';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(65,140);ctx.lineTo(1015,140);ctx.stroke();
    const x=65,y=239,pw=950,ph=1050;
    const photoWash=ctx.createLinearGradient(x,y,x+pw,y+ph);
    photoWash.addColorStop(0,'#a4b7ad');photoWash.addColorStop(.58,'#d4d5c5');
    photoWash.addColorStop(1,'#dcb1a7');
    ctx.fillStyle=photoWash;ctx.fillRect(x,y,pw,ph);
    if(photo&&photo.naturalWidth&&photo.naturalHeight){
      const w=photo.naturalWidth,h=photo.naturalHeight,scale=Math.max(pw/w,ph/h);
      const sw=pw/scale,sh=ph/scale;
      ctx.save();ctx.filter={film:'saturate(.82) contrast(.96) sepia(.07)',neutral:'saturate(.96)',mono:'grayscale(1) contrast(1.08)'}[tone.value]||'none';
      ctx.drawImage(photo,(w-sw)*Number(horizontal.value)/100,(h-sh)*Number(position.value)/100,sw,sh,x,y,pw,ph);
      ctx.restore();
    } else {
      // A restrained typographic print, not AI-looking circles or a fake owner photograph.
      ctx.fillStyle='#e6e1d8';ctx.fillRect(x,y,pw,ph);
      ctx.strokeStyle='rgba(49,66,59,.22)';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(x+70,y+90);ctx.lineTo(x+pw-70,y+90);ctx.stroke();
      ctx.fillStyle='#75827b';ctx.font='500 25px Arial,sans-serif';
      ctx.fillText('A SPACE FOR YOUR PHOTOGRAPH',x+70,y+145);
      ctx.fillStyle='#2d433c';ctx.font='italic 400 128px Georgia,serif';
      ctx.fillText('Every',x+66,y+440);
      ctx.fillText('curve',x+66,y+573);
      ctx.fillStyle='#a77a68';ctx.fillText('has a',x+66,y+706);
      ctx.fillStyle='#2d433c';ctx.fillText('story.',x+66,y+839);
      ctx.fillStyle='#6d7972';ctx.font='400 26px Arial,sans-serif';
      ctx.fillText('ADD A PHOTO TO MAKE THIS YOURS',x+70,y+ph-90);
    }
    // Photo credit placeholder is intentionally omitted: only the user can verify authorship.
    ctx.fillStyle='#253a37';ctx.font='500 21px Arial,sans-serif';
    ctx.fillText('AN AUTOMOTIVE PORTRAIT',68,1352);
    const name=wrap((model.value||'My Automotive Story').slice(0,44),940,2,n=>'400 '+n+'px Georgia,serif',87,55);
    const top=name.lines.length>1?1454:1500;
    ctx.fillStyle='#213632';ctx.font='400 '+name.size+'px Georgia,serif';
    name.lines.forEach((v,i)=>ctx.fillText(v,65,top+i*name.size*1.06));
    const copy=wrap((story.value||'Every curve has a story.').slice(0,115),940,3,n=>'400 '+n+'px Arial,sans-serif',33,25);
    const copyTop=top+(name.lines.length-1)*name.size*1.06+67;
    ctx.fillStyle='#576760';ctx.font='400 '+copy.size+'px Arial,sans-serif';
    copy.lines.forEach((v,i)=>ctx.fillText(v,68,copyTop+i*copy.size*1.42));
    ctx.strokeStyle='#91a79d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(65,1795);ctx.lineTo(1015,1795);ctx.stroke();
    ctx.fillStyle='#253a37';ctx.font='400 27px Georgia,serif';
    ctx.fillText('Every curve has a story.',65,1853);
    ctx.textAlign='right';ctx.font='500 20px Arial,sans-serif';ctx.fillText('TOHESAR.COM',1013,1852);
    ctx.textAlign='left';ready=true;
  }

  function draw(){
    if(layout.value==='gallery'){drawGallery();return;}
    ready=false;
    const wash=ctx.createLinearGradient(0,0,W,H);
    wash.addColorStop(0,'#adc5b9');wash.addColorStop(.5,'#d6ded4');wash.addColorStop(1,'#e5b9a9');
    ctx.fillStyle=wash;ctx.fillRect(0,0,W,H);
    if(photo&&photo.naturalWidth&&photo.naturalHeight){
      const w=photo.naturalWidth,h=photo.naturalHeight,scale=Math.max(W/w,H/h);
      const sw=W/scale,sh=H/scale;
      ctx.save();
      ctx.filter={film:'saturate(.82) contrast(.96) sepia(.07)',neutral:'saturate(.96)',mono:'grayscale(1) contrast(1.08)'}[tone.value]||'none';
      ctx.drawImage(photo,(w-sw)*Number(horizontal.value)/100,(h-sh)*Number(position.value)/100,sw,sh,0,0,W,H);
      ctx.restore();
    }else{
      // Text-only remains an intentional artwork and can be shared without a photo.
      ctx.fillStyle='#b5c9bb';ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#344d43';ctx.fillRect(0,0,W,19);
      ctx.strokeStyle='rgba(40,65,55,.18)';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(70,290);ctx.lineTo(W-70,290);ctx.stroke();
      ctx.font='italic 400 155px Georgia,serif';ctx.fillStyle='#294238';
      ctx.fillText('Every',72,680);
      ctx.fillText('curve',72,835);
      ctx.fillText('has a',72,990);
      ctx.fillText('story.',72,1145);
    }
    const shade=ctx.createLinearGradient(0,0,0,H);
    shade.addColorStop(0,'rgba(12,29,31,.7)');shade.addColorStop(.2,'rgba(12,29,31,.06)');
    shade.addColorStop(.49,'rgba(12,29,31,.02)');shade.addColorStop(.65,'rgba(12,29,31,.45)');
    shade.addColorStop(1,'rgba(10,25,28,.94)');ctx.fillStyle=shade;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#f6eee4';ctx.textAlign='left';ctx.textBaseline='alphabetic';
    paintWordmark(72,68,246,false);
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
    // Invalidate any older decode even when the new selection is unsupported.
    // Otherwise a slow previous image could replace the user's latest choice.
    const request=++selectionId;
    if(!file)return;
    const looksLikeImage=/\\.(?:jpe?g|png|webp|gif|avif|heic|heif)$/i.test(file.name);
    if(!(file.type.startsWith('image/') || (!file.type && looksLikeImage)))return say('이미지 파일을 선택해 주세요.');
    if(file.size>20*1024*1024)return say('20MB 이하의 이미지를 선택해 주세요.');
    // A second selection may finish before the first. Only the latest may replace the canvas.
    const url=URL.createObjectURL(file);
    try{
      const img=new Image();
      await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url});
      if(request!==selectionId)return;
      const previousURL=objectURL;
      photo=img;objectURL=url;
      if(previousURL)URL.revokeObjectURL(previousURL);
      uploadText.textContent=file.name.slice(0,65);
      if(quickUpload)quickUpload.firstChild.textContent='다른 사진 선택하기 ';
      say('사진을 불러왔어요. 색감과 위치를 조절해 보세요.');
      render();
    }catch(e){
      if(request===selectionId)say('이 사진을 열 수 없어요. JPG 또는 PNG로 다시 시도해 주세요.');
    }finally{
      if(objectURL!==url)URL.revokeObjectURL(url);
    }
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
  for(const el of [model,story,tone,position,horizontal,layout])el.addEventListener('input',render);
  // Native button remains keyboard-operable; the hidden file input owns the picker.
  quickUpload?.addEventListener('click',()=>input.click());
  input.addEventListener('change',()=>choose(input.files?.[0]));
  byId('save').addEventListener('click',download);
  byId('share').addEventListener('click',share);
  addEventListener('pagehide',()=>{if(objectURL)URL.revokeObjectURL(objectURL)},{once:true});
  draw();
})();