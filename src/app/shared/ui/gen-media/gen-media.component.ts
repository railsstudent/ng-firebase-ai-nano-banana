import { ImagesWithTokenUsage } from '@/features/ai/types/image-response.type';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { LoaderComponent } from '../loader/loader.component';
import { ImageViewersComponent } from './image-viewers/image-viewers.component';
import { GenMediaService } from './services/gen-media.service';
import { GenVideoService } from './services/gen-video.service';
import { GenMediaInput } from './types/gen-media-input.type';
import { VideoPlayerComponent } from './video-player/video-player.component';

@Component({
  selector: 'app-gen-media',
  imports: [
    LoaderComponent,
    VideoPlayerComponent,
    ImageViewersComponent,
  ],
  templateUrl: './gen-media.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenMediaComponent {
  private readonly genMediaService = inject(GenMediaService);
  private readonly genVideoService = inject(GenVideoService);

  loadingText = input('');
  genMediaInput = input<GenMediaInput>();
  showCurrentStep = input(false);

  videoUrl = this.genVideoService.videoUrl;
  isGeneratingVideo = this.genVideoService.isGeneratingVideo.asReadonly();

  trimmedUserPrompt = computed(() => this.genMediaInput()?.userPrompt?.trim() || '');

  downloadImageError = signal('');

  imagesWithTokenUsage = this.genMediaService.currentFinishedImages;
  currentStep = this.genMediaService.currentStep;

  error = computed(() =>
    this.genMediaService.imageGenerationError() ||
    this.downloadImageError() ||
    this.genVideoService.videoError()
  );

  isLoading = signal(false);
  loadingVideoText = signal('Generating your video...');

  isShowViewerLoader = linkedSignal<{ tokenUsage: ImagesWithTokenUsage, isLoading: boolean }, boolean>({
    source: () => ({ tokenUsage: this.imagesWithTokenUsage(), isLoading: this.isLoading() }),
    computation: (({ tokenUsage, isLoading }) => {
      if (!isLoading) {
        return false;
      }

      return tokenUsage.images && tokenUsage.images.length === 0
    })
  });

  destroyRef$ = inject(DestroyRef);

  constructor() {
    toObservable(this.genMediaInput)
      .pipe(
        tap((params) => {

          const promptsOrTemplateId = this.getPromptsOrTemplateId(params)
          if (!promptsOrTemplateId) {
            return;
          }

          const { imageFiles = [], aspectRatio = '', resolution = '' } = params || {};
          this.isLoading.set(true);
          this.genVideoService.clearVideo();
          if (typeof promptsOrTemplateId === 'string') {
            this.genMediaService.generateFromTemplate({ templateId: promptsOrTemplateId, imageFiles, aspectRatio, resolution })
              .finally(() => this.isLoading.set(false));
          } else {
            this.genMediaService.generateFromPrompts({ prompts: promptsOrTemplateId, imageFiles, aspectRatio, resolution })
              .finally(() => this.isLoading.set(false));
          }
        }),
        takeUntilDestroyed(this.destroyRef$),
      )
      .subscribe();
  }

  private getPromptsOrTemplateId(params: GenMediaInput | undefined): string | string[] | undefined {
    if (!params) {
      return undefined;
    }

    const { userPrompt = '', prompts = [], templateId } = params;
    const rawPrompts = prompts.length ? prompts : [userPrompt];
    const multiPrompts = rawPrompts.filter((prompt) => !!prompt.trim());

    if (multiPrompts.length) {
      return multiPrompts;
    }

    const trimmedTemplateId = templateId?.trim() || '';
    return trimmedTemplateId || undefined;
  }

  async handleAction({ action, id }: { action: string, id: number }) {
    if (action === 'clearImage') {
      this.genMediaService.clearImage(id);

      if (this.imagesWithTokenUsage().images.length === 0) {
        this.genVideoService.clearVideo();
        this.isLoading.set(false);
      }

    } else if (action === 'generateVideo') {
      await this.generateVideoById(id);
    }
  }

  private findImageTokenUsage(id: number) {
    return this.imagesWithTokenUsage()?.images?.find((item) => item?.id === id);
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
      await this.genVideoService.generateVideo(imageRequest);
    }
  }

  async extendVideo() {
    if (this.trimmedUserPrompt()) {
      try {
        this.loadingVideoText.set('Extending your video...');
        await this.genVideoService.extendVideo(this.trimmedUserPrompt());
      } finally {
        this.loadingVideoText.set('Generating your video...');
      }
    }
  }
}
