import { ConfigService } from '@/ai/services/config.service';
import { VeoService } from '@/ai/services/veo.service';
import { ExtendVideoRequest, GenerateVideoFromFramesRequest, GenerateVideoRequest, VideoGenerationResponse } from '@/ai/types/video.type';
import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { getValue } from 'firebase/remote-config';

@Injectable({
  providedIn: 'root'
})
export class GenVideoService {
  private readonly veoService = inject(VeoService);
  private readonly configService = inject(ConfigService);

  videoError = signal('');
  videoResponse = signal<VideoGenerationResponse>({ uri: '', url: '', mimeType: '' });
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
    this.videoResponse.set({ uri: '', url: '', mimeType: '' });
    this.#extendVideoCounter.set(0);
  }

  isVideoExtensionAllowed(counter: number) {
    const remoteConfig = this.configService.firebaseObjects?.remoteConfig;
    if (!remoteConfig) {
      console.warn('Remote config does not exist.');
      return false;
    }

    const max_extend_allowed = getValue(remoteConfig,'maxVideoExtendAllowed').asNumber();
    if (counter >= max_extend_allowed) {
      console.warn('Maximum extension limit reached.');
      return false;
    }

    return true;
  }

  async extendVideo(prompt: string): Promise<void> {
    try {
      const result = await this.extendInterpolatedVideo(
        prompt,
        this.#extendVideoCounter(),
        this.videoResponse()
      );

      if (!result) {
        return;
      }

      this.videoResponse.set(result);
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

  async extendInterpolatedVideo(
    prompt: string,
    counter: number,
    customVideo: Pick<VideoGenerationResponse, 'uri' | 'mimeType'>,
    generatingSignal?: WritableSignal<boolean>,
    error?: WritableSignal<string>
  ) {
    const { uri, mimeType } = customVideo;

    if (!mimeType || !uri) {
      console.warn('No video to extend. Please generate a video first.');
      return null;
    }

    if (!prompt) {
      console.warn('Prompt is required to extend the video.');
      return null;
    }

    if (!this.isVideoExtensionAllowed(counter)) {
      return null;
    }

    const actualErrorSignal = error || this.videoError;
    const actualGeneratingSignal = generatingSignal || this.isGeneratingVideo;
    try {
      actualErrorSignal.set('');
      actualGeneratingSignal.set(true);

      const extendVideoParams: ExtendVideoRequest = {
        prompt,
        video: { uri, mimeType },
      }

      return await this.veoService.downloadVideoUriAndUrl(extendVideoParams, 'videos-extendVideo');
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      actualGeneratingSignal.set(false);
    }
  }
}
