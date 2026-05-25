import { Injectable, Signal, inject, linkedSignal } from '@angular/core';
import { PromptHistoryService } from '@/shared/services/prompt-history.service';

@Injectable({
  providedIn: 'root'
})
export class EditorService {
  private readonly promptHistoryService = inject(PromptHistoryService);

  getPromptHistory(featureId: Signal<string>) {
    return linkedSignal({
      source: () => featureId(),
      computation: (featureId) => this.promptHistoryService.getHistory(featureId)()
    });
  }

  addPrompt(featureId: string, prompt: string) {
    this.promptHistoryService.addPrompt(featureId, prompt);
  }

  clearHistory(featureId: string): void {
    this.promptHistoryService.clearHistory(featureId);
  }
}
