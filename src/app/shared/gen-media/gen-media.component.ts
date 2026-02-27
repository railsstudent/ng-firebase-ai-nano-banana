import { ImagesWithTokenUsage } from '@/ai/types/image-response.type';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { LoaderComponent } from '../loader/loader.component';
import { ImageViewersComponent } from './image-viewers/image-viewers.component';
import { GenMediaService } from './services/gen-media.service';
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

  imagesWithTokenUsage = this.genMediaService.currentFinishedImages;

  error = computed(() =>
    this.genMediaService.imageGenerationError() ||
    this.downloadImageError() ||
    this.genMediaService.videoError()
  );

  isLoading = linkedSignal<ImagesWithTokenUsage, boolean>({
    source: () => this.imagesWithTokenUsage(),
    computation: (({ images }, previous) => {
      if (!previous || !images) {
        return false;
      }

      return images.length === 0;
    })
  });
  destroyRef$ = inject(DestroyRef);

  constructor() {
    toObservable(this.genMediaInput)
      .pipe(
        tap((params) => {
          if (!params) {
            return;
          }

          const { userPrompt, prompts = [], imageFiles = [] } = params;
          const rawPrompts = prompts.length ? prompts : [userPrompt];
          const multiPrompts = rawPrompts.filter((prompt) => !!prompt.trim());
          if (multiPrompts.length) {
            this.isLoading.set(true);
            this.genMediaService.streamImages(multiPrompts, imageFiles)
              .finally(
                () => this.isLoading.set(false)
              );
          }
        }),
        takeUntilDestroyed(this.destroyRef$),
      )
      .subscribe();
  }

  async handleAction({ action, id }: { action: string, id: number }) {
    if (action === 'clearImage') {
      this.genMediaService.clearImage(id);

      if (this.imagesWithTokenUsage().images.length === 0) {
        this.genMediaService.videoUrl.set('');
        this.isLoading.set(false);
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
