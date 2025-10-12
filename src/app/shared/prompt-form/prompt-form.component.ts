import { ChangeDetectionStrategy, Component, computed, inject, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpinnerIconComponent } from '../icons/spinner-icon.component';
import { PromptFormService } from '../services/prompt-form.service';

@Component({
  selector: 'app-prompt-form',
  templateUrl: './prompt-form.component.html',
  imports: [FormsModule, SpinnerIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptFormComponent {
  readonly promptFormService = inject(PromptFormService);

  prompt = model.required<string>();
  placeholderText = input('e.g., A detective who can talk to plants.');
  additionalDisabled = input(false);

  isLoading = this.promptFormService.isLoading;
  isGenerationDisabled = computed(
    () => this.promptFormService.isGenerationDisabled() || this.additionalDisabled()
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
