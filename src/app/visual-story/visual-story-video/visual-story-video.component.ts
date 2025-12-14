import { ImageResponse } from '@/ai/types/image-response.type';
import { VideoResponse } from '@/ai/types/video-response.type';
import { VideoPlayerComponent } from '@/shared/gen-media/video-player/video-player.component';
import { LoaderComponent } from '@/shared/loader/loader.component';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { VisualStoryService } from '../services/visual-story.service';

@Component({
  selector: 'app-visual-story-video',
  imports: [
    LoaderComponent,
    VideoPlayerComponent,
  ],
  template: `
    @if (canGenerateVideoFromFirstLastFrames()) {
      <!--
      <button
        type="button"
        (click)="generateVideoFromFrames()"
        class="px-6 py-3 mr-4 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition duration-200">
          Interpolate video
      </button>
    -->

      @let videoUrl = videoResponse()?.videoUrl;
      @if (isLoading()) {
        <app-loader />
      } @else if (videoUrl) {
        <app-video-player class="block" [videoUrl]="videoUrl" />
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisualStoryVideoComponent {
  private readonly visualStoryService = inject(VisualStoryService);

  images = input<ImageResponse[] | undefined>(undefined);
  userPrompt = input.required<string>();

  isLoading = signal(false);
  videoResponse = signal<VideoResponse | undefined>(undefined);

  firstImage = computed(() => this.images()?.[0]);
  lastImage = computed(() => {
    const numImages = this.images()?.length || 0;
    return numImages < 2 ? undefined : this.images()?.[numImages - 1];
  });

  canGenerateVideoFromFirstLastFrames = computed(() => {
    const hasFirstImage = !!this.firstImage()?.data && !!this.firstImage()?.mimeType;
    const hasLastImage = !!this.lastImage()?.data && !!this.lastImage()?.mimeType;
    // return this.isVeo31Used && hasFirstImage && hasLastImage;
    return false;
  });

  // async generateVideoFromFrames(): Promise<void> {
  //   try {
  //     this.isLoading.set(true);
  //     this.videoResponse.set(undefined);

  //     if (!this.canGenerateVideoFromFirstLastFrames()) {
  //       return;
  //     }

  //     const { data: firstImageData, mimeType: firstImageMimeType } = this.firstImage() || { data: '', mimeType: '' };
  //     const { data: lastImageData, mimeType: lastImageMimeType } = this.lastImage() || { data: '', mimeType: '' };
  //     const result = await this.visualStoryService.interpolateVideo({
  //       prompt: this.userPrompt(),
  //       imageBytes: firstImageData,
  //       mimeType: firstImageMimeType,
  //       lastFrameImageBytes: lastImageData,
  //       lastFrameMimeType: lastImageMimeType,
  //       isVeo31Used: this.isVeo31Used
  //     });
  //     this.videoResponse.set(result);
  //   } finally {
  //     this.isLoading.set(false);
  //   }
  // }
}
