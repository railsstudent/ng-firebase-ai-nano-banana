import { ErrorDisplayComponent } from '@/shared/error-display/error-display.component';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, take } from 'rxjs';
import { LiveImageService } from '../services/live-image.service';

const WIDTH = 320;

@Component({
  selector: 'app-live-image-controls',
  template: `
    <div class="mt-4 flex justify-center gap-2">
      <button
        (click)="action.emit('capture')"
        class="cursor-pointer rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Capture Photo
      </button>
      @if (hasURL()) {
        <button
          (click)="action.emit('clear')"
          class="cursor-pointer rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Clear Photo
        </button>
        <button
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
