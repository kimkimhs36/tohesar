import { isPreview } from '../lib/publication';
export function GET({ site }: { site: URL }) {
  return new Response(
    isPreview
      ? 'User-agent: *\nAllow: /\n# Unpublished preview: noindex in HTML and HTTP headers. Crawling is allowed to read it.\n'
      : `User-agent: *\nAllow: /\nSitemap: ${new URL('sitemap.xml', site)}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
}
