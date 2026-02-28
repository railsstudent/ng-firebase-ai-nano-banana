import { ChangeDetectionStrategy, Component, computed, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GenerateOptionsFormComponent } from '../generate-options-form/generate-options-form.component';
import { SpinnerIconComponent } from '../icons/spinner-icon.component';
import { GenerateOptions } from '../generate-options-form/types/generate-options.type';

@Component({
  selector: 'app-prompt-form',
  templateUrl: './prompt-form.component.html',
  imports: [
    FormsModule,
    SpinnerIconComponent,
    GenerateOptionsFormComponent,
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

  genConfigValues = signal<GenerateOptions | undefined>(undefined);

  onGenerateClick(): void {
    if (!this.isGenerationDisabled()) {
      let trimmedPrompt = this.prompt().trim();
      const aspectRatio = this.genConfigValues()?.aspectRatio || '';
      const resolution = this.genConfigValues()?.resolution || '';
      if (aspectRatio) {
        trimmedPrompt = `${trimmedPrompt}\Apply this aspect ratio to the image: ${aspectRatio}`;
      }
      if (resolution) {
        trimmedPrompt = `${trimmedPrompt}\nApply this resolution to the image: ${resolution}`;
      }

      this.generate.emit(trimmedPrompt);
    }
  }

  onEnterPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onGenerateClick()
    }
  }
}
