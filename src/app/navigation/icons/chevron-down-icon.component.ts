import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-chevron-down-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChevronDownIconComponent {}