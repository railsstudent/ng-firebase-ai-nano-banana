import { rxResource, takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, resource, signal } from '@angular/core';
import { LoaderComponent } from '../loader/loader.component';
import { DEFAULT_IMAGES_TOKEN_USAGE } from './constants/images-token-usage.const';
import { ImageViewersComponent } from './image-viewers/image-viewers.component';
import { GenMediaService } from './services/gen-media.service';
import { GenMediaInput } from './types/gen-media-input.type';
import { VideoPlayerComponent } from './video-player/video-player.component';
import { finalize, takeUntil, tap } from 'rxjs';

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
    [imagesWithTokenUsage]="imagesWithTokenUsage()"
    (handleMediaAction)="handleAction($event)"
  />
  <app-video-player
    [isGeneratingVideo]="isGeneratingVideo()" [videoUrl]="videoUrl()"
  />
}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenMediaComponent {
  private readonly genMediaService = inject(GenMediaService);

  loadingText = input('');
  genMediaInput = input<GenMediaInput>();

  videoUrl = this.genMediaService.videoUrl.asReadonly();
  isGeneratingVideo = this.genMediaService.isGeneratingVideo.asReadonly();

  trimmedUserPrompt = computed(() => this.genMediaInput()?.userPrompt.trim() || '');

  downloadImageError = signal('');

  // imagesResource = resource({
  //   params: () => this.genMediaInput(),
  //   loader: ({ params }) => {
  //     const { userPrompt, prompts = [], imageFiles = [] } = params;
  //     const multiPrompts = prompts.length ? prompts : [userPrompt];
  //     return this.genMediaService.generateImages(multiPrompts, imageFiles);
  //   },
  //   defaultValue: DEFAULT_IMAGES_TOKEN_USAGE,
  // });

  // imagesWithTokenUsage = computed(() => this.imagesResource.hasValue() ? this.imagesResource.value(): DEFAULT_IMAGES_TOKEN_USAGE);

  // #resourceError = computed(() => this.imagesResource.error() ? this.imagesResource.error()?.message : '');

  imagesWithTokenUsage = this.genMediaService.currentFinishedImages;


  error = computed(() =>
    // this.#resourceError() ||
    this.genMediaService.imageGenerationError() ||
    this.downloadImageError() ||
    this.genMediaService.videoError()
  );

  // isLoading = this.imagesResource.isLoading;
  isLoading = signal(false);
  destroyRef$ = inject(DestroyRef);

  constructor() {
    toObservable(this.genMediaInput)
      .pipe(
        tap((params) => {
          if (!params) {
            return;
          }

          this.isLoading.set(true);
          const { userPrompt, prompts = [], imageFiles = [] } = params;
          const multiPrompts = prompts.length ? prompts : [userPrompt];
          this.genMediaService.streamImages(multiPrompts, imageFiles);
        }),
        finalize(() => {
          this.isLoading.set(false);
        }),
        takeUntilDestroyed(this.destroyRef$),
      )
      .subscribe();
  }

  async handleAction({ action, id }: { action: string, id: number }) {
    if (action === 'clearImage') {
      // this.imagesResource.update((items) => {
      //   if (!items) {
      //     return items;
      //   }
      //   const filteredImages = items.images.filter((image) => image.id !== id);
      //   return {
      //     ...items,
      //     images: filteredImages,
      //   };
      // });

      this.genMediaService.clearImage(id);

      if (this.imagesWithTokenUsage().images.length === 0) {
        this.genMediaService.videoUrl.set('');
      }
    } else if (action === 'downloadImage') {
      this.downloadImageById(id);
    } else if (action === 'generateVideo') {
      await this.generateVideoById(id);
    }
  }

  private findImageTokenUsage(id: number) {
    return this.imagesWithTokenUsage()?.images?.find((item) => item?.id === id);
  }

  private downloadImageById(id: number) {
    this.downloadImageError.set('');
    const generatedImage = this.findImageTokenUsage(id);
    if (!generatedImage?.inlineData) {
      this.downloadImageError.set('No image to download.');
      return;
    }
    const filename = this.trimmedUserPrompt() || 'generated_image';
    this.genMediaService.downloadImage(filename, generatedImage?.inlineData);
  }

  private async generateVideoById(id: number) {
    const imageTokenUsage = this.findImageTokenUsage(id);
    if (imageTokenUsage) {
      const { data: imageBytes, mimeType } = imageTokenUsage;
      const imageRequest = {
        prompt: this.trimmedUserPrompt(),
        imageBytes,
        mimeType,
      }
      await this.genMediaService.generateVideo(imageRequest);
    }
  }
}
