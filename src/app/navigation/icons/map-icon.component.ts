import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-magic-wand-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="4 6 10 3 14 6 20 3 20 18 14 21 10 18 4 21 4 6" />
      <line x1="10" y1="3" x2="10" y2="18" />
      <line x1="14" y1="6" x2="14" y2="21" />
      <polyline points="4 6 10 9 14 6 20 9" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapIconComponent {}
