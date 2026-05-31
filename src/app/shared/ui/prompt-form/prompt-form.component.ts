import { SpinnerIconComponent } from '@/shared/icons/spinner-icon.component';
import { GenerateOptionsFormComponent } from '@/shared/ui/generate-options-form/generate-options-form.component';
import { GenerateOptions } from '@/shared/ui/generate-options-form/types/generate-options.type';
import { ChangeDetectionStrategy, Component, computed, input, model, output, signal } from '@angular/core';
import { debounce, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { PromptForm } from './types/prompt-form.type';
import { PromptImageConfig } from './types/prompt-image-config.type';

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
      const isEmptyInput = this.promptForm.value().value().trim().length <= 0;
      return this.isLoading() || this.promptForm().invalid() || isEmptyInput || this.additionalDisabledConditions()
    }
  );

  generate = output<PromptImageConfig>();

  genConfigValues = signal<GenerateOptions | undefined>(undefined);

  promptForm = form(this.promptModel, (schemaPath) => {
    required(schemaPath.value);
    debounce(schemaPath.value, 500);
  });

  onGenerateClick(event: Event): void {
    event.preventDefault();
    if (!this.isGenerationDisabled()) {
      const aspectRatio = this.genConfigValues()?.aspectRatio || '';
      const resolution = this.genConfigValues()?.resolution || '';
      this.generate.emit({ prompt: this.promptForm.value().value(), aspectRatio, resolution });
    }
  }

  onEnterPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onGenerateClick(event)
    }
  }
}
