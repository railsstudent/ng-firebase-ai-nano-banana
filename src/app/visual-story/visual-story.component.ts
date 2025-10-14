import { FeatureService } from '@/feature/services/feature.service';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ImageResponse } from '../ai/types/image-response.type';
import { CardHeaderComponent } from '../shared/card/card-header/card-header.component';
import { CardComponent } from '../shared/card/card.component';
import { ErrorDisplayComponent } from '../shared/error-display/error-display.component';
import { ImageActions } from '../shared/image-viewer/types/actions.type';
import { VisualStoryService } from './services/visual-story.service';
import VisualStoryFormComponent from './visual-story-form/visual-story-form.component';

@Component({
  selector: 'app-visual-story',
  imports: [
    CardComponent,
    CardHeaderComponent,
    ErrorDisplayComponent,
    // ImageViewerComponent,
    VisualStoryFormComponent,
    // VideoPlayerComponent,
  ],
  templateUrl: './visual-story.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisualStoryComponent {
  private readonly visualStoryService = inject(VisualStoryService);
  private readonly featureService = inject(FeatureService);

  feature = this.featureService.getFeatureDetails('visual-story');

  userPrompt = signal('A detective who can talk to plants.');

  error = this.visualStoryService.error;
  isLoading = this.visualStoryService.isLoading;

  images = signal<ImageResponse[] | undefined>(undefined);

  videoUrl = this.visualStoryService.videoUrl;
  videoError = this.visualStoryService.videoError;
  isGeneratingVideo = this.visualStoryService.isGeneratingVideo;

  async handleGenerate(fullPrompt: string): Promise<void> {
    const generatedImages = await this.visualStoryService.handleGenerate(
      fullPrompt,
    );

    console.log(generatedImages)
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
