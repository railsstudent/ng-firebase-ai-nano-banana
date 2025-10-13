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
import { VisualStoryService } from './services/visual-story.service';
import { ImageResponse } from '../ai/types/image-response.type';
import { VideoPlayerComponent } from '../shared/video-player/video-player.component';
import { FeatureService } from '@/feature/services/feature.service';

@Component({
  selector: 'app-visual-story',
  imports: [
    CardComponent,
    CardHeaderComponent,
    ErrorDisplayComponent,
    // ImageViewerComponent,
    FormsModule,
    // SpinnerIconComponent,
    // VideoPlayerComponent,
  ],
  templateUrl: './visual-story.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisualStoryComponent {
  private readonly visualStoryService = inject(VisualStoryService);
  private readonly featureService = inject(FeatureService);

  feature = this.featureService.getFeatureDetails('visual-story');

  error = this.visualStoryService.error;
  isLoading = this.visualStoryService.isLoading;

  generatedImages = signal<ImageResponse[] | undefined>(undefined);

  videoUrl = this.visualStoryService.videoUrl;
  videoError = this.visualStoryService.videoError;
  isGeneratingVideo = this.visualStoryService.isGeneratingVideo;

  async handleGenerate(): Promise<void> {
    // const imageUrl = await this.visualStoryService.handleGenerate(
    //   this.customPrompt(),
    // );
    // this.generatedImages.set(imageUrl);
  }

  async handleAction(actionName: ImageActions) {
    // if (actionName === 'clearImage') {
    //   this.generatedImages.set(undefined);
    // } else if (actionName === 'downloadImage') {
    //   this.visualStoryService.downloadImage(this.generatedImage()?.inlineData || '');
    // } else if (actionName === 'generateVideo') {
    //   await this.visualStoryService.generateVideo(this.customPrompt(),
    //   this.generatedImage());
    // }
  }
}
