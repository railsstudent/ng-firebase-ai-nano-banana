import { SpinnerIconComponent } from '@/shared/icons/spinner-icon.component';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VisualStoryArgs } from '../types/visual-story-args.type';

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

  fullPrompt = computed(() => {
    let prompt = `Create a ${this.promptArgs().numberOfImages} part ${this.promptArgs().type} for ${this.userPrompt()} `;
    switch (this.promptArgs().type) {
      case 'story':
        prompt += `, narrative sequence, ${this.promptArgs().style} art style`;
        break;
      case 'process':
        prompt += `, instructional illustration`;
        break;
      case 'tutorial':
        prompt += `, educational diagram`;
        break;
      case 'timeline':
        prompt += `, chronological progression, timeline visualization`;
        break;
    }

    prompt += `, ${this.promptArgs().transition} transition from previous image.`;
    return prompt;
  });

  generate = output<string>();

  onGenerateClick(): void {
    if (!this.isGenerationDisabled()) {
      this.generate.emit(this.fullPrompt());
    }
  }

  onEnterPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onGenerateClick()
    }
  }
}
