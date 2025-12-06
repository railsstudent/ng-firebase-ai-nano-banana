import { ImagesWithTokenUsage } from '@/ai/types/image-response.type';
import { ImageActions } from '@/shared/types/actions.type';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';
import { ThoughtSummaryComponent } from './thought-summary/thought-summary.component';

@Component({
  selector: 'app-image-viewers',
  imports: [ImageViewerComponent, ThoughtSummaryComponent],
  template: `
@let allImages = images();
@if (allImages && allImages.length > 0) {
  @let responsiveLayout = (allImages && allImages.length === 1) ?
    'flex justify-center items-center' :
    'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4';
  <div [class]="responsiveLayout">
    @for (image of allImages; track image.id; let i=$index) {
      <app-image-viewer class="block mt-4"
        [url]="image.inlineData"
        [id]="image.id"
        (imageAction)="handleActions($event)"
      />
    }
  </div>
  <app-thought-summary
    [tokenUsage]="totalTokenUsage()"
    [thoughtSummaries]="thoughtSummaries()"
    [groundingMetadata]="groundingMetadata()"
  />
}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageViewersComponent {
  imagesWithTokenUsage = input.required<ImagesWithTokenUsage>();

  handleMediaAction = output<{ action: string, id: number }>();

  images = computed(() => this.imagesWithTokenUsage().images);
  thoughtSummaries = computed(() => this.imagesWithTokenUsage().thinkingSummaries);
  totalTokenUsage = computed(() => this.imagesWithTokenUsage().tokenUsage);
  groundingMetadata = computed(() => this.imagesWithTokenUsage().groundingMetadata);

  async handleActions({ action, context }: { action: ImageActions, context?: unknown }) {
    const id = context as number;
    this.handleMediaAction.emit({ action, id });
  }
}
