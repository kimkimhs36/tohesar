import { z } from 'zod';
export const subjectKeys = [
  'automobiles',
  'motorsport',
  'motorcycles',
  'bicycles',
  'aircraft',
  'film-machines',
  'design-history',
] as const;
export const articleSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string().min(3),
    deck: z.string().min(10),
    content_type: z.enum(['News', 'Feature', 'Design File', 'Archive', 'Film', 'Photo Essay']),
    subjects: z.array(z.enum(subjectKeys)).min(1),
    marque: z.string().optional(),
    model: z.string().optional(),
    era: z.string().optional(),
    status: z.enum(['draft', 'review', 'published']),
    demo: z.boolean(),
    published_at: z.string().datetime().nullable(),
    modified_at: z.string().datetime(),
    author: z.string().nullable(),
    editor: z.string().nullable(),
    hero: z.string(),
    source_documents: z.array(
      z.object({
        title: z.string(),
        url: z.string().url(),
        verification: z.enum(['pending', 'verified']),
      }),
    ),
    correction_log: z.array(z.object({ date: z.string(), note: z.string() })),
    canonical: z.string().url().nullable(),
    social_image: z.string().nullable(),
    related_articles: z.array(z.string()),
    reading_minutes: z.number().int().positive(),
    lead: z.string(),
    sections: z.array(z.object({ title: z.string(), paragraphs: z.array(z.string()) })),
    quote: z.string().optional(),
  })
  .superRefine((a, ctx) => {
    if (
      a.status === 'published' &&
      (a.demo ||
        !a.author ||
        !a.editor ||
        !a.published_at ||
        !a.canonical ||
        !a.source_documents.length ||
        a.source_documents.some((s) => s.verification !== 'verified'))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Publication requires a real byline, editor, date, canonical, verified sources and demo=false.',
      });
    }
  });
