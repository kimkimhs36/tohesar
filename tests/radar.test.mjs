import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../api/radar.js';

const date = new Date().toUTCString();
const xml = (title,url) => `<?xml version="1.0"?><rss><channel><item><title><![CDATA[${title}]]></title><link>${url}</link><pubDate>${date}</pubDate></item></channel></rss>`;
function mockResponse() {
  return {headers:{},statusCode:0,body:null,setHeader(k,v){this.headers[k]=v;},status(n){this.statusCode=n;return this;},json(v){this.body=v;return this;}};
}
test('live RSS desk returns original titles, source records, and external links',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async (url) => {
  const s=String(url);
  if(s.includes('newsroom.porsche.com')) return {ok:true,text:async()=>xml('Mission S: A Porsche Vision','https://newsroom.porsche.com/en/2026/design/mission-s.html')};
  if(s.includes('press.bmwgroup.com')) return {ok:true,text:async()=>xml('BMW Group Advances Production','https://www.press.bmwgroup.com/global/article/detail/T0462233EN')};
  return {ok:true,text:async()=>xml('Design &amp; Heritage','https://www.motor1.com/news/813391/design-heritage/')};
 };
 try {
  const r=mockResponse();await handler({method:'GET'},r);
  assert.equal(r.statusCode,200);assert.equal(r.body.status,'ok');assert.equal(r.body.sources.length,3);
  assert.equal(r.body.articles.length,3);
  assert.ok(r.body.articles.every(x=>x.kind==='external-source'&&x.url.startsWith('https://')));
  assert.ok(r.body.articles.some(x=>x.title==='Design & Heritage'));
  assert.equal(r.headers['Cache-Control'],'public, s-maxage=900, stale-while-revalidate=1800');
 }finally{globalThis.fetch=original;}
});

test('rejects off-domain feed links and never returns invented news',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async s=>({ok:true,text:async()=>xml('Bogus fabricated source','https://evil.example/news')});
 try {
   const r=mockResponse();await handler({method:'GET'},r);
   assert.equal(r.statusCode,200);assert.equal(r.body.articles.length,0);
 }finally {globalThis.fetch=original;}
});

test('blocks unsafe HTTP methods',async()=>{
 const r=mockResponse();await handler({method:'POST'},r);
 assert.equal(r.statusCode,405);assert.equal(r.body.error,'method_not_allowed');
});