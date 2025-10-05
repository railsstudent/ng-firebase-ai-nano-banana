import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FeatureDetails } from '../feature/types/feature-details.type';
import { CardHeaderComponent } from '../ui/card/card-header/card-header.component';
import { CardComponent } from '../ui/card/card.component';
import { DropzoneComponent } from '../ui/dropzone/dropzone.component';
import { ErrorDisplayComponent } from '../ui/error-display/error-display.component';
import { SpinnerIconComponent } from '../ui/icons/spinner-icon.component';
import { ImageViewerComponent } from '../ui/image-viewer/image-viewer.component';
import { PredefinedPromptService } from './services/predefined-prompt.service';

@Component({
  selector: 'app-system-instruction-editor',
  imports: [
    CardComponent,
    CardHeaderComponent,
    DropzoneComponent,
    ErrorDisplayComponent,
    ImageViewerComponent,
    FormsModule,
    SpinnerIconComponent,
  ],
  templateUrl: './predefined-prompt-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PredefinedPromptComponent {
  featureId = input.required<string>();
  feature = input.required<FeatureDetails>();

  private readonly predefinedPromptService = inject(PredefinedPromptService);

  error = this.predefinedPromptService.error;
  isLoading = this.predefinedPromptService.isLoading;

  generatedImageUrl = signal('');
  imageFiles = signal<File[]>([]);

  customPrompt = computed(() => this.feature().customPrompt || '');
  dropzoneMode = computed(() => this.feature()?.mode ?? 'single');

  async handleGenerate(): Promise<void> {
    const imageUrl = await this.predefinedPromptService.handleGenerate(
      this.customPrompt(),
      this.imageFiles()
    );
    this.generatedImageUrl.set(imageUrl);
  }

  downloadImage(): void {
    this.predefinedPromptService.downloadImage(
      this.generatedImageUrl(),
      this.feature().name
    );
  }
}
