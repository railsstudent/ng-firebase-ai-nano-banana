import { SpinnerIconComponent } from '@/shared/icons/spinner-icon.component';
import { ChangeDetectionStrategy, Component, computed, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VisualStoryGenerateArgs } from '../types/visual-story-args.type';

@Component({
  selector: 'app-visual-story-form',
  imports: [
    FormsModule,
    SpinnerIconComponent,
  ],
  templateUrl: './visual-story-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisualStoryFormComponent {
  placeholderText = input('e.g., A detective who can talk to plants.');
  promptArgs = model.required<VisualStoryGenerateArgs>();

  isLoading = input(false);
  numOfImagesList = signal([2,4,6,8]);
  styleList = signal(['consistent', 'evolving']);
  transitionList = signal(['smooth', 'dramatic', 'fade']);
  types = signal(['story', 'process', 'tutorial', 'timeline']);

  isGenerationDisabled = computed(
    () => {
      const prompt = this.promptArgs().userPrompt;
      const isEmptyInput = !prompt || !prompt.trim();
      return this.isLoading() || isEmptyInput;
    }
  );

  generate = output<void>();

  onGenerateClick(): void {
    if (!this.isGenerationDisabled()) {
      this.generate.emit();
    }
  }

  onEnterPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onGenerateClick()
    }
  }
}
