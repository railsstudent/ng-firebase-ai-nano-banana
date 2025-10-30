import { FirebaseService } from '@/ai/services/firebase.service';
import { GeminiService } from '@/ai/services/gemini.service';
import { ImageResponse } from '@/ai/types/image-response.type';
import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { GenerateVideoFromFramesRequest, GenerateVideoRequestImageParams } from '../types/video-params.type';

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

  async generateVideo(imageParams: GenerateVideoRequestImageParams): Promise<void> {
    let firstVideoError = false;
    try {
      this.videoError.set('');
      this.isGeneratingVideo.set(true);
      const videoUrl = await this.geminiService.generateVideo({
        ...imageParams,
        config: {
          aspectRatio: '16:9',
          resolution: "720p"
        }
      });
      this.videoUrl.set(videoUrl);
    } catch (e) {
      console.error(e);
      const firstError = this.videoErrorHandler(firstVideoError, e);
      try {
        this.videoUrl.set(await this.getFallbackVideoUrl(imageParams));
      } catch (error: unknown) {
        const secondError = this.videoErrorHandler(firstError.firstVideoError, error);
        this.videoError.set(firstError.msg || secondError.msg);
      }
    } finally {
      this.isGeneratingVideo.set(false);
    }
  }

  private videoErrorHandler(firstVideoError: boolean, error: unknown) {
    if (!firstVideoError) {
      if (error instanceof Error) {
        try {
          const parsed = JSON.parse(error.message);
          return { msg: parsed.error.message, firstVideoError: true };
        } catch {
          return { msg: error.message, firstVideoError: true };
        }
      }
      return { msg: 'An unexpected error occurred.', firstVideoError: true };
    }

    return { msg: '', firstVideoError };
  }

  private async generateImage(prompt: string, imageFiles: File[]): Promise<ImageResponse | undefined> {
    if (!prompt || !prompt.trim()) {
      return undefined;
    }

    const trimmedPrompt = prompt.trim();
    console.log('Prompt', trimmedPrompt);

    try {
      return await this.firebaseService.generateImage(trimmedPrompt, imageFiles);
    } catch (e) {
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
      } catch (e) {
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

  async generateVideoFromFrames(imageParams: GenerateVideoFromFramesRequest): Promise<string> {
    let firstVideoError = false;
    try {
      const videoUrl = await this.geminiService.generateVideo({
        ...imageParams,
        config: {
          aspectRatio: '16:9',
          resolution: "720p",
          lastFrame: {
            imageBytes: imageParams.lastFrameImageBytes,
            mimeType: imageParams.lastFrameMimeType
          }
        }
      });
      return videoUrl;
    } catch (e) {
      console.error(e);
      const firstError = this.videoErrorHandler(firstVideoError, e);
      try {
        // maybe an older Veo model used, remove configurations that Veo 3 and Veo 3.1 have
        return await this.getFallbackVideoUrl(imageParams);
      } catch (error: unknown) {
        const secondError = this.videoErrorHandler(firstError.firstVideoError, error);
        throw new Error(firstError.msg || secondError.msg);
      }
    }
  }

  private async getFallbackVideoUrl(imageParams: GenerateVideoRequestImageParams) {
    const fallbackVideoUrl = await this.geminiService.generateVideo({
      prompt: imageParams.prompt,
      imageBytes: imageParams.imageBytes,
      mimeType: imageParams.mimeType,
      config: {
        aspectRatio: '16:9',
      }
    });
    return fallbackVideoUrl;
  }
}
