import { Injectable, inject, signal } from '@angular/core';
import { FirebaseService } from '../../ai/services/firebase.service';
import { ImageResponse } from '../../ai/types/image-response.type';
import { GenMediaService } from '../../shared/services/gen-media.service';

@Injectable({
  providedIn: 'root'
})
export class PredefinedPromptService {
  private readonly firebaseService = inject(FirebaseService);
  private readonly genMediaService = inject(GenMediaService);

  readonly error = signal('');
  readonly isLoading = signal(false)

  videoUrl = this.genMediaService.videoUrl.asReadonly();
  videoError = this.genMediaService.videoError.asReadonly();
  isGeneratingVideo = this.genMediaService.isGeneratingVideo.asReadonly();

  async handleGenerate(prompt: string, imageFiles: File[]): Promise<ImageResponse | undefined> {
    const currentPrompt = prompt.trim();

    const editImageCondition = !!currentPrompt && imageFiles.length > 0;
    if (!editImageCondition) {
      return undefined; // Button should be disabled, but this is a safeguard.
    }

    this.isLoading.set(true);
    this.error.set('');

    try {
      if (imageFiles.length === 0) {
        throw Error('At least one image file is required to generate an image with system instruction.');
      }
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

  downloadImage(imageUrl: string, custom_filename: string): void {
      if (!imageUrl) {
        this.error.set('No image to download.');
        return;
      }

      this.genMediaService.downloadImage(custom_filename, imageUrl);
  }

  async generateVideo(prompt: string, imageResponse: ImageResponse | undefined): Promise<void> {
    if (imageResponse) {
      const imageBytes = imageResponse.data;
      const mimeType =imageResponse.mimeType;
      await this.genMediaService.generateVideo(prompt, imageBytes, mimeType);
    }
  }
}
