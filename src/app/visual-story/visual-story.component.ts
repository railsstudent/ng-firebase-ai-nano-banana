import { ImageResponse } from '@/ai/types/image-response.type';
import { FeatureService } from '@/feature/services/feature.service';
import { CardHeaderComponent } from '@/shared/card/card-header/card-header.component';
import { CardComponent } from '@/shared/card/card.component';
import { ErrorDisplayComponent } from '@/shared/error-display/error-display.component';
import { ImageViewerComponent } from '@/shared/image-viewer/image-viewer.component';
import { ImageActions } from '@/shared/image-viewer/types/actions.type';
import { PromptHistoryComponent } from '@/shared/prompt-history/prompt-history.component';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { VisualStoryHistoryService } from './services/visual-story-history.service';
import { VisualStoryService } from './services/visual-story.service';
import { VisualStoryGenerateArgs } from './types/visual-story-args.type';
import VisualStoryFormComponent from './visual-story-form/visual-story-form.component';
import { VideoPlayerComponent } from '@/shared/video-player/video-player.component';
import { LoaderComponent } from '@/shared/loader/loader.component';

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
    ImageViewerComponent,
    VisualStoryFormComponent,
    PromptHistoryComponent,
    VideoPlayerComponent,
    LoaderComponent
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

    const generatedImagesWithCorrectIndex = generatedImages?.map((image, index) => ({
      ...image,
      id: index
    })) || []

    console.log(generatedImagesWithCorrectIndex)
    this.images.set(generatedImagesWithCorrectIndex);
  }

  async handleAction({ action, context }: { action: ImageActions, context?: unknown }) {
    if (action === 'clearImage') {
      this.images.set(undefined);
    } else if (action === 'downloadImage') {
      const id = context as number;
      const generatedImage = this.images()?.find((image) => image.id === id);
      this.visualStoryService.downloadImage(generatedImage?.inlineData || '');
    } else if (action === 'generateVideo') {
      const id = context as number;
      const generatedImage = this.images()?.find((image) => image.id === id);
      if (generatedImage) {
        await this.visualStoryService.generateVideo(this.promptArgs().userPrompt,
      generatedImage);
      }
    }
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
