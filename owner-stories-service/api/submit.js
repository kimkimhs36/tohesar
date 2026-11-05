/* Optional serverless relay. Never deploy without the controls in README.md. */
'use strict';
const {randomUUID} = require('node:crypto');
const {TextDecoder} = require('node:util');

const MAX_BYTES = 8192;
const THEMES = new Set([
  'THE LINE — 차의 아름다운 형태',
  'THE BUILD — 나만의 튜닝과 선택',
  'THE MEMORY — 자동차와 함께한 기억'
]);
const FIELDS = new Set(['model','story','theme','contact','consent','turnstileToken','website']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const invalidUnicode = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u;
const singleControls = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/u;
const storyControls = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u2028\u2029]/u;

function field(value, min, max, bytes, multiline = false) {
  if (typeof value !== 'string' || invalidUnicode.test(value) ||
      (multiline ? storyControls : singleControls).test(value)) return null;
  const text = value.trim();
  const length = Array.from(text).length;
  return length >= min && length <= max && Buffer.byteLength(text, 'utf8') <= bytes ? text : null;
}
function validEmail(value) {
  if (value.length > 254) return false;
  const parts = value.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (local.length > 64 || !/^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+$/.test(local) ||
      local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
  const labels = domain.split('.');
  return labels.length >= 2 && labels.every(label => label.length > 0 && label.length <= 63 &&
    /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(label)) && /^[A-Za-z]{2,63}$/.test(labels.at(-1));
}
function validate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body) ||
      Object.keys(body).some(key => !FIELDS.has(key))) return null;
  const model = field(body.model, 2, 120, 480);
  const story = field(body.story, 8, 700, 2800, true);
  const contact = field(body.contact, 3, 254, 254);
  const token = field(body.turnstileToken, 10, 2048, 2048);
  if (!model || !story || !contact || !token || body.consent !== true ||
      !THEMES.has(body.theme) || (body.website !== undefined && body.website !== '') ||
      !(validEmail(contact) || /^@[A-Za-z0-9._]{1,30}$/.test(contact))) return null;
  return {model, story, contact, token, theme:body.theme, email:validEmail(contact)};
}
function originsFromEnv(value) {
  if (!value) return null;
  const entries = value.split(',').map(x => x.trim());
  if (!entries.length || entries.some(x => !x)) return null;
  try {
    for (const entry of entries) {
      const url = new URL(entry);
      if (url.protocol !== 'https:' || url.origin !== entry || url.username || url.password) return null;
    }
  } catch (_) { return null; }
  return entries;
}
async function getBody(req) {
  const length = req.headers['content-length'];
  if (length !== undefined && (!/^\d+$/.test(length) || Number(length) > MAX_BYTES)) throw new Error('too_large');
  let bytes;
  if (req.body !== undefined) {
    // Useful for adapters/tests; the Vercel body parser is disabled below so the
    // production path enforces the wire byte limit before JSON parsing.
    const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
    if (raw.length > MAX_BYTES) throw new Error('too_large');
    bytes = raw;
  } else {
    let size = 0; const chunks = [];
    for await (const chunk of req) {
      const part = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += part.length;
      if (size > MAX_BYTES) throw new Error('too_large');
      chunks.push(part);
    }
    bytes = Buffer.concat(chunks);
  }
  return JSON.parse(new TextDecoder('utf-8', {fatal:true}).decode(bytes));
}
function reply(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.end(JSON.stringify(data));
}
function event(stage, id) {
  // Stage and random request ID only: never log input, provider responses, IPs or secrets.
  console.info(JSON.stringify({service:'owner_stories',stage,request_id:id}));
}
async function handler(req, res) {
  const id = randomUUID();
  res.setHeader('X-Request-ID', id);
  const fail = (status, code) => { event(code, id); return reply(res,status,{ok:false,error:code,requestId:id}); };
  const origins = originsFromEnv(process.env.OWNER_STORIES_ORIGINS);
  if (!origins) return fail(503,'intake_not_configured');
  const origin = req.headers.origin || '';
  if (!origins.includes(origin)) return fail(403,'origin_denied');
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary','Origin');
  res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type, Idempotency-Key');
  if (req.method === 'OPTIONS') { res.statusCode=204; return res.end(); }
  if (req.method !== 'POST') { res.setHeader('Allow','POST, OPTIONS'); return fail(405,'method_not_allowed'); }
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?\s*$/i.test(req.headers['content-type'] || '')) return fail(415,'json_required');
  if (req.headers['content-encoding'] && req.headers['content-encoding'].toLowerCase() !== 'identity') return fail(415,'encoding_unsupported');
  if (!process.env.RESEND_API_KEY || !process.env.TURNSTILE_SECRET_KEY ||
      !process.env.OWNER_STORIES_TO || !process.env.OWNER_STORIES_FROM ||
      process.env.OWNER_STORIES_EDGE_PROTECTION !== 'confirmed') return fail(503,'intake_not_configured');
  const key = req.headers['idempotency-key'];
  if (typeof key !== 'string' || !UUID.test(key)) return fail(400,'idempotency_key_required');
  let body;
  try { body = await getBody(req); }
  catch (error) { return fail(error.message === 'too_large' ? 413 : 400, error.message === 'too_large' ? 'body_too_large' : 'invalid_body'); }
  const data = validate(body);
  if (!data) return fail(422,'invalid_fields');
  let proof;
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:new URLSearchParams({secret:process.env.TURNSTILE_SECRET_KEY,response:data.token}),
      signal:AbortSignal.timeout(8000), redirect:'error'
    });
    if (!response.ok) return fail(502,'verification_unavailable');
    proof = await response.json();
  } catch (_) { return fail(502,'verification_unavailable'); }
  const challenge = Date.parse(proof?.challenge_ts);
  const age = Date.now() - challenge;
  if (proof?.success !== true || proof.hostname !== new URL(origin).hostname ||
      proof.action !== 'owner_story' || !Number.isFinite(challenge) || age < -30000 || age > 300000)
    return fail(400,'verification_failed');
  const mailText = [
    'TOHEŞAR OWNER STORIES — 신규 참여 제안','',
    '차량: '+data.model,'연락: '+data.contact,'형식: '+data.theme,'',
    '이야기:',data.story,'',
    '신청자는 제안 처리 및 답변을 위한 연락처 사용에 동의했습니다.',
    '사진 사용·공개·인터뷰는 반드시 별도 동의 후 진행.'
  ].join('\n');
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method:'POST',
      headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json',
        'Idempotency-Key':'owner-stories/'+key.toLowerCase()},
      body:JSON.stringify({from:process.env.OWNER_STORIES_FROM,to:[process.env.OWNER_STORIES_TO],
        subject:'[TOHEŞAR] Owner Stories 참여 제안',text:mailText,
        ...(data.email ? {reply_to:data.contact} : {})}),
      signal:AbortSignal.timeout(10000), redirect:'error'
    });
    // A timeout, malformed response or 5xx can mean the provider accepted the mail.
    // Never retry internally; only the same key may be retried by the caller.
    if (!response.ok) {
      if (response.status === 409) return fail(409,'idempotency_conflict');
      return fail(response.status >= 500 ? 503 : 502, response.status >= 500 ? 'delivery_unconfirmed' : 'delivery_rejected');
    }
    const result = await response.json();
    if (!result || typeof result.id !== 'string' || !result.id) return fail(503,'delivery_unconfirmed');
    event('accepted',id);
    return reply(res,202,{ok:true,status:'accepted',requestId:id});
  } catch (_) { return fail(503,'delivery_unconfirmed'); }
}
module.exports = handler;
module.exports.config = {api:{bodyParser:false}};
module.exports._test = {validate,validEmail,originsFromEnv,getBody,MAX_BYTES};
