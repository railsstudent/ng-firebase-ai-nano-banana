import { IS_VEO31_USED } from '@/ai/constants/gemini.constant';
import { ImageTokenUsage } from '@/ai/types/image-response.type';
import { TokenUsage } from '@/ai/types/token-usage.type';
import { ChangeDetectionStrategy, Component, computed, inject, input, resource, signal } from '@angular/core';
import { LoaderComponent } from '../loader/loader.component';
import { ImageViewersComponent } from './image-viewers/image-viewers.component';
import { GenMediaService } from './services/gen-media.service';
import { TokenUsageService } from './services/token-usage.service';
import { GenMediaInput } from './types/gen-media-input.type';
import { VideoPlayerComponent } from './video-player/video-player.component';

@Component({
  selector: 'app-gen-media',
  imports: [
    LoaderComponent,
    VideoPlayerComponent,
    ImageViewersComponent,
  ],
  template: `
@if (isLoading()) {
  <div class="w-full h-48 bg-gray-800 rounded-lg flex flex-col justify-center items-center text-gray-500 border-2 border-dashed border-gray-700">
    <app-loader [loadingText]="loadingText()">
      <ng-content />
    </app-loader>
  </div>
} @else {
  <app-image-viewers
    [images]="images()" [totalTokenUsage]="totalTokenUsage()" (handleMediaAction)="handleAction($event)"
  />
  <app-video-player
    [isGeneratingVideo]="isGeneratingVideo()" [videoUrl]="videoUrl()"
  />
}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenMediaComponent {
  private readonly genMediaService = inject(GenMediaService);
  private readonly tokenUsageService = inject(TokenUsageService);
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
    defaultValue: [] as ImageTokenUsage[],
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

  totalTokenUsage = computed<TokenUsage | undefined>(() => {
    const imageTokenUsages = this.images();
    return this.tokenUsageService.calculateTokenUage(imageTokenUsages);
  });

  async handleAction({ action, id }: { action: string, id: number }) {
    if (action === 'clearImage') {
      this.imagesResource.update((items) => {
        if (!items) {
          return items;
        }
        return items.filter((item) => item.image.id !== id);
      });

      if (this.images.length === 0) {
        this.genMediaService.videoUrl.set('');
      }
    } else if (action === 'downloadImage') {
      this.downloadImageById(id);
    } else if (action === 'generateVideo') {
      // await this.generateVideoById(id);
    }
  }

  private findImageTokenUsage(id: number) {
    return this.images()?.find((item) => item?.image?.id === id);
  }

  private downloadImageById(id: number) {
    this.downloadImageError.set('');
    const generatedImage = this.findImageTokenUsage(id)?.image;
    if (!generatedImage?.inlineData) {
      this.downloadImageError.set('No image to download.');
      return;
    }
    const filename = this.trimmedUserPrompt() || 'generated_image';
    this.genMediaService.downloadImage(filename, generatedImage?.inlineData);
  }

  // private async generateVideoById(id: number) {
  //   const imageTokenUsage = this.findImageTokenUsage(id);
  //   if (imageTokenUsage) {
  //     const { image } = imageTokenUsage;
  //     const { data: imageBytes, mimeType } = image;
  //     const imageRequest = {
  //       prompt: this.trimmedUserPrompt(),
  //       imageBytes,
  //       mimeType,
  //       isVeo31Used: this.isVeo31Used
  //     }
  //     await this.genMediaService.generateVideo(imageRequest);
  //   }
  // }
}
