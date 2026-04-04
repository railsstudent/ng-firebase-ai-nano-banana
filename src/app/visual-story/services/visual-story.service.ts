import { ExtendVideoRequest, GenerateVideoFromFramesRequest, VideoGenerationResponse } from '@/ai/types/video.type';
import { GenVideoService } from '@/shared/gen-media/services/gen-video.service';
import { PromptHistoryService } from '@/shared/services/prompt-history.service';
import { inject, Injectable, linkedSignal, Signal, WritableSignal } from '@angular/core';
import { VisualStoryForm } from '../visual-story-form/types/visual-story-form.type';

@Injectable({
  providedIn: 'root'
})
export class VisualStoryService {
  private readonly promptHistoryService = inject(PromptHistoryService);
  private readonly genVideoService = inject(GenVideoService);

  buildStepPrompts(genArgs: VisualStoryForm): string[] {
    const { userPrompt, numberOfImages } = genArgs;
    const currentPrompt = userPrompt.trim();

    if (!currentPrompt) {
      return []; // Button should be disabled, but this is a safeguard.
    }

    const stepPrompts: string[] = [];

    for (let i = 0; i < numberOfImages; i++) {
      const storyPrompt = this.buildStoryPrompt(genArgs, i + 1);
      stepPrompts.push(storyPrompt);
    }

    return stepPrompts;
  }

  private buildStoryPrompt(genArgs: VisualStoryForm, stepNumber: number): string {
    const { userPrompt, numberOfImages, style, transition, type } = genArgs;
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

  addPrompt(key: string, modelValues: VisualStoryForm) {
    const { userPrompt, ...args } = modelValues;
    const strPrompt = JSON.stringify({ userPrompt, args });
    this.promptHistoryService.addPrompt(key, strPrompt);
  }

  interpolateVideo(request: GenerateVideoFromFramesRequest): Promise<VideoGenerationResponse> {
    try {
      return this.genVideoService.generateVideoFromFrames(request);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  extendInterpolatedVideo(
    prompt: string,
    counter: number,
    customVideo: VideoGenerationResponse,
    generatingingSignal: WritableSignal<boolean>,
    error: WritableSignal<string>
  ) {
    try {
      return this.genVideoService.extendInterpolatedVideo(prompt, counter, customVideo, generatingingSignal, error);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
