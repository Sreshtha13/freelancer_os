import { z } from 'zod';

export const generateProposalSchema = z.object({
  body: z.object({
    jobId: z.string().uuid(),
    tone: z.enum(['formal', 'friendly', 'confident']).default('friendly'),
    length: z.enum(['short', 'medium', 'long']).default('medium'),
    templateId: z.string().uuid().optional(),
  }),
});
