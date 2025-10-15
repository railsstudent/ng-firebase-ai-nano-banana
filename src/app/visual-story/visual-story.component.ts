import { ImageResponse } from '@/ai/types/image-response.type';
import { FeatureService } from '@/feature/services/feature.service';
import { CardHeaderComponent } from '@/shared/card/card-header/card-header.component';
import { CardComponent } from '@/shared/card/card.component';
import { ErrorDisplayComponent } from '@/shared/error-display/error-display.component';
import { ImageActions } from '@/shared/image-viewer/types/actions.type';
import { PromptHistoryComponent } from '@/shared/prompt-history/prompt-history.component';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { VisualStoryHistoryService } from './services/visual-story-history.service';
import { VisualStoryService } from './services/visual-story.service';
import { VisualStoryGenerateArgs } from './types/visual-story-args.type';
import VisualStoryFormComponent from './visual-story-form/visual-story-form.component';

const DEFAULT_PROMPT_ARGS: VisualStoryGenerateArgs = {
  userPrompt: 'A detective who can talk to plants.',
  args: {
    style: 'consistent',
    transition: 'smooth',
    numberOfImages: 2,
    type: 'story'
  }
}

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

  promptArgs = signal<VisualStoryGenerateArgs>(DEFAULT_PROMPT_ARGS);

  error = this.visualStoryService.error;
  isLoading = this.visualStoryService.isLoading;

  images = signal<ImageResponse[] | undefined>(undefined);

  videoUrl = this.visualStoryService.videoUrl;
  videoError = this.visualStoryService.videoError;
  isGeneratingVideo = this.visualStoryService.isGeneratingVideo;

  key = signal('visual-story');
  promptHistory = this.visualStoryHistoryService.getPromptHistory(this.key);

  private savePromptArgs(trimmedPrompt: string) {
    this.promptArgs.update(args => {
      args.userPrompt = trimmedPrompt;
      return args;
    });

    this.visualStoryHistoryService.addPrompt(this.key(), this.promptArgs());
  }

  async handleGenerate(): Promise<void> {
    const userPrompt = this.promptArgs().userPrompt;
    if (!userPrompt && !userPrompt.trim()) {
      return;
    }

    this.savePromptArgs(userPrompt);

    const generatedImages = await this.visualStoryService.handleGenerateSequence(
      this.promptArgs()
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

  onClearHistory(): void {
    this.visualStoryHistoryService.clearHistory(this.key());
  }

  handleVisualStoryArgs(stringifyPromptArgs: string) {
    try {
      this.promptArgs.set(JSON.parse(stringifyPromptArgs));
    } catch (e) {
      console.error(e);
      this.promptArgs.set(DEFAULT_PROMPT_ARGS);
    }
  }
}
