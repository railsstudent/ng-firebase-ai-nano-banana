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

@Component({
  selector: 'app-cube-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  `,
})
export class CubeIconComponent {}

@Component({
  selector: 'app-history-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
    </svg>
  `,
})
export class HistoryIconComponent {}

@Component({
  selector: 'app-sparkles-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M19 3v4M17 5h4M14 11l-1.5-1.5L11 11l1.5 1.5L14 11zM10 21l-1.5-1.5L7 21l1.5 1.5L10 21zM21 14l-1.5-1.5L18 14l1.5 1.5L21 14zM3 14l1.5-1.5L6 14l-1.5 1.5L3 14z" />
    </svg>
  `,
})
export class SparklesIconComponent {}

@Component({
  selector: 'app-home-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  `,
})
export class HomeIconComponent {}

@Component({
  selector: 'app-magic-wand-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 12L5 3m0 9l9-9M3 21l6-6m-3 0l6-6"/>
    </svg>
  `,
})
export class MagicWandIconComponent {}

@Component({
  selector: 'app-map-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="4 6 10 3 14 6 20 3 20 18 14 21 10 18 4 21 4 6" />
      <line x1="10" y1="3" x2="10" y2="18" />
      <line x1="14" y1="6" x2="14" y2="21" />
      <polyline points="4 6 10 9 14 6 20 9" />
    </svg>
  `,
})
export class MapIconComponent {}

@Component({
  selector: 'app-message-circle-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  `,
})
export class MessageCircleIconComponent {}

@Component({
  selector: 'app-scissors-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="7" cy="7" r="3"></circle>
      <circle cx="7" cy="17" r="3"></circle>
      <line x1="9" y1="15" x2="19" y2="5"></line>
      <line x1="9" y1="9" x2="19" y2="19"></line>
    </svg>
  `,
})
export class ScissorsIconComponent {}

@Component({
  selector: 'app-photo-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <circle cx="8.5" cy="13.5" r="1.5" />
      <polyline points="22 21 16 15 11 20 6 15 2 19" />
    </svg>
  `,
})
export class PhotoIconComponent {}


@Component({
  selector: 'app-chevron-down-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7" />
    </svg>
  `,
})
export class ChevronDownIconComponent {}

@Component({
  selector: 'app-dome-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a6 6 0 1 1-9-5.196" />
      <ellipse cx="12" cy="17" rx="5" ry="3" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-3h1v3m4 0v-4h1v4" />
      <line x1="4" y1="20" x2="20" y2="20" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
    </svg>
  `,
})
export class DomeIconComponent {}
