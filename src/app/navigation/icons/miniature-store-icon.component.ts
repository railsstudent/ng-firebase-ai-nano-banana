import { Component } from '@angular/core';

@Component({
  selector: 'app-miniature-store-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="8" width="18" height="13" rx="2" ry="2" />
      <path d="M3 8l9-5 9 5" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <rect x="7" y="13" width="3" height="8" />
      <rect x="14" y="13" width="3" height="8" />
    </svg>
  `,
})
export class MiniatureStoreIconComponent {}

@Component({
  selector: 'app-miniature-store-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 2h6a1 1 0 011 1v3a1 1 0 01-1 1v10a3 3 0 11-6 0V7a1 1 0 01-1-1V3a1 1 0 011-1z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14v4" />
    </svg>
  `,
})
export class GlassBottleIconComponent {}

