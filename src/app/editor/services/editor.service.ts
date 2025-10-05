import { Injectable, Signal, inject, linkedSignal } from '@angular/core';
import { FirebaseService } from '../../ai/services/firebase.service';
import { ImageViewerService } from '../../ui/image-viewer/services/image-viewer.service';
import { PromptFormService } from '../../ui/services/prompt-form.service';
import { PromptHistoryService } from '../../ui/services/prompt-history.service';

@Injectable({
  providedIn: 'root'
})
export class EditorService {
  private readonly promptFormService = inject(PromptFormService);
  private readonly promptHistoryService = inject(PromptHistoryService);
  private readonly firebaseService = inject(FirebaseService);
  private readonly imageViewerService = inject(ImageViewerService);

  readonly prompt = this.promptFormService.prompt;
  readonly error = this.promptFormService.error;
  readonly isLoading = this.promptFormService.isLoading;

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
  ): Promise<string> {
    const currentPrompt = this.prompt().trim();

    const createImageCondition = !!currentPrompt && !featureNeedsImage;
    const editImageCondition = !!currentPrompt && featureNeedsImage && imageFiles.length > 0;
    if (!createImageCondition && !editImageCondition) {
      return ''; // Button should be disabled, but this is a safeguard.
    }

    this.isLoading.set(true);
    this.error.set('');
    console.log(`Generating for ${featureId} with prompt: ${currentPrompt}`);

    // Only add non-empty prompts to history
    if (currentPrompt.trim()) {
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
      return '';
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
      this.imageViewerService.downloadImage(filename, imageUrl);
  }
}
