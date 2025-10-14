import { SpinnerIconComponent } from '@/shared/icons/spinner-icon.component';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
  numberOfImages = signal(2);

  styleList = signal(['consistent', 'evolving']);
  style = signal('consistent');

  transitionList = signal(['smooth', 'dramatic', 'fade']);
  transition = signal('smooth');

  types = signal(['story', 'process', 'tutorial', 'timeline']);
  type = signal('story');

  isGenerationDisabled = computed(
    () => {
      const isEmptyInput = !this.userPrompt() || this.userPrompt().trim().length <= 0;
      return this.isLoading() || isEmptyInput;
    }
  );

  fullPrompt = computed(() => {
    let prompt = `Create a ${this.numberOfImages()} part ${this.type()} for ${this.userPrompt()} `;
    switch (this.type()) {
      case 'story':
        prompt += `, narrative sequence, ${this.style()} art style`;
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

    prompt += `, ${this.transition()} transition from previous image.`;
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
