import { z } from 'zod';
import { NUM_OF_IMAGES_LIST, STORY_TYPE_LIST, STYLE_LIST, TRANSITION_LIST } from '../constants/visual-story-form.const';

export const VisualStoryFormSchema = z.object({
  userPrompt: z.string(),
  numberOfImages: z.number().int().refine((val) => (NUM_OF_IMAGES_LIST as unknown as number[]).includes(val)),
  type: z.enum(STORY_TYPE_LIST).default('story'),
  style: z.enum(STYLE_LIST).default('consistent'),
  transition: z.enum(TRANSITION_LIST).default('smooth'),
});

export type VisualStoryForm = z.infer<typeof VisualStoryFormSchema>;

export type VisualStoryStorage = {
  userPrompt: string;
  args: Omit<VisualStoryForm, 'userPrompt'>
};
