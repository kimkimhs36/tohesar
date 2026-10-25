import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { articleSchema } from '../src/lib/schema.ts';
const assets = JSON.parse(fs.readFileSync('content-assets.json'));
const articles = fs
  .readdirSync('src/content/articles')
  .map((f) => JSON.parse(fs.readFileSync('src/content/articles/' + f)));
test('Every article satisfies the durable editorial schema and has a local licensed photograph', () => {
  const slugs = new Set();
  for (const a of articles) {
    assert.equal(articleSchema.safeParse(a).success, true);
    assert.ok(!slugs.has(a.slug));
    slugs.add(a.slug);
    const asset = assets.find((r) => r.id === a.hero);
    assert.ok(asset);
    assert.equal(asset.review, 'verified');
    assert.ok(asset.owner && asset.licence_url && asset.source && asset.usage && asset.attribution);
    assert.ok(fs.existsSync(asset.evidence));
    assert.ok(fs.existsSync(`src/assets/photos/${a.hero}.jpg`));
    for (const related of a.related_articles) assert.ok(articles.some((s) => s.slug === related));
  }
});
test('Review fixtures cannot be promoted to published content without actual editorial clearance', () => {
  for (const a of articles) {
    assert.equal(a.published_at, null);
    assert.equal(a.demo, true);
    assert.equal(a.status, 'review');
    assert.equal(articleSchema.safeParse({ ...a, status: 'published' }).success, false);
  }
  const approved = {
    ...articles[0],
    status: 'published',
    demo: false,
    author: 'Test writer',
    editor: 'Test editor',
    published_at: '2026-10-25T09:00:00Z',
    canonical: 'https://example.com/article/',
    source_documents: [
      { title: 'Test source', url: 'https://example.com/source', verification: 'verified' },
    ],
  };
  assert.equal(articleSchema.safeParse(approved).success, true);
  for (const key of ['author', 'editor', 'published_at', 'canonical'])
    assert.equal(articleSchema.safeParse({ ...approved, [key]: null }).success, false);
  assert.equal(articleSchema.safeParse({ ...approved, source_documents: [] }).success, false);
  assert.equal(
    articleSchema.safeParse({
      ...approved,
      source_documents: [{ title: 'Pending', url: 'https://example.com', verification: 'pending' }],
    }).success,
    false,
  );
});
test('Generated preview has no published schema, fabricated dates, demo RSS or sitemap entries', () => {
  const rss = fs.readFileSync('dist/rss.xml', 'utf8');
  const sitemap = fs.readFileSync('dist/sitemap.xml', 'utf8');
  assert.ok(!rss.includes('<item>'));
  assert.ok(!sitemap.includes('<url>'));
  for (const a of articles) {
    const page = fs.readFileSync(`dist/articles/${a.slug}/index.html`, 'utf8');
    assert.ok(page.includes('noindex, nofollow'));
    assert.ok(!page.includes('application/ld+json'));
    assert.ok(!page.includes('datePublished'));
    assert.ok(page.includes('미발행'));
    assert.ok(page.includes('rel="canonical"'));
  }
  const index = JSON.parse(fs.readFileSync('dist/search-index.json'));
  assert.equal(index.length, 3);
  assert.ok(!index.some((a) => a.slug.includes('renault')));
});
test('Identity is the original vector and deployment disables automatic Git releases', () => {
  assert.ok(fs.readFileSync('public/identity/cedilla.svg', 'utf8').includes('M 83.43,13.00'));
  assert.equal(JSON.parse(fs.readFileSync('vercel.json')).git.deploymentEnabled, false);
});

test('All generated internal links and local images resolve within the V3 output', () => {
  const walk = (dir) =>
    fs
      .readdirSync(dir, { withFileTypes: true })
      .flatMap((e) => (e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`]));
  for (const file of walk('dist').filter((f) => f.endsWith('.html'))) {
    const html = fs.readFileSync(file, 'utf8');
    for (const [, url] of html.matchAll(/(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
      if (url.startsWith('//')) continue;
      const target = `dist${decodeURIComponent(url)}`;
      assert.ok(
        fs.existsSync(target) &&
          (!fs.statSync(target).isDirectory() || fs.existsSync(`${target}/index.html`)),
        `${file}: ${url}`,
      );
    }
  }
});
