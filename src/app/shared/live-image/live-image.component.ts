import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-live-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (src()) {
      <img [src]="src()" [alt]="alt()" />
    }
    <div>LiveImageComponent works!</div>
  `,
  styles: `
    :host {
      display: block;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
    }
  `,
})
export class LiveImageComponent {
  src = input<string>();
  alt = input<string>('Live image');
}
