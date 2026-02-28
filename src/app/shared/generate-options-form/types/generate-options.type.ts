import { z } from 'zod';
import { ASPECT_RATIO_OPTIONS, RESOLUTION_OPTIONS } from '../constants/generate-options.const';

export const GenerateOptionsSchema = z.object({
  resolution: z.enum(RESOLUTION_OPTIONS).default('1K'),
  aspectRatio: z.enum(ASPECT_RATIO_OPTIONS).default('4:3'),
});

export type GenerateOptions = z.infer<typeof GenerateOptionsSchema>;
