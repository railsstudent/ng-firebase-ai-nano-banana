import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-live-images-strip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div>
      live-images-strip working!
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class LiveImagesStripComponent {}
