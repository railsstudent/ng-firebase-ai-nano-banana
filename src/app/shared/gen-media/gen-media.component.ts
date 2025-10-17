import { ImageResponse } from '@/ai/types/image-response.type';
import { ChangeDetectionStrategy, Component, computed, inject, input, resource, signal } from '@angular/core';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';
import { LoaderComponent } from '../loader/loader.component';
import { GenMediaService } from '../services/gen-media.service';
import { ImageActions } from '../types/actions.type';
import { VideoPlayerComponent } from '../video-player/video-player.component';

@Component({
  selector: 'app-gen-media',
  imports: [
    ImageViewerComponent,
    LoaderComponent,
    VideoPlayerComponent
  ],
  template: `
    @let imageResponses = images();
    @if (isLoading()) {
      <div class="w-full h-48 bg-gray-800 rounded-lg flex flex-col justify-center items-center text-gray-500 border-2 border-dashed border-gray-700">
        <app-loader [loadingText]="loadingText()">
          <ng-content />
        </app-loader>
      </div>
    } @else {
      @if (imageResponses && imageResponses.length > 0) {
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          @for (imageResponse of imageResponses; track imageResponse.id; let i=$index) {
            <app-image-viewer class="block mt-4"
              [url]="imageResponse.inlineData"
              [id]="imageResponse.id"
              (imageAction)="handleAction($event)"
            />
          }
        </div>
      }
      <app-video-player
        [isGeneratingVideo]="isGeneratingVideo()"
        [videoUrl]="videoUrl()"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenMediaComponent {
  private readonly genMediaService = inject(GenMediaService);

  loadingText = input('');
  prompts = input<string[]>([]);
  imageFiles = input<File[]>([]);
  userPrompt = input('');

  videoUrl = this.genMediaService.videoUrl.asReadonly();
  isGeneratingVideo = this.genMediaService.isGeneratingVideo.asReadonly();

  trimmedUserPrompt = computed(() => this.userPrompt()?.trim().length ? this.userPrompt().trim() : '');

  downloadImageError = signal('');

  imagesResource = resource({
    params: () => ({ prompts: this.prompts(), imageFiles: this.imageFiles() }),
    loader: ({ params }) => {
      const { prompts, imageFiles } = params;
      return this.genMediaService.generateImages(prompts, imageFiles);
    },
    defaultValue: [] as ImageResponse[],
  });

  images = computed(() => this.imagesResource.hasValue() ? this.imagesResource.value(): []);
  #resourceError = computed(() => this.imagesResource.error() ? this.imagesResource.error()?.message : '');
  error = computed(() =>
    this.#resourceError() ||
    this.genMediaService.imageGenerationError() ||
    this.downloadImageError()
  );
  isLoading = this.imagesResource.isLoading;

  async handleAction({ action, context }: { action: ImageActions, context?: unknown }) {
    const id = context as number;
    if (action === 'clearImage') {
      this.imagesResource.update((items) => {
        if (!items) {
          return items;
        }
        return items.filter((item) => item.id !== id);
      });

      if (this.images.length === 0) {
        this.genMediaService.videoUrl.set('');
      }
    } else if (action === 'downloadImage') {
      this.downloadImageById(id);
    } else if (action === 'generateVideo') {
      await this.generateVideoById(id);
    }
  }

  private downloadImageById(id: number) {
    this.downloadImageError.set('');
    const generatedImage = this.images()?.find((image) => image.id === id);
      if (!generatedImage?.inlineData) {
        this.downloadImageError.set('No image to download.');
        return;
      }
      this.genMediaService.downloadImage('visual_story', generatedImage?.inlineData);
  }

  private async generateVideoById(id: number) {
    const generatedImage = this.images()?.find((image) => image.id === id);
    if (generatedImage) {
      const { data: imageBytes, mimeType } = generatedImage;
      await this.genMediaService.generateVideo(this.trimmedUserPrompt(), imageBytes, mimeType);
    }
  }
}
