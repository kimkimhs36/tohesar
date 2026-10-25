import { getCollection } from 'astro:content';
import { xml } from '../lib/xml';
export async function GET({ site }: { site: URL }) {
  const entries = (await getCollection('articles'))
    .filter(({ data: a }) => a.status === 'published' && !a.demo)
    .sort((a, b) => b.data.published_at!.localeCompare(a.data.published_at!));
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>TOHEŞAR</title><link>${xml(site.href)}</link><description>자동차, 디자인, 기계 문화의 기록. 검토 완료 후 발행한 기사만 제공합니다.</description><language>ko</language>${entries.map(({ data: a }) => `<item><title>${xml(a.title)}</title><description>${xml(a.deck)}</description><link>${xml(a.canonical!)}</link><guid isPermaLink="true">${xml(a.canonical!)}</guid><pubDate>${new Date(a.published_at!).toUTCString()}</pubDate></item>`).join('')}</channel></rss>`,
    { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } },
  );
}
