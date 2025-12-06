import { ImageTokenUsage } from '@/ai/types/image-response.type';
import { TokenUsage } from '@/ai/types/token-usage.type';
import { TokenUsageComponent } from '@/shared/token-usage/token-usage.component';
import { ImageActions } from '@/shared/types/actions.type';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';

@Component({
  selector: 'app-image-viewers',
  imports: [ImageViewerComponent, TokenUsageComponent],
  template: `
@let imageTokenUsages = images();
@if (imageTokenUsages && imageTokenUsages.length > 0) {
  @let responsiveLayout = (imageTokenUsages && imageTokenUsages.length === 1) ?
    'flex justify-center items-center' :
    'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4';
  <div [class]="responsiveLayout">
    @for (imageTokenUsage of imageTokenUsages; track imageTokenUsage.image.id; let i=$index) {
      <app-image-viewer class="block mt-4"
        [url]="imageTokenUsage.image.inlineData"
        [id]="imageTokenUsage.image.id"
        (imageAction)="handleActions($event)"
      />
    }
  </div>
  @if (totalTokenUsage()) {
    <app-token-usage [tokenUsage]="totalTokenUsage()" />
  }
}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageViewersComponent {
  images = input<ImageTokenUsage[]>([]);
  totalTokenUsage = input<TokenUsage | undefined>(undefined);
  handleMediaAction = output<{ action: string, id: number }>();

  async handleActions({ action, context }: { action: ImageActions, context?: unknown }) {
    const id = context as number;
    this.handleMediaAction.emit({ action, id });
  }
}
