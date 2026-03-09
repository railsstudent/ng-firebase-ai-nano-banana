import { ChangeDetectionStrategy, Component, linkedSignal, signal } from '@angular/core';
import { ThumbnailHolder } from './types/live-image-stripe.type';

const CAPACITY = 5;
@Component({
  selector: 'app-live-images-strip',
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
export class LiveImagesStripComponent {
  newThumbnail = signal<string | null>(null);

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

  thumbnailSelected(index: number) {
    console.log(`select ${index}`);
  }
}
