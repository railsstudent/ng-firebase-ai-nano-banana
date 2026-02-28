import { z } from 'zod';

export const PromptFormSchema = z.object({
  value: z.string()
});

export type PromptForm = z.infer<typeof PromptFormSchema>;
