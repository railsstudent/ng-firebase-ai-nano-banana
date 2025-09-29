import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-photo-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <circle cx="8.5" cy="13.5" r="1.5" />
      <polyline points="22 21 16 15 11 20 6 15 2 19" />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoIconComponent {}
