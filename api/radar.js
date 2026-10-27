// TOHEŞAR — SOURCE RADAR v1
// This is a live, attributed HEADLINE INDEX. It never republishes complete third-party articles,
// downloads press photography, generates new headlines, or automatically publishes TOHEŞAR stories.
// Every result is linked to the publisher's original URL.
const FEEDS = [
  { id: 'porsche', name: 'Porsche Newsroom', url: 'https://newsroom.porsche.com/rss/en/index.rss', hosts: ['newsroom.porsche.com'] },
  { id: 'bmw', name: 'BMW Group PressClub', url: 'https://www.press.bmwgroup.com/global/rss', hosts: ['www.press.bmwgroup.com', 'press.bmwgroup.com'] },
  { id: 'motor1', name: 'Motor1', url: 'https://www.motor1.com/rss/news/all/', hosts: ['www.motor1.com', 'motor1.com'] },
];
const ONE_DAY = 86400000;
const classify = (title) => {
  const s = title.toLowerCase();
  if (/motorcycle|motorrad|ducati|superbike|scooter|bike|two-wheel/.test(s)) return 'motorcycles';
  if (/racing|race|rally|formula|motorsport|grand prix|le mans|f1|penske|wrc|nascar/.test(s)) return 'motorsport';
  if (/design|concept|prototype|styling|shape|interior|coachbuild|heritage|historic|classic|vintage/.test(s)) return 'design';
  if (/electric|battery|charging|hybrid|powertrain|engine|technology|software|hydrogen|efficiency/.test(s)) return 'technology';
  return 'new-cars';
};
function decodeXml(value = '') {
  return String(value)
    .replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/i, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x[0-9a-f]+|#[0-9]+|amp|lt|gt|quot|apos|nbsp|ndash|mdash|hellip);/gi, (match, entity) => {
      const e = entity.toLowerCase();
      if (e[0] === '#') {
        const num = e[1] === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return num > 0 && num <= 0x10ffff ? String.fromCodePoint(num) : '';
      }
      return ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…' })[e] || match;
    }).replace(/\s+/g, ' ').trim();
}
function tag(xml, key) {
  const safe = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (xml.match(new RegExp('<' + safe + '(?:\\s[^>]*)?>([\\s\\S]*?)<\\/' + safe + '>', 'i')) || [,''])[1];
}
function validArticleUrl(input, source) {
  try {
    const u = new URL(decodeXml(input));
    if (u.protocol !== 'https:') return null;
    const permitted = source.hosts.some(h => u.hostname === h);
    if (!permitted) return null;
    u.hash = '';
    // Avoid tracking links in reader-facing URLs.
    for (const key of Array.from(u.searchParams.keys())) {
      if (/^utm_|^fbclid$|^gclid$/i.test(key)) u.searchParams.delete(key);
    }
    return u.href;
  } catch { return null; }
}
function entriesFromFeed(xml, source) {
  const segments = (xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) ||
     xml.match(/<entry(?:\s[^>]*)?>[\s\S]*?<\/entry>/gi) || []).slice(0, 60);
  const now = Date.now();
  return segments.map((segment) => {
    const headline = decodeXml(tag(segment, 'title')).slice(0, 230);
    const textLink = tag(segment, 'link');
    const atomLink = (segment.match(/<link\s[^>]*href=["']([^"']+)["']/i) || [,''])[1];
    const url = validArticleUrl(textLink || atomLink, source);
    const rawDate = decodeXml(tag(segment, 'pubDate') || tag(segment, 'published') || tag(segment, 'updated') || tag(segment, 'dc:date'));
    const t = Date.parse(rawDate);
    if (!headline || !url || !Number.isFinite(t) || t < now - 45 * ONE_DAY || t > now + ONE_DAY) return null;
    // Source feeds are official feeds. These entries are source claims, NOT fact-checked TOHEŞAR articles.
    if (source.id === 'porsche' && /tennis|golf|fashion|watch|esport/i.test(headline)) return null;
    return {
      title: headline,
      url,
      source: source.name,
      source_id: source.id,
      category: classify(headline),
      published_at: new Date(t).toISOString(),
      original_language: 'en',
      kind: 'external-source',
    };
  }).filter(Boolean);
}
async function fetchSource(source) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 5500);
  try {
    const r = await fetch(source.url, { signal: controller.signal, headers: { 'Accept': 'application/rss+xml,application/atom+xml,application/xml,text/xml;q=0.9', 'User-Agent': 'TOHESAR-Editorial-Radar/1.0 (attributed reader)' }, redirect: 'follow' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const xml = (await r.text()).slice(0, 1400000);
    if (!/<rss\b|<feed\b/i.test(xml)) throw new Error('not-xml-feed');
    return { source: source.name, id: source.id, status: 'ok', items: entriesFromFeed(xml, source) };
  } catch(e) {
    return { source: source.name, id: source.id, status: 'unavailable', items: [] };
  } finally { clearTimeout(id); }
}
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=1800');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options','nosniff');
  const results = await Promise.all(FEEDS.map(fetchSource));
  const seen = new Set();
  const articles = results.flatMap(x => x.items).sort((a,b) => b.published_at.localeCompare(a.published_at))
   .filter(x => { const key = x.url.replace(/\/$/,'').toLowerCase(); if(seen.has(key)) return false; seen.add(key); return true; }).slice(0,60);
  const any = results.some(x => x.status === 'ok');
  return res.status(any ? 200 : 503).json({
    status: any ? (results.every(x => x.status==='ok') ? 'ok' : 'partial') : 'unavailable',
    fetched_at: new Date().toISOString(),
    editorial_note: '외부 발행처에서 제공한 제목·날짜·링크입니다. TOHEŞAR의 독립 검증 기사나 한국어 번역이 아닙니다.',
    sources: results.map(({source,id,status,items})=>({source,id,status,count:items.length})),
    articles,
  });
}
