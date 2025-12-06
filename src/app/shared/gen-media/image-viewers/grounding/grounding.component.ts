import { MetadataGroup } from '@/ai/types/grounding-metadata.type';
import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, Renderer2 } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-google-search-suggestions',
  templateUrl: './grounding.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroundingComponent {
  groundingMetadata = input<MetadataGroup | undefined>(undefined);

  sanitizer = inject(DomSanitizer);
  renderer2 = inject(Renderer2);
  document = inject(ElementRef);

  safeRenderedContents = computed(() => {
    const unsafeContents = this.groundingMetadata()?.renderedContents || [];
    return unsafeContents.map((unsafeContent) => this.sanitizer.bypassSecurityTrustHtml(unsafeContent));
  });

  constructor() {
    afterRenderEffect({
      write: () => {
        if (this.safeRenderedContents()) {
            this.styleSources();
        }
      }
    });
  }

  private styleSources() {
    const nativeElement = this.document.nativeElement;

    if (nativeElement && nativeElement instanceof HTMLElement) {
      const firstCarousel = nativeElement.getElementsByClassName('carousel')?.item(0);
      if (firstCarousel) {
        this.renderer2.setStyle(firstCarousel, 'white-space', 'normal');
        const tags = firstCarousel.getElementsByTagName('a');
        for (const tag of tags) {
          this.renderer2.setStyle(tag, 'margin-bottom', '0.5rem');
        }
      }
    }
  }
}
