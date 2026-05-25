import { z } from 'zod';
import { ASPECT_RATIO_OPTIONS, RESOLUTION_OPTIONS } from '../constants/generate-options.const';

const keys = Object.keys(RESOLUTION_OPTIONS);

export const GenerateOptionsSchema = z.object({
  resolution: z.enum(keys).default('1K'),
  aspectRatio: z.enum(ASPECT_RATIO_OPTIONS).default('4:3'),
});

export type GenerateOptions = z.infer<typeof GenerateOptionsSchema>;
