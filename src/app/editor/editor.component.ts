import { Component, ChangeDetectionStrategy, computed, input, inject, signal, linkedSignal } from '@angular/core';
import { CardComponent } from '../ui/card/card.component';
import { PromptFormComponent } from '../ui/prompt-form/prompt-form.component';
import { PromptHistoryComponent } from '../ui/prompt-history/prompt-history.component';
import { DropzoneComponent } from '../ui/dropzone/dropzone.component';
import { NavigationService } from '../navigation/services/navigation.service';
import { ErrorDisplayComponent } from '../ui/error-display/error-display.component';
import { LoaderComponent } from '../ui/loader/loader.component';
import { EditorService } from './services/editor.service';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';

@Component({
  selector: 'app-editor',
  imports: [
    CardComponent,
    PromptFormComponent,
    PromptHistoryComponent,
    DropzoneComponent,
    ErrorDisplayComponent,
    LoaderComponent,
    ImageViewerComponent
  ],
  templateUrl: './editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditorComponent {
  featureId = input.required<string>();
  featureName = input.required<string>();

  private readonly navigationService = inject(NavigationService);
  private readonly editorService = inject(EditorService);

  prompt = this.editorService.prompt;
  promptHistory = this.editorService.getPromptHistory(this.featureId);

  error = this.editorService.error;
  isLoading = this.editorService.isLoading;
  generatedImageUrl = signal('');

  feature = computed(() => {
    const id = this.featureId();
    return this.navigationService.getFeatures().find(f => f.id === id);
  });

  featureNeedsImage = computed(() => !!this.feature()?.mode);

  dropzoneMode = computed(() => this.feature()?.mode ?? 'single');

  imageFiles = signal<File[]>([]);

  featureDetails = computed(() => {
    return this.editorService.getFeatureDetails(this.featureId());
  });

  hasImageFiles = linkedSignal({
    source: () => ({ numOfImages: this.imageFiles().length, featureNeedsImage: this.featureNeedsImage() }),
    computation: ({ numOfImages, featureNeedsImage}) => featureNeedsImage ? numOfImages > 0 : true
  });

  onFilesChanged(files: File[]): void {
    console.log('Files selected in editor:', files);
    this.imageFiles.set(files);
  }

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
