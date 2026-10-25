import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { articleSchema } from './lib/schema';
export const collections = {
  articles: defineCollection({
    loader: glob({ pattern: '*.json', base: './src/content/articles' }),
    schema: articleSchema,
  }),
};
