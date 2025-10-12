import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { GeminiService } from '../../../ai/services/gemini.service';
import { GenerateVideoRequest } from '../../../ai/types/generate-video..type';
import { ImageResponse } from '../../../ai/types/image-response.type';

@Injectable({
  providedIn: 'root'
})
export class ImageViewerService {
  private readonly document = inject(DOCUMENT);
  private readonly geminiService = inject(GeminiService);

  videoError = signal('');
  videoUrl = signal('');
  isGeneratingVideo = signal(false);

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


  async generateVideo(prompt: string, imageResponse: ImageResponse): Promise<void> {
    try {
      const request: GenerateVideoRequest = {
        imageBytes: imageResponse.data,
        mimeType: imageResponse.mimeType,
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
}
