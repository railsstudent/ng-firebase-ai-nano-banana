import { PromptHistoryService } from '@/shared/services/prompt-history.service';
import { Injectable, inject } from '@angular/core';
import { VisualStoryGenerateArgs } from '../types/visual-story-args.type';

const STORY_HISTOTY_ID = 'visual-story';

@Injectable({
  providedIn: 'root'
})
export class VisualStoryHistoryService {
  private readonly promptHistoryService = inject(PromptHistoryService);

  promptHistory = this.promptHistoryService.getHistory(STORY_HISTOTY_ID);

  clearHistory(): void {
    this.promptHistoryService.clearHistory(STORY_HISTOTY_ID);
  }

  addPrompt(args: VisualStoryGenerateArgs) {

  }
}
