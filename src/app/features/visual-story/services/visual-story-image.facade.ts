import { PromptHistoryService } from '@/shared/domain/prompt-history/prompt-history.service';
import { GenMediaInput } from '@/shared/ui/gen-media/types/gen-media-input.type';
import { inject, Injectable, linkedSignal, signal } from '@angular/core';
import { buildStepPrompts } from '@/features/visual-story/utils/visual-story-prompt.util';
import { DEFAULT_VISUAL_STORY_FORM_VALUES } from '@/features/visual-story/visual-story-form/constants/visual-story-form-values.const';
import { VisualStoryForm, VisualStoryStorage } from '@/features/visual-story/visual-story-form/types/visual-story-form.type';

@Injectable({
  providedIn: 'root'
})
export class VisualStoryImageFacade {
  private readonly promptHistoryService = inject(PromptHistoryService);

  readonly key = signal('visual-story');

  readonly visualStoryForm = signal<VisualStoryForm>(DEFAULT_VISUAL_STORY_FORM_VALUES);

  readonly genMediaInput = signal<GenMediaInput>({
    userPrompt: '',
    prompts: undefined,
    imageFiles: [],
    aspectRatio: '',
    resolution: '',
  });

  readonly promptHistory = linkedSignal({
    source: () => this.key(),
    computation: (featureId) => this.promptHistoryService.getHistory(featureId)()
  });

  async generateImages(): Promise<void> {
    const userPrompt = this.visualStoryForm().userPrompt;
    if (!userPrompt || !userPrompt.trim()) {
      return;
    }

    this.savePromptArgs(userPrompt);

    const stepPrompts = buildStepPrompts(this.visualStoryForm());

    this.genMediaInput.update((prev) => ({
      ...prev,
      userPrompt,
      prompts: stepPrompts,
      imageFiles: [],
    }));
  }

  private savePromptArgs(trimmedPrompt: string) {
    this.visualStoryForm.update(args => {
      args.userPrompt = trimmedPrompt;
      return args;
    });

    const { userPrompt, ...args } = this.visualStoryForm();
    const strPrompt = JSON.stringify({ userPrompt, args });
    this.promptHistoryService.addPrompt(this.key(), strPrompt);
  }

  clearHistory(): void {
    this.promptHistoryService.clearHistory(this.key());
  }

  handleVisualStoryArgs(stringifyPromptArgs: string) {
    try {
      const obj = JSON.parse(stringifyPromptArgs) as VisualStoryStorage;
      const { userPrompt, args } = obj;
      const modelValues: VisualStoryForm = {
        userPrompt,
        ...args
      };

      this.visualStoryForm.set(modelValues);
    } catch (e) {
      console.error(e);
      this.visualStoryForm.set(DEFAULT_VISUAL_STORY_FORM_VALUES);
    }
  }
}
