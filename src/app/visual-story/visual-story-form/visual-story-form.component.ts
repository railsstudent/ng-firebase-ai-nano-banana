import { SpinnerIconComponent } from '@/shared/icons/spinner-icon.component';
import { ChangeDetectionStrategy, Component, computed, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VisualStoryArgs, VisualStoryGenerateArgs } from '../types/visual-story-args.type';

@Component({
  selector: 'app-visual-story-form',
  imports: [
    FormsModule,
    SpinnerIconComponent,
  ],
  templateUrl: './visual-story-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisualStoryFormComponent {
  userPrompt = signal('A detective who can talk to plants.');
  placeholderText = input('e.g., A detective who can talk to plants.');
  generationArgs = model<VisualStoryArgs>({
    style: 'consistent',
    transition: 'smooth',
    numberOfImages: 2,
    type: 'story'
  });

  isLoading = input(false);
  numOfImagesList = signal([2,4,6,8]);
  styleList = signal(['consistent', 'evolving']);
  transitionList = signal(['smooth', 'dramatic', 'fade']);
  types = signal(['story', 'process', 'tutorial', 'timeline']);

  isGenerationDisabled = computed(
    () => {
      const isEmptyInput = !this.userPrompt() || this.userPrompt().trim().length <= 0;
      return this.isLoading() || isEmptyInput;
    }
  );

  promptArgs = signal<VisualStoryArgs>({
    style: 'consistent',
    transition: 'smooth',
    numberOfImages: 2,
    type: 'story'
  });

  generate = output<VisualStoryGenerateArgs>();

  onGenerateClick(): void {
    if (!this.isGenerationDisabled()) {
      this.generate.emit({
        args: this.promptArgs(),
        userPrompt: this.userPrompt()
      });
    }
  }

  onEnterPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onGenerateClick()
    }
  }
}
