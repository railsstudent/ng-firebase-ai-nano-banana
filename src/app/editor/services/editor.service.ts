import { DOCUMENT, Injectable, Signal, computed, inject, linkedSignal } from '@angular/core';
import { FeatureDetails } from '../types/feature-details.type';
import { PromptHistoryService } from '../../ui/services/prompt-history.service';
import { PromptFormService } from '../../ui/services/prompt-form.service';
import { FirebaseService } from '../../ai/services/firebase.service';

@Injectable({
  providedIn: 'root'
})
export class EditorService {
  private readonly promptFormService = inject(PromptFormService);
  private readonly promptHistoryService = inject(PromptHistoryService);
  private readonly firebaseService = inject(FirebaseService);

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

  getFeatureDetails(featureId: string): FeatureDetails {
    switch (featureId) {
      case 'create':
        return {
          buttonText: 'Create',
          loadingText: 'Creating image...',
          description: 'Generate new and unique images from text prompts using powerful AI models.'
        };
      case 'edit':
        return {
          buttonText: 'Edit',
          loadingText: 'Applying edits...',
          description: 'Use generative AI to edit your images with simple text prompts.'
        };
      case 'restoration':
        return {
          buttonText: 'Restore',
          loadingText: 'Restoring photo...',
          description: 'Bring old and damaged photos back to life by removing scratches and restoring color.'
        };
      case 'fuse':
        return {
          buttonText: 'Fuse',
          loadingText: 'Fusing images...',
          description: 'Creatively merge two photos into a single, artistic masterpiece.'
        };
      case '3d-model':
        return {
          buttonText: 'Make a toy',
          loadingText: 'Generating 3D model...',
          description: 'Transform your 2D images into 3D models ready for any project.'
        };
      case 'conversational':
        return {
          buttonText: 'Create',
          loadingText: 'Thinking...',
          description: 'Edit your photos by simply having a conversation and describing what you want.'
        };
      default:
        return {
          buttonText: 'Create',
          loadingText: 'Generating...',
          description: 'Select a feature to get started on your masterpiece.'
        };
    }
  }

  document = inject(DOCUMENT);
  downloadImage(imageUrl: string): void {
      if (!imageUrl) {
        this.error.set('No image to download.');
        return;
      }

      const link = this.document.createElement('a');
      link.href = imageUrl;

      // Create a filename from the prompt
      const promptText = this.prompt() || 'generated-image';
      const safeFilename = promptText.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50);

      link.download = `${safeFilename}.png`;
      this.document.body.appendChild(link);
      link.click();
      this.document.body.removeChild(link);
  }
}
