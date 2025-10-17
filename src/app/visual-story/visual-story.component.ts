import { ImageResponse } from '@/ai/types/image-response.type';
import { FeatureService } from '@/feature/services/feature.service';
import { CardHeaderComponent } from '@/shared/card/card-header/card-header.component';
import { CardComponent } from '@/shared/card/card.component';
import { ErrorDisplayComponent } from '@/shared/error-display/error-display.component';
import { GenMediaComponent } from '@/shared/gen-media/gen-media.component';
import { PromptHistoryComponent } from '@/shared/prompt-history/prompt-history.component';
import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { VisualStoryHistoryService } from './services/visual-story-history.service';
import { VisualStoryService } from './services/visual-story.service';
import { VisualStoryGenerateArgs } from './types/visual-story-args.type';
import VisualStoryFormComponent from './visual-story-form/visual-story-form.component';

const DEFAULT_PROMPT_ARGS: VisualStoryGenerateArgs = {
  userPrompt: 'A detective who can talk to plants.',
  args: {
    style: 'consistent',
    transition: 'smooth',
    numberOfImages: 2,
    type: 'story'
  }
}

@Component({
  selector: 'app-visual-story',
  imports: [
    CardComponent,
    CardHeaderComponent,
    ErrorDisplayComponent,
    VisualStoryFormComponent,
    PromptHistoryComponent,
    GenMediaComponent,
  ],
  templateUrl: './visual-story.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisualStoryComponent {
  private readonly visualStoryService = inject(VisualStoryService);
  private readonly visualStoryHistoryService = inject(VisualStoryHistoryService);
  private readonly featureService = inject(FeatureService);

  feature = this.featureService.getFeatureDetails('visual-story');

  promptArgs = signal<VisualStoryGenerateArgs>(DEFAULT_PROMPT_ARGS);

  genmedia = viewChild<GenMediaComponent>('genmedia');
  isLoading = computed(() =>this.genmedia()?.isLoading() || false);
  error = computed(() => this.genmedia()?.error() || '');

  images = signal<ImageResponse[] | undefined>(undefined);

  key = signal('visual-story');
  prompts = signal<string[]>([]);

  promptHistory = this.visualStoryHistoryService.getPromptHistory(this.key);

  async handleGenerate(): Promise<void> {
    const userPrompt = this.promptArgs().userPrompt;
    if (!userPrompt && !userPrompt.trim()) {
      return;
    }

    this.savePromptArgs(userPrompt);

    const stepPrompts = await this.visualStoryService.buildStepPrompts(
      this.promptArgs()
    );

    this.prompts.set(stepPrompts);
  }

  private savePromptArgs(trimmedPrompt: string) {
    this.promptArgs.update(args => {
      args.userPrompt = trimmedPrompt;
      return args;
    });

    this.visualStoryHistoryService.addPrompt(this.key(), this.promptArgs());
  }

  onClearHistory(): void {
    this.visualStoryHistoryService.clearHistory(this.key());
  }

  handleVisualStoryArgs(stringifyPromptArgs: string) {
    try {
      this.promptArgs.set(JSON.parse(stringifyPromptArgs));
    } catch (e) {
      console.error(e);
      this.promptArgs.set(DEFAULT_PROMPT_ARGS);
    }
  }
}
