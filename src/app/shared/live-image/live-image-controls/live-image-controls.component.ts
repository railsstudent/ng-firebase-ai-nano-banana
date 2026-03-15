import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-live-image-controls',
  template: `
    <div class="mt-4 flex justify-center gap-2">
      <button
        type="button"
        (click)="action.emit('capture')"
        class="cursor-pointer rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Capture Photo
      </button>
      @if (hasURL()) {
        <button
          type="button"
          (click)="action.emit('clear')"
          class="cursor-pointer rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Clear Photo
        </button>
        <button
          type="button"
          (click)="action.emit('use')"
          class="cursor-pointer rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Use This
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
})
export class LiveImageControlsComponent {
  hasURL = input(false);
  action = output<'capture' | 'clear' | 'use'>();
}
