import { IS_VEO31_USED } from '@/ai/constants/gemini.constant';
import { ImageResponse } from '@/ai/types/image-response.type';
import { ChangeDetectionStrategy, Component, computed, inject, input, resource, signal } from '@angular/core';
import { LoaderComponent } from '../loader/loader.component';
import { ImageActions } from '../types/actions.type';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { GenMediaService } from './services/gen-media.service';
import { GenMediaInput } from './types/gen-media-input.type';
import { VideoPlayerComponent } from './video-player/video-player.component';

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
        @let responsiveLayout = (imageResponses && imageResponses.length === 1) ?
          'flex justify-center items-center' :
          'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4';
        <div [class]="responsiveLayout">
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
  private readonly isVeo31Used = inject(IS_VEO31_USED);

  loadingText = input('');
  genMediaInput = input<GenMediaInput>();

  videoUrl = this.genMediaService.videoUrl.asReadonly();
  isGeneratingVideo = this.genMediaService.isGeneratingVideo.asReadonly();

  trimmedUserPrompt = computed(() => this.genMediaInput()?.userPrompt.trim() || '');

  downloadImageError = signal('');

  imagesResource = resource({
    params: () => this.genMediaInput(),
    loader: ({ params }) => {
      const { userPrompt, prompts = [], imageFiles = [] } = params;
      const multiPrompts = prompts.length ? prompts : [userPrompt];
      return this.genMediaService.generateImages(multiPrompts, imageFiles);
    },
    defaultValue: [] as ImageResponse[],
  });

  images = computed(() => this.imagesResource.hasValue() ? this.imagesResource.value(): []);
  #resourceError = computed(() => this.imagesResource.error() ? this.imagesResource.error()?.message : '');
  error = computed(() =>
    this.#resourceError() ||
    this.genMediaService.imageGenerationError() ||
    this.downloadImageError() ||
    this.genMediaService.videoError()
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
      const filename = this.trimmedUserPrompt() || 'generated_image';
      this.genMediaService.downloadImage(filename, generatedImage?.inlineData);
  }

  private async generateVideoById(id: number) {
    const generatedImage = this.images()?.find((image) => image.id === id);
    if (generatedImage) {
      const { data: imageBytes, mimeType } = generatedImage;
      const imageRequest = {
        prompt: this.trimmedUserPrompt(),
        imageBytes,
        mimeType,
        isVeo31Used: this.isVeo31Used
      }
      await this.genMediaService.generateVideo(imageRequest);
    }
  }
}
