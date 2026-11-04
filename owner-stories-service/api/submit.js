/* TOHEŞAR Owner Stories API — Vercel Node runtime.
   Production requires env secrets, verified Turnstile, and a verified sender.
   Does not store submissions; only relays an approved request to the editorial inbox.
*/
'use strict';

const ORIGIN_DEFAULT = 'https://tohesar.com';
const THEMES = new Set([
  'THE LINE — 차의 아름다운 형태',
  'THE BUILD — 나만의 튜닝과 선택',
  'THE MEMORY — 자동차와 함께한 기억'
]);
const MAX_BYTES = 8192;

function sanitizeSingleLine(value, max) {
  return typeof value === 'string'
    ? value.replace(/[\r\n\t\u0000-\u001f]/g, ' ').trim().slice(0, max)
    : '';
}
function validate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const model = sanitizeSingleLine(body.model, 120);
  const contact = sanitizeSingleLine(body.contact, 100);
  const story = typeof body.story === 'string' ? body.story.trim().slice(0, 701) : '';
  const theme = body.theme;
  const token = typeof body.turnstileToken === 'string' ? body.turnstileToken.trim() : '';
  const email = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(contact);
  const instagram = /^@[A-Za-z0-9._]{1,30}$/.test(contact);
  if (model.length < 2 || story.length < 8 || story.length > 700 ||
      !THEMES.has(theme) || (!email && !instagram) ||
      token.length < 10 || token.length > 2048) return null;
  if (body.website) return {honeypot: true};
  return {model, contact, story, theme, token, email};
}
async function getBody(req) {
  if (req.body !== undefined) {
    const data = Buffer.isBuffer(req.body) ? req.body.toString('utf8') :
      typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (Buffer.byteLength(data) > MAX_BYTES) throw new Error('too-large');
    return JSON.parse(data);
  }
  let size = 0, chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BYTES) throw new Error('too-large');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
function reply(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.end(JSON.stringify(data));
}
async function handler(req, res) {
  const allowed = (process.env.OWNER_STORIES_ORIGINS || ORIGIN_DEFAULT)
    .split(',').map(x => x.trim()).filter(Boolean);
  const origin = req.headers.origin || '';
  if (!allowed.includes(origin)) return reply(res, 403, {ok:false,error:'origin_denied'});
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary','Origin');
  res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if (req.method === 'OPTIONS') { res.statusCode=204; return res.end(); }
  if (req.method !== 'POST') return reply(res, 405, {ok:false,error:'method_not_allowed'});
  if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || ''))
    return reply(res, 415, {ok:false,error:'json_required'});
  if (!process.env.RESEND_API_KEY || !process.env.TURNSTILE_SECRET_KEY ||
      !process.env.OWNER_STORIES_TO || !process.env.OWNER_STORIES_FROM)
    return reply(res, 503, {ok:false,error:'intake_not_configured'});
  let body;
  try { body = await getBody(req); }
  catch (_) { return reply(res, 400, {ok:false,error:'invalid_body'}); }
  const data = validate(body);
  if (!data) return reply(res, 422, {ok:false,error:'invalid_fields'});
  if (data.honeypot) return reply(res, 202, {ok:true,status:'received'});
  try {
    const captcha = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:new URLSearchParams({secret:process.env.TURNSTILE_SECRET_KEY,response:data.token}),
      signal:AbortSignal.timeout(8000)
    });
    if (!captcha.ok) throw new Error('verification_unavailable');
    const proof = await captcha.json();
    const host = new URL(origin).hostname;
    if (!proof.success || proof.hostname !== host)
      return reply(res, 400, {ok:false,error:'verification_failed'});
    const mailText = [
      'TOHEŞAR OWNER STORIES — 신규 참여 제안','',
      '차량: '+data.model,'연락: '+data.contact,'형식: '+data.theme,'',
      '이야기:',data.story,'',
      '사진 사용·공개·인터뷰는 반드시 별도 동의 후 진행.'
    ].join('\n');
    const send = await fetch('https://api.resend.com/emails',{
      method:'POST',
      headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({
        from:process.env.OWNER_STORIES_FROM,
        to:[process.env.OWNER_STORIES_TO],
        subject:'[TOHEŞAR] Owner Stories 참여 제안 — '+data.model,
        text:mailText,
        ...(data.email?{reply_to:data.contact}:{})
      }),
      signal:AbortSignal.timeout(10000)
    });
    if (!send.ok) throw new Error('delivery_not_accepted');
    return reply(res, 202, {ok:true,status:'received'});
  } catch (_) {
    return reply(res, 502, {ok:false,error:'intake_temporarily_unavailable'});
  }
}
module.exports = handler;
module.exports._test = {sanitizeSingleLine, validate, getBody};
