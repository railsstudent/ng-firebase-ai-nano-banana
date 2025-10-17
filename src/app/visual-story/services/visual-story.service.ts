import { Injectable } from '@angular/core';
import { VisualStoryGenerateArgs } from '../types/visual-story-args.type';

@Injectable({
  providedIn: 'root'
})
export class VisualStoryService {
  buildStepPrompts(genArgs: VisualStoryGenerateArgs): string[] {
    const { userPrompt, args } = genArgs;
    const currentPrompt = userPrompt.trim();

    if (!currentPrompt) {
      return []; // Button should be disabled, but this is a safeguard.
    }

    const stepPrompts: string[] = [];

    for (let i = 0; i < args.numberOfImages; i++) {
      const storyPrompt = this.buildStoryPrompt({ userPrompt: currentPrompt, args }, i + 1);
      stepPrompts.push(storyPrompt);
    }

    return stepPrompts;
  }

  private buildStoryPrompt(genArgs: VisualStoryGenerateArgs, stepNumber: number): string {
    const { userPrompt, args } = genArgs;
    const { numberOfImages, style, transition, type } = args;
    let fullPrompt = `${userPrompt}, step ${stepNumber} of ${numberOfImages}`;

    // Add context based on type
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

    // Add transition context
    if (stepNumber > 1) {
      fullPrompt += `, ${transition} transition from previous step`;
    }

    return fullPrompt;
  }
}
