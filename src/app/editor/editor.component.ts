import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { FeatureDetails } from '../feature/types/feature-details.type';
import { CardHeaderComponent } from '../shared/card/card-header/card-header.component';
import { CardComponent } from '../shared/card/card.component';
import { DropzoneComponent } from '../shared/dropzone/dropzone.component';
import { ErrorDisplayComponent } from '../shared/error-display/error-display.component';
import { ImageViewerComponent } from '../shared/image-viewer/image-viewer.component';
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
    ImageViewerComponent,
  ],
  templateUrl: './editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditorComponent {
  featureId = input.required<string>();
  feature = input.required<FeatureDetails>();

  private readonly editorService = inject(EditorService);

  prompt = this.editorService.prompt;
  promptHistory = this.editorService.getPromptHistory(this.featureId);

  error = this.editorService.error;
  isLoading = this.editorService.isLoading;
  generatedImageUrl = signal('');

  featureNeedsImage = computed(() => this.feature()?.mode !== undefined);

  dropzoneMode = computed(() => this.feature()?.mode ?? 'single');

  imageFiles = signal<File[]>([]);

  hasImageFiles = linkedSignal({
    source: () => ({ numOfImages: this.imageFiles().length, featureNeedsImage: this.featureNeedsImage() }),
    computation: ({ numOfImages, featureNeedsImage}) => featureNeedsImage ? numOfImages > 0 : true
  });

  async handleGenerate(): Promise<void> {
    const imageUrl = await this.editorService.handleGenerate(
      this.featureId(),
      this.featureNeedsImage(),
      this.imageFiles()
    );
    this.generatedImageUrl.set(imageUrl);
  }

  onClearHistory(): void {
    this.editorService.clearHistory(this.featureId());
  }

  downloadImage(): void {
    this.editorService.downloadImage(this.generatedImageUrl());
  }
}
