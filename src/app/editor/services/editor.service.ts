import { Injectable, Signal, inject, linkedSignal } from '@angular/core';
import { FirebaseService } from '../../ai/services/firebase.service';
import { ImageResponse } from '../../ai/types/image-response.type';
import { GenMediaService } from '../../shared/services/gen-media.service';
import { PromptFormService } from '../../shared/services/prompt-form.service';
import { PromptHistoryService } from '../../shared/services/prompt-history.service';

@Injectable({
  providedIn: 'root'
})
export class EditorService {
  private readonly promptFormService = inject(PromptFormService);
  private readonly promptHistoryService = inject(PromptHistoryService);
  private readonly firebaseService = inject(FirebaseService);
  private readonly genMediaService = inject(GenMediaService);

  readonly prompt = this.promptFormService.prompt;
  readonly error = this.promptFormService.error;
  readonly isLoading = this.promptFormService.isLoading;

  videoUrl = this.genMediaService.videoUrl.asReadonly();
  videoError = this.genMediaService.videoError.asReadonly();
  isGeneratingVideo = this.genMediaService.isGeneratingVideo.asReadonly();

  getPromptHistory(featureId: Signal<string>) {
    return linkedSignal({
      source: () => featureId(),
      computation: (featureId) => this.promptHistoryService.getHistory(featureId)()
    });
  }

  async handleGenerate(
    featureId: string,
    featureNeedsImage: boolean,
    imageFiles: File[]
  ): Promise<ImageResponse | undefined> {
    const currentPrompt = this.prompt().trim();

    const canGenerateImage = !!currentPrompt
      && (featureNeedsImage ? imageFiles.length > 0 : imageFiles.length === 0);

    if (!canGenerateImage) {
      return undefined; // Button should be disabled, but this is a safeguard.
    }

    this.isLoading.set(true);
    this.error.set('');
    console.log(`Generating for ${featureId} with prompt: ${currentPrompt}`);

    // Only add non-empty prompts to history
    if (currentPrompt) {
      this.promptHistoryService.addPrompt(featureId, currentPrompt);
    }

    try {
      return await this.firebaseService.generateImage(currentPrompt, imageFiles);
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
        this.error.set(e.message);
      } else {
        this.error.set('An unexpected error occurred.');
      }
      return undefined;
    } finally {
      this.isLoading.set(false);
    }
  }

  clearHistory(featureId: string): void {
    this.promptHistoryService.clearHistory(featureId);
  }

  downloadImage(imageUrl: string): void {
      if (!imageUrl) {
        this.error.set('No image to download.');
        return;
      }

      const filename = this.prompt() || 'generated-image';
      this.genMediaService.downloadImage(filename, imageUrl);
  }

  async generateVideo(imageResponse: ImageResponse | undefined): Promise<void> {
    if (imageResponse) {
      const { data: imageBytes, mimeType } = imageResponse;
      await this.genMediaService.generateVideo(this.prompt(), imageBytes, mimeType);
    }
  }
}
