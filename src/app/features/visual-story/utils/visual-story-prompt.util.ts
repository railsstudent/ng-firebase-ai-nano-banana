import { VisualStoryForm } from '../visual-story-form/types/visual-story-form.type';

export function buildStepPrompts(genArgs: VisualStoryForm): string[] {
  const { userPrompt, numberOfImages } = genArgs;
  const currentPrompt = userPrompt.trim();

  if (!currentPrompt) {
    return [];
  }

  const stepPrompts: string[] = [];

  for (let i = 0; i < numberOfImages; i++) {
    const storyPrompt = buildStoryPrompt(genArgs, i + 1);
    stepPrompts.push(storyPrompt);
  }

  return stepPrompts;
}

function buildStoryPrompt(genArgs: VisualStoryForm, stepNumber: number): string {
  const { userPrompt, numberOfImages, style, transition, type } = genArgs;
  let fullPrompt = `${userPrompt}, step ${stepNumber} of ${numberOfImages}`;

  switch (type) {
    case 'story':
      fullPrompt += `, narrative sequence, ${style} art style`;
      break;
    case 'process':
      fullPrompt += `, procedural step, instructional illustration`;
      break;
    case 'tutorial':
      fullPrompt += `, tutorial step, educational diagram`;
      break;
    case 'timeline':
      fullPrompt += `, chronological progression, timeline visualization`;
      break;
  }

  if (stepNumber > 1) {
    fullPrompt += `, ${transition} transition from previous step`;
  }

  return fullPrompt;
}
