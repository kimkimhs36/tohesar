/* TOHEŞAR writer's desk. Client-only, no account, no uploads and no API tokens. */
(()=>{
"use strict";
const id=name=>document.getElementById(name);
const fields=["draft-title","draft-type","draft-description","draft-source","draft-body"];
const key="tohesar:writer:edition:v1";
const $title=id("preview-title"),$meta=id("preview-meta"),$desc=id("preview-description"),$content=id("preview-content"),$status=id("draft-status");
if(!fields.every(name=>id(name)))return;
function read(){return Object.fromEntries(fields.map(name=>[name,id(name).value]));}
function apply(state){for(const name of fields){if(typeof state[name]==="string")id(name).value=state[name].slice(0,200000);}}
function status(message){$status.textContent=message;}
function localTime(){return new Intl.DateTimeFormat("ko-KR",{hour:"2-digit",minute:"2-digit"}).format(new Date());}
function safeSource(value){try{const uri=new URL(value);return uri.protocol==="https:"?uri.href:"";}catch{return "";}}
function update(){
 const s=read();
 $title.textContent=s["draft-title"].trim()||"아직 제목이 없습니다.";
 $meta.textContent=s["draft-type"]+" · "+s["draft-body"].length.toLocaleString("ko-KR")+"자";
 $desc.textContent=s["draft-description"].trim()||"요약을 입력하면 여기에 나타납니다.";
 $content.replaceChildren();
 const paragraphs=s["draft-body"].trim().split(/\n\s*\n/).slice(0,140);
 paragraphs.forEach(value=>{
   if(!value.trim())return;
   const p=document.createElement("p");p.textContent=value.slice(0,3000);
   $content.append(p);
 });
 try{localStorage.setItem(key,JSON.stringify(s));status("이 기기에 자동 저장됨 · "+localTime());}
 catch {status("저장 공간에 접근할 수 없습니다. 원고를 파일로 내보내 보관하세요.");}
}
function buildMarkdown(){
 const s=read();
 const yaml=v=>JSON.stringify(String(v||"").replace(/[\u0000-\u001f]/g," ").slice(0,500));
 const iso=new Date().toISOString().slice(0,10);
 const src=safeSource(s["draft-source"]);
 return [
 "---",
 "title: "+yaml(s["draft-title"].trim()||"제목 미정"),
 "category: "+yaml(s["draft-type"]),
 "description: "+yaml(s["draft-description"]),
 "source: "+yaml(src),
 "draft: true",
 "date: "+yaml(iso),
 "---",
 "",
 "# "+(s["draft-title"].trim()||"제목 미정"),
 "",
 s["draft-description"].trim(),
 "",
 s["draft-body"].trim(),
 "",
 src?"## 참고 출처\n\n- "+src+"\n":"",
 "## 출판 전 확인",
 "",
 "- [ ] 출처에서 발표 날짜와 사실을 재확인했습니다.",
 "- [ ] 확인된 사실과 편집 의견을 구분했습니다.",
 "- [ ] 이미지 이용 권한과 출처를 기록했습니다.",
 "- [ ] 본문·제목·모바일 가독성을 직접 검수했습니다.",
 ""
 ].join("\n");
}
function fileName(){
 let raw=id("draft-title").value.trim().replace(/[\\/:*?"<>|#%]/g,"-").replace(/\s+/g,"-").replace(/^-+|-+$/g,"");
 return (raw||"tohesar-draft").slice(0,72)+".md";
}
id("draft-form").addEventListener("submit",event=>event.preventDefault());
for(const name of fields){id(name).addEventListener("input",update);id(name).addEventListener("change",update);}
id("export-md").addEventListener("click",()=>{
 const blob=new Blob([buildMarkdown()],{type:"text/markdown;charset=utf-8"});
 const href=URL.createObjectURL(blob);
 const a=document.createElement("a");a.href=href;a.download=fileName();document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(href),10000);
 status("마크다운 파일 내보내기를 시작했습니다. 다운로드 폴더를 확인해 주세요.");
});
id("copy-md").addEventListener("click",async()=>{
 try { await navigator.clipboard.writeText(buildMarkdown());status("원고를 클립보드에 복사했습니다.");}
 catch {status("복사 권한이 허용되지 않았습니다. 마크다운 저장을 사용해 주세요.");}
});
id("clear-draft").addEventListener("click",()=>{
 if(!confirm("현재 기기에 저장된 원고를 비울까요? 복구할 수 없습니다."))return;
 for(const name of fields) id(name).value="";
 id("draft-type").value="디자인 비평";
 try{localStorage.removeItem(key);}catch{}
 update();status("이 기기의 초안을 비웠습니다.");
});
document.addEventListener("keydown",event=>{
 if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="s"){
  event.preventDefault();id("export-md").click();
 }
});
try{const data=JSON.parse(localStorage.getItem(key)||"null");if(data&&typeof data==="object")apply(data);}
catch {status("저장된 원고를 읽을 수 없습니다. 새 글을 작성할 수 있어요.");}
update();
})();