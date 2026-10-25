import { getCollection } from 'astro:content';
import registry from '../../content-assets.json';
export const isPreview = process.env.PUBLICATION_MODE !== 'published';
export const subjects = [
  ['automobiles', 'Automobiles', '자동차'],
  ['motorsport', 'Motorsport', '모터스포츠'],
  ['motorcycles', 'Motorcycles', '모터사이클'],
  ['bicycles', 'Bicycles', '자전거'],
  ['aircraft', 'Aircraft', '항공'],
  ['film-machines', 'Film & Machines', '영화와 기계'],
  ['design-history', 'Design & History', '디자인과 역사'],
] as const;
export const subjectName = (key: string) => subjects.find((s) => s[0] === key)?.[2] || key;
export async function visibleArticles() {
  const entries = await getCollection('articles');
  for (const { data: a } of entries) {
    const asset = registry.find((r) => r.id === a.hero);
    if (!asset) throw new Error(`Missing hero rights record: ${a.slug}`);
    if (
      a.status === 'published' &&
      (asset.review !== 'verified' || (asset.expiry && new Date(asset.expiry) < new Date()))
    )
      throw new Error(`Uncleared or expired image: ${a.slug}`);
  }
  return entries.filter(
    ({ data: a }) => a.status === 'published' || (isPreview && a.demo && a.status === 'review'),
  );
}
export type Story = Awaited<ReturnType<typeof visibleArticles>>[number]['data'];
export const href = (a: Story) => `/articles/${a.slug}/`;
