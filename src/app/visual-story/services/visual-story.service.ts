import { FirebaseService } from '@/ai/services/firebase.service';
import { ImageResponse } from '@/ai/types/image-response.type';
import { GenMediaService } from '@/shared/services/gen-media.service';
import { Injectable, inject, signal } from '@angular/core';
import { VisualStoryArgs, VisualStoryGenerateArgs } from '../types/visual-story-args.type';

@Injectable({
  providedIn: 'root'
})
export class VisualStoryService {
  private readonly firebaseService = inject(FirebaseService);
  private readonly genMediaService = inject(GenMediaService);

  readonly error = signal('');
  readonly isLoading = signal(false)

  videoUrl = this.genMediaService.videoUrl.asReadonly();
  videoError = this.genMediaService.videoError.asReadonly();
  isGeneratingVideo = this.genMediaService.isGeneratingVideo.asReadonly();

  async handleGenerateSequence(genArgs: VisualStoryGenerateArgs): Promise<ImageResponse[] | undefined> {
    const { userPrompt, args } = genArgs;
    const currentPrompt = userPrompt.trim();

    if (!currentPrompt) {
      return undefined; // Button should be disabled, but this is a safeguard.
    }

    this.isLoading.set(true);
    this.error.set('');
    let isFirstError = false;
    const imageResponses: ImageResponse[] = [];

    try {
      for (let i = 0; i < args.numberOfImages; i++) {
        const imageResponse = await this.generateStepImage(currentPrompt, args, i);
        if (imageResponse) {
          imageResponses.push(imageResponse);
        }
      }
    } catch (outerError: unknown) {
      console.error(outerError);
      if (!isFirstError) {
        if (outerError instanceof Error) {
          this.error.set(outerError.message);
        } else {
          this.error.set('An unexpected error occurred.');
        }
        isFirstError = true;
      }
    } finally {
      this.isLoading.set(false);
    }

    return imageResponses;
  }

  private async generateStepImage(currentPrompt: string, args: VisualStoryArgs, i: number) {
    const storyPrompt = this.buildStoryPrompt({ userPrompt: currentPrompt, args }, i + 1);
    console.log('Story Prompt', storyPrompt);

    try {
      return await this.firebaseService.generateImage(currentPrompt, []);
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
        throw e;
      }
      throw new Error('An unexpected error occurred.');
    }
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

  downloadImage(imageUrl: string): void {
      if (!imageUrl) {
        this.error.set('No image to download.');
        return;
      }

      this.genMediaService.downloadImage('visual_story', imageUrl);
  }

  async generateVideo(prompt: string, imageResponse: ImageResponse | undefined): Promise<void> {
    if (imageResponse) {
      const { data: imageBytes, mimeType } = imageResponse;
      await this.genMediaService.generateVideo(prompt, imageBytes, mimeType);
    }
  }
}
