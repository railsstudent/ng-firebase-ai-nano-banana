import { SpinnerIconComponent } from '@/shared/icons/spinner-icon.component';
import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { form, FormField, FormRoot, max, min, required } from '@angular/forms/signals';
import { NUM_OF_IMAGES_LIST, STORY_TYPE_LIST, STYLE_LIST, TRANSITION_LIST } from './constants/visual-story-form.const';
import { VisualStoryForm } from './types/visual-story-form.type';

@Component({
  selector: 'app-visual-story-form',
  imports: [
    SpinnerIconComponent,
    FormField,
    FormRoot,
  ],
  templateUrl: './visual-story-form.component.html',
  styleUrl: '../../shared/tailwind-utilities.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisualStoryFormComponent {
  placeholderText = input('e.g., A detective who can talk to plants.');
  visualStoryModel = model.required<VisualStoryForm>();

  isLoading = input(false);

  numOfImagesList = NUM_OF_IMAGES_LIST;
  styleList = STYLE_LIST;
  transitionList = TRANSITION_LIST;
  types = STORY_TYPE_LIST;

  visualStoryForm = form(this.visualStoryModel, (schemaPath) => {
    required(schemaPath.numberOfImages);
    min(schemaPath.numberOfImages, 2);
    max(schemaPath.numberOfImages, 8);
    required(schemaPath.type);
    required(schemaPath.style);
    required(schemaPath.transition);
  });

  isGenerationDisabled = computed(
    () => {
      const prompt = this.visualStoryModel().userPrompt;
      const isEmptyInput = !prompt || !prompt.trim();
      return this.isLoading() || isEmptyInput;
    }
  );

  generate = output<void>();

  onGenerateClick(event: Event): void {
    event.preventDefault();
    if (!this.isGenerationDisabled()) {
      this.generate.emit();
    }
  }

  onEnterPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onGenerateClick(event);
    }
  }
}
