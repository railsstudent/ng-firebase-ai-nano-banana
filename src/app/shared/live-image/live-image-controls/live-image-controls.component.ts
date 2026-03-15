import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-live-image-controls',
  template: `
    <div class="controls-container">
      <button
        type="button"
        (click)="action.emit('capture')"
        class="control-button btn-capture"
      >
        Capture Photo
      </button>
      @if (hasURL()) {
        <button
          type="button"
          (click)="action.emit('clear')"
          class="control-button btn-clear"
        >
          Clear Photo
        </button>
        <button
          type="button"
          (click)="action.emit('use')"
          class="control-button btn-use"
        >
          Use This
        </button>
      }
    </div>
  `,
  styleUrl: './live-image-controls.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
})
export class LiveImageControlsComponent {
  hasURL = input(false);
  action = output<'capture' | 'clear' | 'use'>();
}
