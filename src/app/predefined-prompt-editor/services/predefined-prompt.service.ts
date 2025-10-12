import { Injectable, inject, signal } from '@angular/core';
import { FirebaseService } from '../../ai/services/firebase.service';
import { ImageViewerService } from '../../shared/image-viewer/services/image-viewer.service';

@Injectable({
  providedIn: 'root'
})
export class PredefinedPromptService {
  private readonly firebaseService = inject(FirebaseService);
  private readonly imageViewerService = inject(ImageViewerService);

  readonly error = signal('');
  readonly isLoading = signal(false)

  async handleGenerate(prompt: string, imageFiles: File[]): Promise<string> {
    const currentPrompt = prompt.trim();

    const editImageCondition = !!currentPrompt && imageFiles.length > 0;
    if (!editImageCondition) {
      return ''; // Button should be disabled, but this is a safeguard.
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
      return '';
    } finally {
      this.isLoading.set(false);
    }
  }

  downloadImage(imageUrl: string, custom_filename: string): void {
      if (!imageUrl) {
        this.error.set('No image to download.');
        return;
      }

      this.imageViewerService.downloadImage(custom_filename, imageUrl);
  }
}
