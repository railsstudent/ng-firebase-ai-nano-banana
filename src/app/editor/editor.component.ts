import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { ImageResponse } from '../ai/types/image-response.type';
import { FeatureDetails } from '../feature/types/feature-details.type';
import { CardHeaderComponent } from '../shared/card/card-header/card-header.component';
import { CardComponent } from '../shared/card/card.component';
import { DropzoneComponent } from '../shared/dropzone/dropzone.component';
import { ErrorDisplayComponent } from '../shared/error-display/error-display.component';
import { ImageViewerComponent } from '../shared/image-viewer/image-viewer.component';
import { ImageActions } from '../shared/image-viewer/types/actions.type';
import { PromptFormComponent } from '../shared/prompt-form/prompt-form.component';
import { PromptHistoryComponent } from '../shared/prompt-history/prompt-history.component';
import { EditorService } from './services/editor.service';
import { VideoPlayerComponent } from '../shared/video-player/video-player.component';

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
    VideoPlayerComponent,
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
  generatedImage = signal<ImageResponse | undefined>(undefined);

  featureNeedsImage = computed(() => this.feature()?.mode !== undefined);

  dropzoneMode = computed(() => this.feature()?.mode ?? 'single');

  imageFiles = signal<File[]>([]);

  hasImageFiles = linkedSignal({
    source: () => ({ numOfImages: this.imageFiles().length, featureNeedsImage: this.featureNeedsImage() }),
    computation: ({ numOfImages, featureNeedsImage}) => featureNeedsImage ? numOfImages > 0 : true
  });

  videoUrl = this.editorService.videoUrl;
  videoError = this.editorService.videoError;
  isGeneratingVideo = this.editorService.isGeneratingVideo;

  async handleGenerate(): Promise<void> {
    const imageUrl = await this.editorService.handleGenerate(
      this.featureId(),
      this.featureNeedsImage(),
      this.imageFiles()
    );
    this.generatedImage.set(imageUrl);
  }

  onClearHistory(): void {
    this.editorService.clearHistory(this.featureId());
  }

  async handleAction(actionName: ImageActions) {
    if (actionName === 'clearImage') {
      this.generatedImage.set(undefined);
    } else if (actionName === 'downloadImage') {
      this.editorService.downloadImage(this.generatedImage()?.inlineData || '');
    } else if (actionName === 'generateVideo') {
      await this.editorService.generateVideo(this.generatedImage());
    }
  }
}
