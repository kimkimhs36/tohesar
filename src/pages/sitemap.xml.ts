import { getCollection } from 'astro:content';
import { isPreview } from '../lib/publication';
import { xml } from '../lib/xml';
export async function GET({ site }: { site: URL }) {
  const articles = (await getCollection('articles')).filter(
    ({ data: a }) => a.status === 'published' && !a.demo,
  );
  const urls = isPreview
    ? []
    : ['', 'latest/', 'features/', 'subjects/', 'archive/', 'about/']
        .map((p) => `<url><loc>${xml(new URL(p, site).href)}</loc></url>`)
        .concat(
          articles.map(
            ({ data: a }) =>
              `<url><loc>${xml(a.canonical!)}</loc><lastmod>${a.modified_at}</lastmod></url>`,
          ),
        );
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
}
