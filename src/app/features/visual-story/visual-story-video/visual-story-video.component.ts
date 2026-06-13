import { ImageResponse } from '@/features/ai/types/image-response.type';
import { ErrorDisplayComponent } from '@/shared/ui/error-display/error-display.component';
import { VideoPlayerComponent } from '@/shared/ui/gen-media/video-player/video-player.component';
import { LoaderComponent } from '@/shared/ui/loader/loader.component';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { VisualStoryVideoFacade } from '../services/visual-story-video.facade';

@Component({
  selector: 'app-visual-story-video',
  imports: [
    ErrorDisplayComponent,
    LoaderComponent,
    VideoPlayerComponent,
  ],
  template: `
    @if (canGenerateVideoFromFirstLastFrames()) {
      <button
        type="button"
        (click)="generateVideoFromFrames()"
        class="px-6 py-3 mr-4 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition duration-200">
          Interpolate video
      </button>

      <app-error-display [error]="error()" />
      @if (isLoading()) {
        <app-loader [loadingText]="loadingText()" />
      } @else if (videoUrl(); as videoUrl) {
        <app-video-player class="block" [videoUrl]="videoUrl"
          (extendVideo)="extendInterpolatedVideo()"
        />
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisualStoryVideoComponent {
  readonly videoFacade = inject(VisualStoryVideoFacade);

  images = input<ImageResponse[] | undefined>(undefined);
  userPrompt = input.required<string>();

  error = this.videoFacade.error;
  isLoading = this.videoFacade.isLoading;
  videoUrl = this.videoFacade.videoUrl;
  loadingText = this.videoFacade.loadingText;

  firstImage = computed(() => this.images()?.[0]);
  lastImage = computed(() => {
    const numImages = this.images()?.length || 0;
    return numImages < 2 ? undefined : this.images()?.[numImages - 1];
  });

  canGenerateVideoFromFirstLastFrames = computed(() => {
    const firstImg = this.firstImage();
    const lastImg = this.lastImage();
    const hasFirstImage = !!firstImg?.data && !!firstImg?.mimeType;
    const hasLastImage = !!lastImg?.data && !!lastImg?.mimeType;
    return hasFirstImage && hasLastImage;
  });

  generateVideoFromFrames() {
    const params = {
      userPrompt: this.userPrompt(),
      firstImage: this.firstImage(),
      lastImage: this.lastImage(),
    }
    this.videoFacade.generateVideoFromFrames(params);
  }

  extendInterpolatedVideo() {
    this.videoFacade.extendInterpolatedVideo(this.userPrompt());
  }
}
