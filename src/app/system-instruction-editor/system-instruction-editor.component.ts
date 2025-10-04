import { ChangeDetectionStrategy, Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FeatureDetails } from '../feature/types/feature-details.type';
import { CardComponent } from '../ui/card/card.component';
import { DropzoneComponent } from '../ui/dropzone/dropzone.component';
import { ErrorDisplayComponent } from '../ui/error-display/error-display.component';
import { SpinnerIconComponent } from '../ui/icons/spinner-icon.component';
import { ImageViewerComponent } from '../ui/image-viewer/image-viewer.component';
import { LoaderComponent } from '../ui/loader/loader.component';
import { SystemInstructionService } from './services/system-instruction.service';

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
  customPrompt = input.required<string>();
  feature = input.required<FeatureDetails>();

  private readonly systemInstructionService = inject(SystemInstructionService);

  error = this.systemInstructionService.error;
  isLoading = this.systemInstructionService.isLoading;
  generatedImageUrl = signal('');

  dropzone = viewChild.required<DropzoneComponent>('dropzone');

  featureNeedsImage = computed(() => !!this.feature()?.mode);

  dropzoneMode = computed(() => this.feature()?.mode ?? 'single');

  imageFiles = signal<File[]>([]);

  onFilesChanged(files: File[]): void {
    console.log('Files selected in editor:', files);
    this.imageFiles.set(files);
  }

  async handleGenerate(): Promise<void> {
    const imageUrl = await this.systemInstructionService.handleGenerateWithCustomPrompt(
      this.customPrompt(),
      this.imageFiles()
    );
    this.generatedImageUrl.set(imageUrl);
  }

  downloadImage(): void {
    this.systemInstructionService.downloadImage(
      this.generatedImageUrl(),
      this.feature().name
    );
  }
}
