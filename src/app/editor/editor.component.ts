import { FeatureDetails } from '@/feature/types/feature-details.type';
import { CardHeaderComponent } from '@/shared/card/card-header/card-header.component';
import { CardComponent } from '@/shared/card/card.component';
import { DropzoneComponent } from '@/shared/dropzone/dropzone.component';
import { ErrorDisplayComponent } from '@/shared/error-display/error-display.component';
import { GenMediaComponent } from '@/shared/gen-media/gen-media.component';
import { GenMediaInput } from '@/shared/gen-media/types/gen-media-input.type';
import { PromptFormComponent } from '@/shared/prompt-form/prompt-form.component';
import { PromptForm } from '@/shared/prompt-form/types/prompt-form.type';
import { PromptHistoryComponent } from '@/shared/prompt-history/prompt-history.component';
import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal, viewChild } from '@angular/core';
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

  editedPrompt = signal<PromptForm>({ value: 'A dog that is chewing his bone.' });
  promptHistory = this.editorService.getPromptHistory(this.featureId);

  genmedia = viewChild<GenMediaComponent>('genmedia');
  isLoading = computed(() =>this.genmedia()?.isLoading() || false);
  error = computed(() => this.genmedia()?.error() || '');

  featureNeedsImage = computed(() => this.feature()?.mode !== undefined);

  dropzoneMode = computed(() => this.feature()?.mode ?? 'single');

  imageFiles = signal<File[]>([]);

  genMediaInput = signal<GenMediaInput>({
    userPrompt: '',
  });

  hasImageFiles = linkedSignal({
    source: () => ({ numOfImages: this.imageFiles().length, featureNeedsImage: this.featureNeedsImage() }),
    computation: ({ numOfImages, featureNeedsImage}) => featureNeedsImage ? numOfImages > 0 : true
  });

  additionalDisabledConditions = computed(() => {
    const isGeneratingVideo = this.genmedia()?.isGeneratingVideo() || false;
    return !this.hasImageFiles() || isGeneratingVideo;
  });

  async handleGenerate({ prompt, inputValue }: { prompt: string; inputValue: string }): Promise<void> {
    if (!this.featureNeedsImage()) {
      if (this.imageFiles().length > 0) {
        this.imageFiles.set([]);
      }
    }

    const canGenerateImage = !!prompt
      && (this.featureNeedsImage() ? this.imageFiles().length > 0 : this.imageFiles().length === 0);

    if (!canGenerateImage) {
      return;
    }

    this.editorService.addPrompt(this.featureId(), inputValue);
    this.genMediaInput.set({
      userPrompt: prompt,
      imageFiles: this.imageFiles(),
    });
  }

  onClearHistory(): void {
    this.editorService.clearHistory(this.featureId());
  }

  handleSelectPrompt(prompt: string) {
    this.editedPrompt.set({ value: prompt });
  }
}
