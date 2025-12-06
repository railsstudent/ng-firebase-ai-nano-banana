import { VideoResponse } from '@/ai/types/video-response.type';
import { GenMediaService } from '@/shared/gen-media/services/gen-media.service';
import { GenerateVideoFromFramesRequest } from '@/shared/gen-media/types/video-params.type';
import { PromptHistoryService } from '@/shared/services/prompt-history.service';
import { inject, Injectable, linkedSignal, Signal } from '@angular/core';
import { VisualStoryGenerateArgs } from '../types/visual-story-args.type';

@Injectable({
  providedIn: 'root'
})
export class VisualStoryService {
  private readonly promptHistoryService = inject(PromptHistoryService);
  private readonly genMediaService = inject(GenMediaService);

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

  getPromptHistory(key: Signal<string>) {
    return linkedSignal({
      source: () => key(),
      computation: (featureId) => this.promptHistoryService.getHistory(featureId)()
    });
  }

  clearHistory(key: string): void {
    this.promptHistoryService.clearHistory(key);
  }

  addPrompt(key: string, args: VisualStoryGenerateArgs) {
    const strPrompt = JSON.stringify(args);
    this.promptHistoryService.addPrompt(key, strPrompt);
  }

  // interpolateVideo(request: GenerateVideoFromFramesRequest): Promise<VideoResponse> {
  //   try {
  //     return this.genMediaService.generateVideoFromFrames(request);
  //   } catch (e) {
  //     console.error(e);
  //     return Promise.resolve({ uri: '', videoUrl: '' });
  //   }
  // }
}
