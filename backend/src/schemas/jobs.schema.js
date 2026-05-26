import { z } from 'zod';

export const importJobSchema = z.object({
  body: z.object({
    url: z.string().url(),
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    budget: z.string().optional(),
    source: z.enum(['manual', 'other']).default('manual'),
  }),
});

export const listJobsSchema = z.object({
  query: z.object({
    source: z.string().optional(),
    search: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).default(50),
    offset: z.coerce.number().min(0).default(0),
  }),
});
