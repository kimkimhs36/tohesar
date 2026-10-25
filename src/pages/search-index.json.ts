import { visibleArticles } from '../lib/publication';
export async function GET() {
  const articles = await visibleArticles();
  return Response.json(
    articles.map(({ data: a }) => ({
      slug: a.slug,
      title: a.title,
      content_type: a.content_type,
      subjects: a.subjects,
      text: [
        a.title,
        a.deck,
        a.marque,
        a.model,
        a.era,
        a.lead,
        ...a.sections.flatMap((s) => [s.title, ...s.paragraphs]),
      ].join(' '),
    })),
  );
}
