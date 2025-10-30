import { IS_VEO31_USED } from '@/ai/constants/gemini.constant';
import { VideoPlayerComponent } from '@/shared/gen-media/video-player/video-player.component';
import { LoaderComponent } from '@/shared/loader/loader.component';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { VisualStoryService } from '../services/visual-story.service';
import { ImageResponse } from '@/ai/types/image-response.type';

@Component({
  selector: 'app-visual-story-video',
  imports: [
    LoaderComponent,
    VideoPlayerComponent,
  ],
  template: `
    @if (canGenerateVideoFromFirstLastFrames()) {
      <button
        type="button"
        (click)="generateVideoFromFrames()"
        class="px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition duration-200">
          First and last frames to video
      </button>

      @if (isLoading()) {
        <app-loader />
      } @else if (videoUrl()) {
        <app-video-player class="block" [videoUrl]="videoUrl()" />
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisualStoryVideoComponent {
  private readonly visualStoryService = inject(VisualStoryService);
  private readonly isVeo31Used = inject(IS_VEO31_USED);

  firstImage = input<ImageResponse | undefined>(undefined);
  lastImage = input<ImageResponse | undefined>(undefined);
  userPrompt = input.required<string>();

  isLoading = signal(false);
  videoUrl = signal('');

  hasFirstImage = computed(() => !!this.firstImage()?.data && !!this.firstImage()?.mimeType);
  hasLastImage = computed(() => !!this.lastImage()?.data && !!this.lastImage()?.mimeType);
  canGenerateVideoFromFirstLastFrames = computed(() =>
    this.isVeo31Used && this.hasFirstImage() && this.hasLastImage()
  );

  async generateVideoFromFrames(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.videoUrl.set('');

      if (!this.canGenerateVideoFromFirstLastFrames()) {
        return;
      }

      const { data: firstImageData, mimeType: firstImageMimeType } = this.firstImage() || { data: '', mimeType: '' };
      const { data: lastImageData, mimeType: lastImageMimeType } = this.lastImage() || { data: '', mimeType: '' };
      const url = await this.visualStoryService.generateVideoFromFrames({
        prompt: this.userPrompt(),
        imageBytes: firstImageData,
        mimeType: firstImageMimeType,
        lastFrameImageBytes: lastImageData,
        lastFrameMimeType: lastImageMimeType,
        isVeo31Used: this.isVeo31Used
      });
      this.videoUrl.set(url);
    } finally {
      this.isLoading.set(false);
    }
  }
}
