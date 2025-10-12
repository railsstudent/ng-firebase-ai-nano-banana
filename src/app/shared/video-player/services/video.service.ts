import { Injectable, inject, signal } from '@angular/core';
import { GeminiService } from '../../../ai/services/gemini.service';
import { GenerateVideoRequest } from '../../../ai/types/generate-video..type';
import { ImageResponse } from '../../../ai/types/image-response.type';

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private readonly geminiService = inject(GeminiService);

  videoError = signal('');
  videoUrl = signal('');
  isGeneratingVideo = signal(false);

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
}
