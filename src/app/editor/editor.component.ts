import { GenMediaComponent } from '@/shared/gen-media/gen-media.component';
import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal, viewChild } from '@angular/core';
import { FeatureDetails } from '../feature/types/feature-details.type';
import { CardHeaderComponent } from '../shared/card/card-header/card-header.component';
import { CardComponent } from '../shared/card/card.component';
import { DropzoneComponent } from '../shared/dropzone/dropzone.component';
import { ErrorDisplayComponent } from '../shared/error-display/error-display.component';
import { PromptFormComponent } from '../shared/prompt-form/prompt-form.component';
import { PromptHistoryComponent } from '../shared/prompt-history/prompt-history.component';
import { EditorService } from './services/editor.service';

@Component({
  selector: 'app-editor',
  imports: [
    CardComponent,
    CardHeaderComponent,
    PromptFormComponent,
    PromptHistoryComponent,
    DropzoneComponent,
    ErrorDisplayComponent,
    GenMediaComponent,
  ],
  templateUrl: './editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditorComponent {
  featureId = input.required<string>();
  feature = input.required<FeatureDetails>();

  private readonly editorService = inject(EditorService);

  editedPrompt = signal('');
  prompt = signal('');
  promptHistory = this.editorService.getPromptHistory(this.featureId);

  genmedia = viewChild<GenMediaComponent>('genmedia');
  isLoading = computed(() =>this.genmedia()?.isLoading() || false);
  error = computed(() => this.genmedia()?.error() || '');

  featureNeedsImage = computed(() => this.feature()?.mode !== undefined);

  dropzoneMode = computed(() => this.feature()?.mode ?? 'single');

  imageFiles = signal<File[]>([]);

  hasImageFiles = linkedSignal({
    source: () => ({ numOfImages: this.imageFiles().length, featureNeedsImage: this.featureNeedsImage() }),
    computation: ({ numOfImages, featureNeedsImage}) => featureNeedsImage ? numOfImages > 0 : true
  });

  async handleGenerate(): Promise<void> {
    const currentPrompt = this.editedPrompt().trim();

    const canGenerateImage = !!currentPrompt
      && (this.featureNeedsImage() ? this.imageFiles().length > 0 : this.imageFiles().length === 0);

    if (!canGenerateImage) {
      return;
    }

    this.editorService.addPrompt(this.featureId(), currentPrompt);
    this.prompt.set(currentPrompt);
  }

  onClearHistory(): void {
    this.editorService.clearHistory(this.featureId());
  }
}
