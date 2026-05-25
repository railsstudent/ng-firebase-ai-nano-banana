import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-card',
  template: `
    <div class="flex flex-col justify-center h-full text-center animate-fade-in">
      <div class="bg-gray-800 p-10 rounded-xl shadow-2xl border border-gray-700">
        <ng-content />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {}
