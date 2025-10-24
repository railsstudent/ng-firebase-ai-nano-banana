import { Component } from '@angular/core';

@Component({
  selector: 'app-chat-error-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2 L2 20 H22 L12 2 Z" />
      <line x1="12" y1="8" x2="12" y2="14" />
      <circle cx="12" cy="18" r="1" fill="red" />
    </svg>
  `
})
export class ChatErrorIconComponent {}
