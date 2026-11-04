'use strict';
const {test,after} = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/submit.js');
const originalFetch = global.fetch;
const oldEnv = {};
for (const key of ['OWNER_STORIES_ORIGINS','OWNER_STORIES_TO','OWNER_STORIES_FROM','RESEND_API_KEY','TURNSTILE_SECRET_KEY']) {
  oldEnv[key] = process.env[key];
}
after(() => {
  global.fetch = originalFetch;
  for (const [k,v] of Object.entries(oldEnv)) {
    if(v===undefined)delete process.env[k]; else process.env[k]=v;
  }
});
function configure(){
  Object.assign(process.env,{
    OWNER_STORIES_ORIGINS:'https://tohesar.com',
    OWNER_STORIES_TO:'test@example.org',
    OWNER_STORIES_FROM:'editor@example.org',
    RESEND_API_KEY:'test-key',
    TURNSTILE_SECRET_KEY:'test-secret'
  });
}
function payload(){
  return {model:'2008 Audi A5 B8',story:'순정 휠의 조형을 좋아합니다.',theme:'THE LINE — 차의 아름다운 형태',contact:'@driver.test',turnstileToken:'valid-token-placeholder-xyz'};
}
function makeResponse(){
  const headers={};return {
    statusCode:200,headers,body:'',
    setHeader(k,v){headers[k]=v;},end(s=''){this.body=s;},
    get data(){return this.body?JSON.parse(this.body):null;}
  };
}
async function invoke({method='POST',origin='https://tohesar.com',type='application/json',body=payload()}={}){
 const req={method,headers:{origin,'content-type':type},body};
 const res=makeResponse();await handler(req,res);return res;
}
test('accepts verified application and passes it to provider once',async()=>{
 configure();const calls=[];
 global.fetch=async(url,options)=>{
   calls.push({url,options});
   if(url.includes('siteverify')) return {ok:true,json:async()=>({success:true,hostname:'tohesar.com'})};
   return {ok:true};
 };
 const res=await invoke();
 assert.equal(res.statusCode,202);assert.equal(res.data.status,'received');
 assert.equal(calls.length,2);
 const sent=JSON.parse(calls[1].options.body);
 assert.match(sent.text,/Audi A5 B8/);
 assert.match(sent.text,/@driver\.test/);
 assert.equal(sent.to[0],'test@example.org');
 assert.equal(res.headers['Cache-Control'],'no-store');
});
test('fails closed if environment is not configured',async()=>{
 configure();delete process.env.RESEND_API_KEY;
 const res=await invoke();assert.equal(res.statusCode,503);
});
test('does not allow arbitrary origins',async()=>{
 configure();const res=await invoke({origin:'https://malicious.invalid'});
 assert.equal(res.statusCode,403);assert.equal(res.headers['Access-Control-Allow-Origin'],undefined);
});
test('rejects malformed fields without sending email',async()=>{
 configure();global.fetch=async()=>{throw Error('fetch must not occur')};
 const res=await invoke({body:{...payload(),story:'x',model:'a'}});
 assert.equal(res.statusCode,422);
});
test('rejects wrong hostname from verification response',async()=>{
 configure();let called=0;
 global.fetch=async()=>{called++;return {ok:true,json:async()=>({success:true,hostname:'other-site.com'})}};
 const res=await invoke();assert.equal(res.statusCode,400);assert.equal(called,1);
});
test('does not claim success if provider rejects delivery',async()=>{
 configure();let n=0;
 global.fetch=async()=>{n++;return n===1?{ok:true,json:async()=>({success:true,hostname:'tohesar.com'})}:{ok:false}};
 const res=await invoke();assert.equal(res.statusCode,502);
 assert.ok(!res.body.includes('test-key'));
});
test('rejects wrong method',async()=>{
 configure();const res=await invoke({method:'GET'});assert.equal(res.statusCode,405);
});
test('validates contact without storing anything',()=>{
 const contact={...payload(),contact:'someone@gmail.com'};
 assert.equal(handler._test.validate(contact).email,true);
 const invalid={...payload(),contact:'my address and phone'};
 assert.equal(handler._test.validate(invalid),null);
});
