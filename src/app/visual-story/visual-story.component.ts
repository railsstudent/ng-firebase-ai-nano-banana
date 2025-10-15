import { FeatureService } from '@/feature/services/feature.service';
import { ImageActions } from '@/shared/image-viewer/types/actions.type';
import { PromptHistoryComponent } from '@/shared/prompt-history/prompt-history.component';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ImageResponse } from '../ai/types/image-response.type';
import { CardHeaderComponent } from '../shared/card/card-header/card-header.component';
import { CardComponent } from '../shared/card/card.component';
import { ErrorDisplayComponent } from '../shared/error-display/error-display.component';
import { VisualStoryService } from './services/visual-story.service';
import { VisualStoryGenerateArgs } from './types/visual-story-args.type';
import VisualStoryFormComponent from './visual-story-form/visual-story-form.component';
import { VisualStoryHistoryService } from './services/visual-story-history.service';

@Component({
  selector: 'app-visual-story',
  imports: [
    CardComponent,
    CardHeaderComponent,
    ErrorDisplayComponent,
    // ImageViewerComponent,
    VisualStoryFormComponent,
    PromptHistoryComponent
    // VideoPlayerComponent,
  ],
  templateUrl: './visual-story.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisualStoryComponent {
  private readonly visualStoryService = inject(VisualStoryService);
  private readonly visualStoryHistoryService = inject(VisualStoryHistoryService);
  private readonly featureService = inject(FeatureService);

  feature = this.featureService.getFeatureDetails('visual-story');

  userPrompt = signal('A detective who can talk to plants.');

  error = this.visualStoryService.error;
  isLoading = this.visualStoryService.isLoading;

  images = signal<ImageResponse[] | undefined>(undefined);

  videoUrl = this.visualStoryService.videoUrl;
  videoError = this.visualStoryService.videoError;
  isGeneratingVideo = this.visualStoryService.isGeneratingVideo;

  promptHistory = this.visualStoryHistoryService.promptHistory;

  async handleGenerate(args: VisualStoryGenerateArgs): Promise<void> {
    const generatedImages = await this.visualStoryService.handleGenerateSequence(args);

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

  onClearHistory(): void {
    this.visualStoryHistoryService.clearHistory();
  }

  handleVisualStoryArgs(strArgs: string) {

  }
}
