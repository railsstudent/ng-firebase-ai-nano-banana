import { VisualStoryGenerateArgs } from '../types/visual-story-args.type';

export const DEFAULT_PROMPT_ARGS: VisualStoryGenerateArgs = {
  userPrompt: 'A detective who can talk to plants.',
  args: {
    style: 'consistent',
    transition: 'smooth',
    numberOfImages: 2,
    type: 'story'
  }
}
