import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-history-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryIconComponent {}