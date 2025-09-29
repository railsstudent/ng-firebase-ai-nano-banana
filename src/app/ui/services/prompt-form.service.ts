import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PromptFormService {
  prompt = signal('A dog that is eating a bone.');
  error = signal('');
  isLoading = signal(false);

  isGenerationDisabled = computed(() => {
    const isEmptyInput = !this.prompt() || this.prompt().trim().length <= 0;
    return this.isLoading() || isEmptyInput;
  });
}
