import { Component } from '@angular/core';

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
