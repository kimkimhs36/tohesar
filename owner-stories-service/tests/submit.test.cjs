'use strict';
const {test,after} = require('node:test');
const assert = require('node:assert/strict');
const {Readable} = require('node:stream');
const handler = require('../api/submit.js');
const originalFetch=global.fetch,originalLog=console.info;
const envKeys=['OWNER_STORIES_ORIGINS','OWNER_STORIES_TO','OWNER_STORIES_FROM','RESEND_API_KEY','TURNSTILE_SECRET_KEY','OWNER_STORIES_EDGE_PROTECTION'];
const oldEnv=Object.fromEntries(envKeys.map(k=>[k,process.env[k]]));
const logs=[];console.info=line=>logs.push(line);
after(()=>{global.fetch=originalFetch;console.info=originalLog;for(const [k,v] of Object.entries(oldEnv)){if(v===undefined)delete process.env[k];else process.env[k]=v;}});
function configure(){Object.assign(process.env,{OWNER_STORIES_ORIGINS:'https://tohesar.com',OWNER_STORIES_TO:'test@example.org',OWNER_STORIES_FROM:'editor@example.org',RESEND_API_KEY:'secret-test-key',TURNSTILE_SECRET_KEY:'secret-test-token',OWNER_STORIES_EDGE_PROTECTION:'confirmed'});}
const key='7fb0d640-a3f8-4af2-86b2-52912605fcaa';
function payload(){return {model:'2008 Audi A5 B8',story:'순정 휠의 조형을 좋아합니다.',theme:'THE LINE — 차의 아름다운 형태',contact:'driver@example.org',consent:true,turnstileToken:'valid-token-placeholder-xyz',website:''};}
function proof(extra={}){return {success:true,hostname:'tohesar.com',action:'owner_story',challenge_ts:new Date().toISOString(),...extra};}
function okJson(obj){return {ok:true,status:200,json:async()=>obj};}
function response(){const headers={};return {statusCode:200,headers,body:'',setHeader(k,v){headers[k]=v},end(s=''){this.body=s},get data(){return this.body?JSON.parse(this.body):null}};}
async function invoke({method='POST',origin='https://tohesar.com',type='application/json',body=payload(),headers={},stream=false}={}){const req=stream?Readable.from(body):{};req.method=method;req.headers={origin,'content-type':type,'idempotency-key':key,...headers};if(!stream)req.body=body;const res=response();await handler(req,res);return res;}
function successfulFetch(calls=[]){return async(url,options)=>{calls.push({url,options});return url.includes('siteverify')?okJson(proof()):okJson({id:'mock-provider-id'});};}
function noNetwork(){global.fetch=async()=>{throw Error('unexpected network call')};}
test('validated request reaches mock provider once; text only and no personal subject',async()=>{
 configure();const calls=[];global.fetch=successfulFetch(calls);const res=await invoke();assert.equal(res.statusCode,202);assert.equal(res.data.status,'accepted');assert.equal(calls.length,2);
 const sent=JSON.parse(calls[1].options.body);assert.match(sent.text,/Audi A5/);assert.equal(sent.reply_to,'driver@example.org');assert.doesNotMatch(sent.subject,/Audi/);assert.equal(sent.html,undefined);assert.equal(calls[1].options.headers['Idempotency-Key'],'owner-stories/'+key);assert.equal(res.headers['Cache-Control'],'no-store');assert.match(res.data.requestId,/^[\da-f-]{36}$/);
});
test('strict origin, method, media type, encoding and preflight',async()=>{
 configure();noNetwork();for(const origin of ['https://evil.invalid','null','https://tohesar.com.evil.invalid'])assert.equal((await invoke({origin})).statusCode,403);
 const pre=await invoke({method:'OPTIONS'});assert.equal(pre.statusCode,204);assert.equal(pre.headers['Access-Control-Allow-Origin'],'https://tohesar.com');assert.equal((await invoke({method:'GET'})).statusCode,405);assert.equal((await invoke({type:'text/plain'})).statusCode,415);assert.equal((await invoke({headers:{'content-encoding':'gzip'}})).statusCode,415);
 for(const value of ['*','http://tohesar.com','https://tohesar.com/','https://x@tohesar.com','https://tohesar.com,,https://example.com']){process.env.OWNER_STORIES_ORIGINS=value;assert.equal((await invoke()).statusCode,503,value);}
});
test('all missing deployment prerequisites fail closed before outbound traffic',async()=>{
 configure();noNetwork();for(const name of envKeys){const value=process.env[name];delete process.env[name];assert.equal((await invoke()).statusCode,503,name);process.env[name]=value;}process.env.OWNER_STORIES_EDGE_PROTECTION='true';assert.equal((await invoke()).statusCode,503);
});
test('limits raw stream bytes, UTF-8, JSON and content length',async()=>{
 configure();noNetwork();assert.equal((await invoke({body:[Buffer.alloc(8193,97)],stream:true})).statusCode,413);assert.equal((await invoke({body:[Buffer.from([0xff])],stream:true})).statusCode,400);assert.equal((await invoke({body:'{bad'})).statusCode,400);assert.equal((await invoke({headers:{'content-length':'8193'}})).statusCode,413);assert.equal((await invoke({headers:{'content-length':'-1'}})).statusCode,413);assert.equal((await invoke({body:{...payload(),story:'🙂'.repeat(701)}})).statusCode,422);
});
test('rejects malformed schema, controls, unpaired surrogates, contact, consent and honeypot',async()=>{
 configure();noNetwork();const cases=[null,[],{...payload(),extra:'x'}, {...payload(),model:'a'}, {...payload(),model:'x'.repeat(121)}, {...payload(),model:'car\r\nBcc:evil@example.org'}, {...payload(),model:'car\ud800'}, {...payload(),story:'short'}, {...payload(),story:'hello\u0000world'}, {...payload(),contact:'a..b@example.org'}, {...payload(),contact:'a@-example.org'}, {...payload(),contact:'a@b.com\nBcc:evil@x.com'}, {...payload(),contact:'https://example.org'}, {...payload(),consent:'true'}, {...payload(),consent:false}, {...payload(),website:'spam'}, {...payload(),theme:'other'}, {...payload(),turnstileToken:''}];for(const body of cases)assert.equal((await invoke({body})).statusCode,422,JSON.stringify(body));
});
test('hostile HTML and URLs stay in plain text and never determine upstream URLs',async()=>{
 configure();const calls=[];global.fetch=successfulFetch(calls);const res=await invoke({body:{...payload(),story:'<script>alert(1)</script> https://evil.invalid/'}});assert.equal(res.statusCode,202);const mail=JSON.parse(calls[1].options.body);assert.match(mail.text,/<script>/);assert.equal(mail.html,undefined);assert.equal(calls[1].url,'https://api.resend.com/emails');
});
test('requires a random UUIDv4 key',async()=>{configure();noNetwork();for(const value of ['', 'abc', '7fb0d640-a3f8-1af2-86b2-52912605fcaa'])assert.equal((await invoke({headers:{'idempotency-key':value}})).statusCode,400);});
test('rejects failed, expired, future, wrong action or host verification without sending',async()=>{
 configure();for(const p of [proof({success:false}),proof({hostname:'evil.invalid'}),proof({action:'other'}),proof({challenge_ts:new Date(Date.now()-301000).toISOString()}),proof({challenge_ts:new Date(Date.now()+31000).toISOString()}),proof({challenge_ts:'bad'})]){let count=0;global.fetch=async()=>{count++;return okJson(p)};assert.equal((await invoke()).data.error,'verification_failed');assert.equal(count,1);}
});
test('verification failures and timeouts are private and never send',async()=>{
 configure();for(const mock of [async()=>({ok:false,status:500}),async()=>{throw Error('secret-test-token')},async()=>({ok:true,json:async()=>{throw Error('bad')}})]){global.fetch=mock;const res=await invoke();assert.equal(res.data.error,'verification_unavailable');assert.doesNotMatch(res.body,/secret|driver|Audi/);}
});
test('provider rejection, timeout and invalid success are not reported as accepted or retried',async()=>{
 configure();for(const provider of [{ok:false,status:400},{ok:false,status:500},{ok:false,status:409},okJson({}),null]){let count=0;global.fetch=async()=>{count++;if(count===1)return okJson(proof());if(!provider)throw Error('timeout secret-test-key');return provider};const res=await invoke();assert.notEqual(res.statusCode,202);assert.equal(count,2);assert.doesNotMatch(res.body,/secret|driver|Audi/);}
});
test('same key retry after ambiguous timeout is deduplicated by mocked provider',async()=>{
 configure();let sends=0;const provider=new Map();let first=true;global.fetch=async(url,options)=>{if(url.includes('siteverify'))return okJson(proof());const k=options.headers['Idempotency-Key'];if(!provider.has(k)){provider.set(k,'mock-id');sends++;}if(first){first=false;throw Error('connection lost after accept')}return okJson({id:provider.get(k)});};assert.equal((await invoke()).data.error,'delivery_unconfirmed');assert.equal((await invoke({body:{...payload(),turnstileToken:'fresh-token-placeholder-xyz'}})).statusCode,202);assert.equal((await invoke()).statusCode,202);assert.equal(sends,1);
});
test('diagnostics contain only stage and random ID, never personal data or credentials',()=>{const output=logs.join('\n');assert.doesNotMatch(output,/driver@example|Audi|secret-test|순정|<script>/);for(const line of logs){const parsed=JSON.parse(line);assert.deepEqual(Object.keys(parsed).sort(),['request_id','service','stage']);}});
test('HTTP stream integration exercises routing, parsing and mocked providers',async()=>{
 configure();const http=require('node:http');const calls=[];global.fetch=successfulFetch(calls);
 const server=http.createServer(handler);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const port=server.address().port;
  const res=await originalFetch('http://127.0.0.1:'+port+'/api/submit',{method:'POST',headers:{origin:'https://tohesar.com','content-type':'application/json','idempotency-key':key},body:JSON.stringify(payload())});
  assert.equal(res.status,202);assert.equal((await res.json()).status,'accepted');assert.equal(calls.length,2);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
test('abort signal bounds both upstream stages',async()=>{
 configure();const oldTimeout=AbortSignal.timeout;AbortSignal.timeout=()=>oldTimeout(15);
 try{
  for(const stage of ['verification','provider']){
   let calls=0;global.fetch=async(_url,options)=>{calls++;if(stage==='provider'&&calls===1)return okJson(proof());return new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true}));};
   // Keep the test alive because AbortSignal.timeout uses an unrefed timer.
   const keepAlive=setTimeout(()=>{},500);
   try{const res=await invoke();assert.equal(res.data.error,stage==='verification'?'verification_unavailable':'delivery_unconfirmed');assert.equal(calls,stage==='verification'?1:2);}finally{clearTimeout(keepAlive);}
  }
 }finally{AbortSignal.timeout=oldTimeout;}
});
