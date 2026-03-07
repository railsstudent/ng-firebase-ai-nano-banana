import { FeatureService } from '@/feature/services/feature.service';
import { CardHeaderComponent } from '@/shared/card/card-header/card-header.component';
import { CardComponent } from '@/shared/card/card.component';
import { ErrorDisplayComponent } from '@/shared/error-display/error-display.component';
import { GenMediaComponent } from '@/shared/gen-media/gen-media.component';
import { GenMediaInput } from '@/shared/gen-media/types/gen-media-input.type';
import { PromptHistoryComponent } from '@/shared/prompt-history/prompt-history.component';
import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { VisualStoryService } from './services/visual-story.service';
import { DEFAULT_VISUAL_STORY_FORM_VALUES } from './visual-story-form/constants/visual-story-form-values.const';
import { VisualStoryForm, VisualStoryStorage } from './visual-story-form/types/visual-story-form.type';
import { VisualStoryFormComponent } from './visual-story-form/visual-story-form.component';
import VisualStoryVideoComponent from './visual-story-video/visual-story-video.component';

@Component({
  selector: 'app-visual-story',
  imports: [
    CardComponent,
    CardHeaderComponent,
    ErrorDisplayComponent,
    VisualStoryFormComponent,
    PromptHistoryComponent,
    GenMediaComponent,
    VisualStoryVideoComponent,
  ],
  templateUrl: './visual-story.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisualStoryComponent {
  private readonly visualStoryService = inject(VisualStoryService);
  private readonly featureService = inject(FeatureService);

  feature = this.featureService.getFeatureDetails('visual-story');

  visualStoryModel = signal<VisualStoryForm>(DEFAULT_VISUAL_STORY_FORM_VALUES);

  key = signal('visual-story');
  genMediaInput = signal<GenMediaInput>({
    userPrompt: '',
    prompts: undefined,
    imageFiles: [],
  });

  genmedia = viewChild<GenMediaComponent>('genmedia');
  images = computed(() => this.genmedia()?.imagesWithTokenUsage().images.map((item) => item));

  isLoading = computed(() =>this.genmedia()?.isLoading() || false);
  error = computed(() => this.genmedia()?.error() || '');

  promptHistory = this.visualStoryService.getPromptHistory(this.key);

  numImages = computed(() => this.images()?.length || 0);

  async handleGenerate(): Promise<void> {
    const userPrompt = this.visualStoryModel().userPrompt;
    if (!userPrompt && !userPrompt.trim()) {
      return;
    }

    this.savePromptArgs(userPrompt);

    const stepPrompts = await this.visualStoryService.buildStepPrompts(
      this.visualStoryModel()
    );

    this.genMediaInput.set({
      userPrompt,
      prompts: stepPrompts,
      imageFiles: [],
    });
  }

  private savePromptArgs(trimmedPrompt: string) {
    this.visualStoryModel.update(args => {
      args.userPrompt = trimmedPrompt;
      return args;
    });

    this.visualStoryService.addPrompt(this.key(), this.visualStoryModel());
  }

  onClearHistory(): void {
    this.visualStoryService.clearHistory(this.key());
  }

  handleVisualStoryArgs(stringifyPromptArgs: string) {
    try {
      const obj = JSON.parse(stringifyPromptArgs) as VisualStoryStorage;
      const { userPrompt, args } = obj;
      const modelValues: VisualStoryForm = {
        userPrompt,
        ...args
      };

      this.visualStoryModel.set(modelValues);
    } catch (e) {
      console.error(e);
      this.visualStoryModel.set(DEFAULT_VISUAL_STORY_FORM_VALUES);
    }
  }
}
