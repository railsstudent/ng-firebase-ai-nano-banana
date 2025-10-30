import { IS_VEO31_USED } from '@/ai/constants/gemini.constant';
import { ImageResponse } from '@/ai/types/image-response.type';
import { FeatureService } from '@/feature/services/feature.service';
import { CardHeaderComponent } from '@/shared/card/card-header/card-header.component';
import { CardComponent } from '@/shared/card/card.component';
import { ErrorDisplayComponent } from '@/shared/error-display/error-display.component';
import { GenMediaComponent } from '@/shared/gen-media/gen-media.component';
import { GenMediaInput } from '@/shared/gen-media/types/gen-media-input.type';
import { VideoPlayerComponent } from '@/shared/gen-media/video-player/video-player.component';
import { LoaderComponent } from '@/shared/loader/loader.component';
import { PromptHistoryComponent } from '@/shared/prompt-history/prompt-history.component';
import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { DEFAULT_PROMPT_ARGS } from './constants/default_prompt_args.const';
import { VisualStoryService } from './services/visual-story.service';
import { VisualStoryGenerateArgs } from './types/visual-story-args.type';
import { VisualStoryFormComponent } from './visual-story-form/visual-story-form.component';

@Component({
  selector: 'app-visual-story',
  imports: [
    CardComponent,
    CardHeaderComponent,
    ErrorDisplayComponent,
    VisualStoryFormComponent,
    PromptHistoryComponent,
    GenMediaComponent,
    LoaderComponent,
    VideoPlayerComponent,
  ],
  templateUrl: './visual-story.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisualStoryComponent {
  private readonly visualStoryService = inject(VisualStoryService);
  private readonly featureService = inject(FeatureService);
  private readonly isVeo31Used = inject(IS_VEO31_USED);

  feature = this.featureService.getFeatureDetails('visual-story');

  promptArgs = signal<VisualStoryGenerateArgs>(DEFAULT_PROMPT_ARGS);
  images = signal<ImageResponse[] | undefined>(undefined);
  key = signal('visual-story');
  genMediaInput = signal<GenMediaInput>({
    userPrompt: '',
    prompts: undefined,
    imageFiles: [],
  });

  genmedia = viewChild<GenMediaComponent>('genmedia');
  isLoading = computed(() =>this.genmedia()?.isLoading() || false);
  error = computed(() => this.genmedia()?.error() || '');

  promptHistory = this.visualStoryService.getPromptHistory(this.key);

  numImages = computed(() => this.genmedia()?.images()?.length || 0);

  canGenerateVideoFromFirstLastFrames = computed(() =>
    this.isVeo31Used && this.numImages() >= 2
  );

  async handleGenerate(): Promise<void> {
    const userPrompt = this.promptArgs().userPrompt;
    if (!userPrompt && !userPrompt.trim()) {
      return;
    }

    this.savePromptArgs(userPrompt);

    const stepPrompts = await this.visualStoryService.buildStepPrompts(
      this.promptArgs()
    );

    this.genMediaInput.set({
      userPrompt,
      prompts: stepPrompts,
      imageFiles: [],
    });
  }

  private savePromptArgs(trimmedPrompt: string) {
    this.promptArgs.update(args => {
      args.userPrompt = trimmedPrompt;
      return args;
    });

    this.visualStoryService.addPrompt(this.key(), this.promptArgs());
  }

  onClearHistory(): void {
    this.visualStoryService.clearHistory(this.key());
  }

  handleVisualStoryArgs(stringifyPromptArgs: string) {
    try {
      this.promptArgs.set(JSON.parse(stringifyPromptArgs));
    } catch (e) {
      console.error(e);
      this.promptArgs.set(DEFAULT_PROMPT_ARGS);
    }
  }

  isLoadingFromFrames = signal(false);
  videoUrlFromFrames = signal('');
  async generateVideoFromFrames(): Promise<void> {
    try {
      this.isLoadingFromFrames.set(true);
      this.videoUrlFromFrames.set('');

      if (this.numImages() < 2) {
        return;
      }

      const firstImage = this.genmedia()?.images()?.[0];
      const lastImage = this.genmedia()?.images()?.[this.numImages() - 1];
      const url = await this.visualStoryService.generateVideoFromFrames({
        prompt: this.promptArgs().userPrompt,
        imageBytes: firstImage?.data || '',
        mimeType: firstImage?.mimeType || '',
        lastFrameImageBytes: lastImage?.data || '',
        lastFrameMimeType: lastImage?.mimeType || '',
        isVeo31Used: this.isVeo31Used
      });
      this.videoUrlFromFrames.set(url);
    } finally {
      this.isLoadingFromFrames.set(false);
    }
  }
}
