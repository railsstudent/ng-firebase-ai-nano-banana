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
    try {
      this.videoError.set('');
      this.isGeneratingVideo.set(true);
      const isVeo31Used = imageParams.isVeo31Used || false;
      const videoUrl = isVeo31Used ? await this.geminiService.generateVideo({
        ...imageParams,
        config: {
          aspectRatio: '16:9',
          resolution: "720p"
        }
      }) : await this.getFallbackVideoUrl(imageParams);
      this.videoUrl.set(videoUrl);
    } catch (e) {
      console.error(e);
      const errMsg = e instanceof Error ?
        e.message :
        'An unexpected error occurred in video generation using the first and last frames.'
      this.videoError.set(errMsg);
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
    const isVeo31Used = imageParams.isVeo31Used || false;
    try {
      return isVeo31Used ? await this.geminiService.generateVideo({
          ...imageParams,
          config: {
            aspectRatio: '16:9',
            resolution: "720p",
            lastFrame: {
              imageBytes: imageParams.lastFrameImageBytes,
              mimeType: imageParams.lastFrameMimeType
            }
          }
        }) : await this.getFallbackVideoUrl(imageParams);
    } catch (e) {
      throw e instanceof Error ?
        e :
        new Error('An unexpected error occurred in video generation using the first and last frames.');
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
