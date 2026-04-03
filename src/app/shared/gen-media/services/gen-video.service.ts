import { VeoService } from '@/ai/services/veo.service';
import { ExtendVideoRequest, GenerateVideoFromFramesRequest, GenerateVideoRequest, VideoGenerationResponse } from '@/ai/types/video.type';
import { computed, inject, Injectable, signal } from '@angular/core';

const MAXIMUM_EXTEND_ALLOWED = 5;

@Injectable({
  providedIn: 'root'
})
export class GenVideoService {
  private readonly veoService = inject(VeoService);

  videoError = signal('');
  videoResponse = signal<VideoGenerationResponse>({ gcsUri: '', url: '' });
  #extendVideoCounter = signal(0);
  isGeneratingVideo = signal(false);

  videoUrl = computed(() => this.videoResponse().url);

  async generateVideoFromFrames(request: GenerateVideoFromFramesRequest): Promise<VideoGenerationResponse> {
    return this.veoService.downloadVideoUriAndUrl(request, 'videos-interpolateVideo');
  }

  async generateVideo(imageParams: GenerateVideoRequest): Promise<void> {
      try {
        this.videoError.set('');
        this.isGeneratingVideo.set(true);

        const videoResponse = await this.veoService.downloadVideoUriAndUrl(imageParams);
        this.videoResponse.set(videoResponse);
        this.#extendVideoCounter.set(0);
      } catch (e) {
        console.error(e);
        const errMsg = e instanceof Error ?
          e.message :
          'An unexpected error occurred in video generation.'
        this.videoError.set(errMsg);
      } finally {
        this.isGeneratingVideo.set(false);
      }
  }

  clearVideo() {
    this.videoResponse.set({ gcsUri: '', url: '' });
    this.#extendVideoCounter.set(0);
  }

  async extendVideo(request: ExtendVideoRequest) {
    if (!this.videoUrl()) {
      console.warn('No video to extend. Please generate a video first.');
      return;
    }

    if (this.#extendVideoCounter() >= MAXIMUM_EXTEND_ALLOWED) {
      console.warn('Maximum extension limit reached.');
      return;
    }

    try {
      this.videoError.set('');
      this.isGeneratingVideo.set(true);

      const extendVideoParams: ExtendVideoRequest = {
        prompt: request.prompt,
        video: { uri: this.videoResponse().gcsUri },
      }

      const videoResponse = await this.veoService.downloadVideoUriAndUrl(extendVideoParams);
      this.videoResponse.set(videoResponse);
      this.#extendVideoCounter.update(count => count + 1);
      console.log(`Video extended successfully. Current extension count: ${this.#extendVideoCounter()}`);
    } catch (e) {
      console.error(e);
      const errMsg = e instanceof Error ?
        e.message :
        'An unexpected error occurred in video generation.'
      this.videoError.set(errMsg);
    } finally {
      this.isGeneratingVideo.set(false);
    }
  }
}
