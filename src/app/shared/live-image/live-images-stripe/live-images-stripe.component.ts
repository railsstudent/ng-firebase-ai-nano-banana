import { ChangeDetectionStrategy, Component, computed, DOCUMENT, ElementRef, inject, output, Renderer2, resource, signal, viewChild } from '@angular/core';
import { LiveImageStripeService } from '../services/live-image-stripe.service';
import { CAPACITY } from './live-images-stripe.const';
import { ThumbnailHolder } from './types/live-image-stripe.type';

@Component({
  selector: 'app-live-images-stripe',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './live-images-stripe.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
})
export class LiveImagesStripeComponent {
  liveImageStripeService = inject(LiveImageStripeService);
  document = inject(DOCUMENT);
  renderer = inject(Renderer2);

  newThumbnail = signal<string | null>(null);
  thumbnailCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  thumbnailNativeElement = computed(() => this.thumbnailCanvas().nativeElement);

  thumbnailHolders = signal<ThumbnailHolder[]>([]);

  selectedOrignalURL = output<string>();

  thumbnailHolderResource = resource({
    params: () => this.liveImageStripeService.newSnapshot(),
    loader: async ({ params: newDataURL }) => {
      if (!newDataURL) {
        return this.thumbnailHolders();
      }

      const thumbnailURL = await this.liveImageStripeService.generateThumbnail(
        newDataURL,
        this.thumbnailNativeElement(),
        120,
      );

      const newItem = {
        thumbnail: thumbnailURL,
        original: newDataURL,
      };

      const ids = this.thumbnailHolders().map(({ index }) => index);
      const maxIndex = this.thumbnailHolders().length <= 0 ? 0 : this.thumbnailHolders()[0].index + 1;
      this.thumbnailHolders.update((acc) => {
        const newList = [{ index: maxIndex, ...newItem }, ...acc];
        return newList.slice(0, CAPACITY)
      });

      return newItem;
    }
  });

  thumbnailSelected(thumbnailId: number) {
    const thumbnailIndex = this.thumbnailHolders().findIndex((item) => item.index === thumbnailId);
    if (thumbnailIndex >= 0 && thumbnailIndex < this.thumbnailHolders().length) {
      this.selectedOrignalURL.emit(this.thumbnailHolders()[thumbnailIndex].original);
    }
  }
}
