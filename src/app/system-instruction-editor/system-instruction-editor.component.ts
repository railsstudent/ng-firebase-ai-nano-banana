import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ImageViewerComponent } from '../editor/image-viewer/image-viewer.component';
import { EditorService } from '../editor/services/editor.service';
import { FeatureService } from '../navigation/services/feature.service';
import { CardComponent } from '../ui/card/card.component';
import { DropzoneComponent } from '../ui/dropzone/dropzone.component';
import { ErrorDisplayComponent } from '../ui/error-display/error-display.component';
import { LoaderComponent } from '../ui/loader/loader.component';
import { SpinnerIconComponent } from '../ui/icons/spinner-icon.component';

@Component({
  selector: 'app-system-instruction-editor',
  imports: [
    CardComponent,
    DropzoneComponent,
    ErrorDisplayComponent,
    LoaderComponent,
    ImageViewerComponent,
    FormsModule,
    SpinnerIconComponent,
  ],
  templateUrl: './system-instruction-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SystemInstructionEditorComponent {
  featureId = input.required<string>();
  featureName = input.required<string>();

  private readonly featureService = inject(FeatureService);
  private readonly editorService = inject(EditorService);

  error = this.editorService.error;
  isLoading = this.editorService.isLoading;
  generatedImageUrl = signal('');

  dropzone = viewChild.required<DropzoneComponent>('dropzone');

  feature = computed(() => this.featureService.getFeature(this.featureId()));

  featureNeedsImage = computed(() => !!this.feature()?.mode);

  dropzoneMode = computed(() => this.feature()?.mode ?? 'single');

  imageFiles = signal<File[]>([]);

  featureDetails = computed(() =>
    this.featureService.getFeatureDetails(this.featureId())
  );

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
    this.dropzone().clearAllFiles();
  }

  onClearHistory(): void {
    this.editorService.clearHistory(this.featureId());
  }

  downloadImage(): void {
      this.editorService.downloadImage(this.generatedImageUrl());
  }
}
