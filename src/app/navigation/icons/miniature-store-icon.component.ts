import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-magic-wand-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="8" width="18" height="13" rx="2" ry="2" />
      <path d="M3 8l9-5 9 5" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <rect x="7" y="13" width="3" height="8" />
      <rect x="14" y="13" width="3" height="8" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniatureStoreIconComponent {}
