import { ChangeDetectionStrategy, Component, computed, input, model, output, signal } from '@angular/core';
import { debounce, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { GenerateOptionsFormComponent } from '../generate-options-form/generate-options-form.component';
import { GenerateOptions } from '../generate-options-form/types/generate-options.type';
import { SpinnerIconComponent } from '../icons/spinner-icon.component';
import { PromptForm } from './types/prompt-form.type';

@Component({
  selector: 'app-prompt-form',
  templateUrl: './prompt-form.component.html',
  imports: [
    SpinnerIconComponent,
    GenerateOptionsFormComponent,
    FormRoot,
    FormField,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptFormComponent {
  promptModel = model.required<PromptForm>();
  placeholderText = input('e.g., A detective who can talk to plants.');
  additionalDisabledConditions = input(false);
  isLoading = input.required<boolean>();

  isGenerationDisabled = computed(
    () => {
      const isFormInvalid = this.promptForm().invalid();
      const isEmptyInput = this.promptForm.value().value().trim().length <= 0;
      return this.isLoading() || isFormInvalid || isEmptyInput || this.additionalDisabledConditions()
    }
  );

  generate = output<{ prompt: string; inputValue: string }>();

  genConfigValues = signal<GenerateOptions | undefined>(undefined);

  promptForm = form(this.promptModel, (schemaPath) => {
    required(schemaPath.value);
    debounce(schemaPath.value, 500);
  });

  onGenerateClick(event: Event): void {
    event.preventDefault();
    if (!this.isGenerationDisabled()) {
      const inputValue = this.promptForm.value().value();
      let trimmedPrompt = inputValue;
      const aspectRatio = this.genConfigValues()?.aspectRatio || '';
      const resolution = this.genConfigValues()?.resolution || '';
      if (aspectRatio) {
        trimmedPrompt = `${trimmedPrompt}\Apply this aspect ratio to the image: ${aspectRatio}`;
      }
      if (resolution) {
        trimmedPrompt = `${trimmedPrompt}\nApply this resolution to the image: ${resolution}`;
      }

      this.generate.emit({ prompt: trimmedPrompt, inputValue });
    }
  }

  onEnterPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onGenerateClick(event)
    }
  }
}
