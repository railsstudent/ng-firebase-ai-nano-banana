import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-error-display',
  template: `
    @if (error()) {
      <div class="error-block" role="alert">
        <strong class="font-bold">Error:</strong>
        <span class="block sm:inline ml-2">{{ error() }}</span>
      </div>
    }
  `,
  styleUrl: '../tailwind-utilities.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorDisplayComponent {
  error = input('');
}
