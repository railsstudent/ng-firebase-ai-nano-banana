import { computed, inject, Injectable, signal } from '@angular/core';
import { VideoGenerationResponse } from '@/features/ai/types/video.type';
import { GenVideoService } from '@/shared/ui/gen-media/services/gen-video.service';
import { ImageResponse } from '@/features/ai/types/image-response.type';

@Injectable({
  providedIn: 'root'
})
export class VisualStoryVideoFacade {
  private readonly genVideoService = inject(GenVideoService);

  readonly isLoading = signal(false);
  readonly videoResponse = signal<VideoGenerationResponse>({ uri: '', mimeType: '', url: '' });
  readonly error = signal('');
  readonly extendVideoCounter = signal(0);
  readonly loadingText = signal('Interpolating your video...');

  readonly videoUrl = computed(() => this.videoResponse().url || '');

  async generateVideoFromFrames(userPrompt: string, firstImage: ImageResponse | undefined, lastImage: ImageResponse | undefined): Promise<void> {
    try {
      this.isLoading.set(true);
      this.videoResponse.set({ uri: '', url: '', mimeType: '' });
      this.error.set('');

      const hasFirstImage = !!firstImage?.data && !!firstImage?.mimeType;
      const hasLastImage = !!lastImage?.data && !!lastImage?.mimeType;

      if (!hasFirstImage || !hasLastImage) {
         return;
      }

      const result = await this.genVideoService.generateVideoFromFrames({
        prompt: userPrompt,
        imageBytes: firstImage.data!,
        mimeType: firstImage.mimeType!,
        lastFrameImageBytes: lastImage.data!,
        lastFrameMimeType: lastImage.mimeType!,
      });
      this.videoResponse.set(result);
    } catch (e) {
      const strError = e instanceof Error ? e.message : `Error in interpolating video: ${e}`
      this.error.set(strError);
    } finally {
      this.isLoading.set(false);
    }
  }

  async extendInterpolatedVideo(userPrompt: string) {
    try {
      const trimmedUserPrompt = userPrompt.trim();
      if (trimmedUserPrompt) {
        this.error.set('');
        this.isLoading.set(true);
        this.loadingText.set('Extending your video...');
        
        const result = await this.genVideoService.extendInterpolatedVideo(
          trimmedUserPrompt,
          this.extendVideoCounter(),
          this.videoResponse()
        );

        if (result) {
          this.videoResponse.set(result);
          this.extendVideoCounter.update(count => count + 1);
          console.log(`Video extended successfully. Current extension count: ${this.extendVideoCounter()}`);
        }
      }
    } catch (e) {
      const strError = e instanceof Error ? e.message : `Error in extending video: ${e}`
      this.error.set(strError);
    } finally {
      this.isLoading.set(false);
      this.loadingText.set('Interpolating your video...');
    }
  }
}
