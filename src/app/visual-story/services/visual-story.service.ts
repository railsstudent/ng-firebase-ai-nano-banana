import { FirebaseService } from '@/ai/services/firebase.service';
import { ImageResponse } from '@/ai/types/image-response.type';
import { GenMediaService } from '@/shared/services/gen-media.service';
import { Injectable, inject, signal } from '@angular/core';

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

  async handleGenerate(prompt: string): Promise<ImageResponse[] | undefined> {
    const currentPrompt = prompt.trim();

    if (!currentPrompt) {
      return undefined; // Button should be disabled, but this is a safeguard.
    }

    this.isLoading.set(true);
    this.error.set('');

    try {
      return await this.firebaseService.generateStory(currentPrompt);
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
