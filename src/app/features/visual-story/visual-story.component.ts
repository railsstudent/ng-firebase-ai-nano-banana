import { FeatureService } from '@/core/feature/services/feature.service';
import { CardHeaderComponent } from '@/shared/ui/card/card-header/card-header.component';
import { CardComponent } from '@/shared/ui/card/card.component';
import { ErrorDisplayComponent } from '@/shared/ui/error-display/error-display.component';
import { GenMediaComponent } from '@/shared/ui/gen-media/gen-media.component';
import { PromptHistoryComponent } from '@/shared/domain/prompt-history/prompt-history.component';
import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { VisualStoryImageFacade } from './services/visual-story-image.facade';
import { VisualStoryFormComponent } from './visual-story-form/visual-story-form.component';
import VisualStoryVideoComponent from './visual-story-video/visual-story-video.component';

@Component({
  selector: 'app-visual-story',
  imports: [
    CardComponent,
    CardHeaderComponent,
    ErrorDisplayComponent,
    VisualStoryFormComponent,
    PromptHistoryComponent,
    GenMediaComponent,
    VisualStoryVideoComponent,
  ],
  templateUrl: './visual-story.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VisualStoryComponent {
  readonly imageFacade = inject(VisualStoryImageFacade);
  private readonly featureService = inject(FeatureService);

  feature = this.featureService.getFeatureDetails('visual-story');

  genmedia = viewChild<GenMediaComponent>('genmedia');
  images = computed(() => this.genmedia()?.imagesWithTokenUsage().images.map((item) => item));

  genMediaInput = this.imageFacade.genMediaInput;
  visualStoryForm = this.imageFacade.visualStoryForm;

  isLoading = computed(() => this.genmedia()?.isLoading() || false);
  error = computed(() => this.genmedia()?.error() || '');
  type = computed(() => this.visualStoryForm().type);
  userPrompt = computed(() => this.visualStoryForm().userPrompt);
  promptHistory = computed(() => this.imageFacade.promptHistory());

  handleVisualStoryArgs(stringifyPromptArgs: string) {
    this.imageFacade.handleVisualStoryArgs(stringifyPromptArgs)
  }
}
