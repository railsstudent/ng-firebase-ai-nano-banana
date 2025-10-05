import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-card-header',
  template: `
    <h2 class="text-4xl font-bold text-indigo-500 mb-4">
      {{ name() }}
    </h2>
    <p class="text-lg text-gray-300 max-w-xl mx-auto mb-8">
      {{ description() }}
    </p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardHeaderComponent {
    name = input('');
    description = input('');
}
