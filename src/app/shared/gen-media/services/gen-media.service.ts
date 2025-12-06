import { FirebaseService } from '@/ai/services/firebase.service';
import { GeminiService } from '@/ai/services/gemini.service';
import { ImagesWithTokenUsage, ImageTokenUsage } from '@/ai/types/image-response.type';
import { DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { DEFAULT_IMAGES_TOKEN_USAGE } from '../constants/images-token-usage.const';

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

  // async generateVideo(imageParams: GenerateVideoRequestImageParams): Promise<void> {
  //   try {
  //     this.videoError.set('');
  //     this.isGeneratingVideo.set(true);

  //     const isVeo31Used = imageParams.isVeo31Used || false;

  //     const loadVideoPromise = isVeo31Used ?
  //       this.geminiService.generateVideo({
  //         ...imageParams,
  //         config: {
  //           aspectRatio: '16:9',
  //           resolution: "720p"
  //         }
  //       }) :
  //       this.getFallbackVideoUrl(imageParams);

  //     const videoUrl = (await loadVideoPromise).videoUrl;
  //     this.videoUrl.set(videoUrl);
  //   } catch (e) {
  //     console.error(e);
  //     const errMsg = e instanceof Error ?
  //       e.message :
  //       'An unexpected error occurred in video generation using the first and last frames.'
  //     this.videoError.set(errMsg);
  //   } finally {
  //     this.isGeneratingVideo.set(false);
  //   }
  // }

  private async generateImage(prompt: string, imageFiles: File[]): Promise<ImageTokenUsage | undefined> {
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

  async generateImages(prompts: string[], imageFiles: File[]): Promise<ImagesWithTokenUsage> {
    if (!prompts?.length) {
      return DEFAULT_IMAGES_TOKEN_USAGE
    }

    let isFirstError = false;
    const imageTokenUsages: ImageTokenUsage[] = [];
    this.imageGenerationError.set('');
    this.videoUrl.set('');

    for (let i = 0; i < prompts.length; i=i+1) {
      try {
        const imageTokenUsage = await this.generateImage(prompts[i], imageFiles);
        if (imageTokenUsage) {
          imageTokenUsages.push(imageTokenUsage);
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

    return imageTokenUsages.reduce((acc, { image, ...rest }, index) => {
      const { tokenUsage, metadata, thinkingSummary } = rest;
      return {
        images: acc.images.concat({
          ...image,
          id: index
        }),
        tokenUsage: {
          outputTokenCount: acc.tokenUsage.outputTokenCount + tokenUsage.outputTokenCount,
          promptTokenCount: acc.tokenUsage.promptTokenCount + tokenUsage.promptTokenCount,
          thoughtTokenCount: acc.tokenUsage.thoughtTokenCount + tokenUsage.thoughtTokenCount,
          totalTokenCount: acc.tokenUsage.totalTokenCount + tokenUsage.totalTokenCount,
        },
        groundingMetadata: {
          searchQueries: acc.groundingMetadata.searchQueries.concat(metadata.searchQueries),
          citations: acc.groundingMetadata.citations.concat(metadata.citations),
          renderedContents: metadata.renderedContent ? acc.groundingMetadata.renderedContents.concat(metadata.renderedContent) : acc.groundingMetadata.renderedContents,
        },
        thinkingSummaries: acc.thinkingSummaries.concat(thinkingSummary),
      };
    }, DEFAULT_IMAGES_TOKEN_USAGE)
  }

  // async generateVideoFromFrames(imageParams: GenerateVideoFromFramesRequest): Promise<VideoResponse> {
  //   const isVeo31Used = imageParams.isVeo31Used || false;
  //   try {
  //     const loadVideoPromise = isVeo31Used ?
  //       this.geminiService.generateVideo({
  //         ...imageParams,
  //         config: {
  //           aspectRatio: '16:9',
  //           resolution: "720p",
  //           lastFrame: {
  //             imageBytes: imageParams.lastFrameImageBytes,
  //             mimeType: imageParams.lastFrameMimeType
  //           }
  //         }
  //     }) :
  //       this.getFallbackVideoUrl(imageParams);

  //     return await loadVideoPromise;
  //   } catch (e) {
  //     throw e instanceof Error ?
  //       e :
  //       new Error('An unexpected error occurred in video generation using the first and last frames.');
  //   }
  // }

  // private async getFallbackVideoUrl(imageParams: GenerateVideoRequestImageParams): Promise<VideoResponse> {
  //   return this.geminiService.generateVideo({
  //     prompt: imageParams.prompt,
  //     imageBytes: imageParams.imageBytes,
  //     mimeType: imageParams.mimeType,
  //     config: {
  //       aspectRatio: '16:9',
  //     }
  //   });
  // }
}
