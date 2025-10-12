import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FeatureDetails } from '../feature/types/feature-details.type';
import { CardHeaderComponent } from '../shared/card/card-header/card-header.component';
import { CardComponent } from '../shared/card/card.component';
import { DropzoneComponent } from '../shared/dropzone/dropzone.component';
import { ErrorDisplayComponent } from '../shared/error-display/error-display.component';
import { SpinnerIconComponent } from '../shared/icons/spinner-icon.component';
import { ImageViewerComponent } from '../shared/image-viewer/image-viewer.component';
import { ImageActions } from '../shared/image-viewer/types/actions.type';
import { PredefinedPromptService } from './services/predefined-prompt.service';
import { ImageResponse } from '../ai/types/image-response.type';
import { VideoPlayerComponent } from '../shared/video-player/video-player.component';

@Component({
  selector: 'app-predefined-prompt-editor',
  imports: [
    CardComponent,
    CardHeaderComponent,
    DropzoneComponent,
    ErrorDisplayComponent,
    ImageViewerComponent,
    FormsModule,
    SpinnerIconComponent,
    VideoPlayerComponent,
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

  generatedImage = signal<ImageResponse | undefined>(undefined);
  imageFiles = signal<File[]>([]);

  customPrompt = computed(() => this.feature().customPrompt || '');
  dropzoneMode = computed(() => this.feature()?.mode ?? 'single');

  videoUrl = this.predefinedPromptService.videoUrl;
  videoError = this.predefinedPromptService.videoError;
  isGeneratingVideo = this.predefinedPromptService.isGeneratingVideo;

  async handleGenerate(): Promise<void> {
    const imageUrl = await this.predefinedPromptService.handleGenerate(
      this.customPrompt(),
      this.imageFiles()
    );
    this.generatedImage.set(imageUrl);
  }

  async handleAction(actionName: ImageActions) {
    if (actionName === 'clearImage') {
      this.generatedImage.set(undefined);
    } else if (actionName === 'downloadImage') {
      this.predefinedPromptService.downloadImage(
        this.generatedImage()?.inlineData || '',
        this.feature().name
      );
    } else if (actionName === 'generateVideo') {
      await this.predefinedPromptService.generateVideo(this.customPrompt(),
      this.generatedImage());
    }
  }
}
