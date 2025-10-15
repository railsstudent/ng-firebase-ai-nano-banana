import { PromptHistoryService } from '@/shared/services/prompt-history.service';
import { Injectable, Signal, inject, linkedSignal } from '@angular/core';
import { VisualStoryGenerateArgs } from '../types/visual-story-args.type';

const STORY_HISTOTY_ID = 'visual-story';

@Injectable({
  providedIn: 'root'
})
export class VisualStoryHistoryService {
  private readonly promptHistoryService = inject(PromptHistoryService);

  getPromptHistory(key: Signal<string>) {
    return linkedSignal({
      source: () => key(),
      computation: (featureId) => this.promptHistoryService.getHistory(featureId)()
    });
  }

  clearHistory(key: string): void {
    this.promptHistoryService.clearHistory(key);
  }

  addPrompt(key: string, args: VisualStoryGenerateArgs) {
    const strPrompt = JSON.stringify(args);
    this.promptHistoryService.addPrompt(key, strPrompt);
  }
}
