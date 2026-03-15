import { ChangeDetectionStrategy, Component, inject, linkedSignal, output, signal } from '@angular/core';
import { LiveImageStripeService } from '../services/live-image-stripe.service';
import { ThumbnailHolder } from './types/live-image-stripe.type';

const CAPACITY = 5;
@Component({
  selector: 'app-live-images-stripe',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div>
      @for (thumbnail of thumbnailHolders(); track thumbnail.index) {
        <div (click)="thumbnailSelected(thumbnail.index)">
          <img [src]="thumbnail.thumbnail" />
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class LiveImagesStripeComponent {
  newThumbnail = signal<string | null>(null);
  liveImageStripeService = inject(LiveImageStripeService);

  thumbnailHolders = linkedSignal<string | null, ThumbnailHolder[]>({
    source: () => this.newThumbnail(),
    computation: (newDataURL, previous) => {
      if (!newDataURL) {
        return previous?.value || [];
      }

      const holder = previous?.value;
      const index = holder?.length ? holder?.length + 1 : 1
      const newThumbnailHolder: ThumbnailHolder = {
        index,
        thumbnail: newDataURL,
        original: newDataURL,
      }

      return !holder ? [newThumbnailHolder] : [...holder, newThumbnailHolder]
    }
  });

  generateThumbnail(dataURL: string) {
    console.log(`Generate thumbnail: ${dataURL}`);
  }

  selectedThumbnail = output<string>();
  thumbnailSelected(index: number) {
    console.log(`select ${index}`);
  }
}
