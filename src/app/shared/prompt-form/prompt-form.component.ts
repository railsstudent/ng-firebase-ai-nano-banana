import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpinnerIconComponent } from '../icons/spinner-icon.component';

@Component({
  selector: 'app-prompt-form',
  templateUrl: './prompt-form.component.html',
  imports: [
    FormsModule,
    SpinnerIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptFormComponent {
  prompt = model.required<string>();
  placeholderText = input('e.g., A detective who can talk to plants.');
  additionalDisabledConditions = input(false);
  isLoading = input.required<boolean>();

  isGenerationDisabled = computed(
    () => {
      const isEmptyInput = !this.prompt() || this.prompt().trim().length <= 0;
      return this.isLoading() || isEmptyInput || this.additionalDisabledConditions()
    }
  );

  generate = output<string>();

  onGenerateClick(): void {
    if (!this.isGenerationDisabled()) {
      this.generate.emit(this.prompt().trim());
    }
  }

  onEnterPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onGenerateClick()
    }
  }
}
