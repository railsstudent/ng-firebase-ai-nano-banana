import { z } from 'zod';

export const PromptImageConfigSchema = z.object({
  prompt: z.string(),
  aspectRatio: z.string(),
  resolution: z.string(),
});

export type PromptImageConfig = z.infer<typeof PromptImageConfigSchema>;
