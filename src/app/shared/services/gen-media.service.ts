import { FirebaseService } from '@/ai/services/firebase.service';
import { ImageResponse } from '@/ai/types/image-response.type';
import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { GeminiService } from '../../ai/services/gemini.service';
import { GenerateVideoRequest } from '../../ai/types/generate-video..type';

@Injectable({
  providedIn: 'root'
})
export class GenMediaService {
  private readonly document = inject(DOCUMENT);
  private readonly geminiService = inject(GeminiService);
  private readonly firebaseService = inject(FirebaseService);

  videoError = signal('');
  videoUrl = signal('');
  isGeneratingVideo = signal(false);

  imageGenerationError = signal('');

  downloadImage(filename: string, imageUrl: string): void {
      if (!imageUrl) {
        return;
      }

      const link = this.document.createElement('a');
      link.href = imageUrl;

      // Create a filename from the prompt
      const safeFilename = filename
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase().substring(0, 50);

      link.download = `${safeFilename}.png`;
      this.document.body.appendChild(link);
      link.click();
      this.document.body.removeChild(link);
  }

  async generateVideo(prompt: string, imageBytes: string, mimeType: string): Promise<void> {
    try {
      const request: GenerateVideoRequest = {
        imageBytes,
        mimeType,
        prompt,
        config: {
          aspectRatio: '16:9'
        }
      }

      this.isGeneratingVideo.set(true);
      const videoUrl = await this.geminiService.generateVideo(request);
      this.videoUrl.set(videoUrl);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.videoError.set(error.message);
      } else {
        this.videoError.set('An unexpected error occurred.');
      }
    } finally {
      this.isGeneratingVideo.set(false);
    }
  }

  private async generateImage(prompt: string, imageFiles: File[]): Promise<ImageResponse | undefined> {
    if (!prompt || !prompt.trim()) {
      return undefined;
    }

    const trimmedPrompt = prompt.trim();
    console.log('Prompt', trimmedPrompt);

    try {
      return await this.firebaseService.generateImage(trimmedPrompt, imageFiles);
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
        throw e;
      } else {
        throw new Error('Unexpected error in image generation.')
      }
    }
  }

  async generateImages(prompts: string[], imageFiles: File[]): Promise<ImageResponse[]> {
    if (!prompts?.length) {
      return [];
    }

    let isFirstError = false;
    const imageResponses: ImageResponse[] = [];
    this.imageGenerationError.set('');
    this.videoUrl.set('');

    for (let i = 0; i < prompts.length; i=i+1) {
      try {
        const imageResponse = await this.generateImage(prompts[i], imageFiles);
        if (imageResponse) {
          imageResponses.push(imageResponse);
        }
      } catch (e: unknown) {
        if (!isFirstError) {
          if (e instanceof Error) {
            this.imageGenerationError.set(e.message);
          } else {
            this.imageGenerationError.set('Unexpected error in image generation.');
          }
          isFirstError = true;
        }
      }
    }

    return imageResponses.map((imageResponse, index) => ({
      ...imageResponse,
      id: index,
    }));
  }
}
