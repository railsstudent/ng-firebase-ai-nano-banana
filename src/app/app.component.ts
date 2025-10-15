import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './navigation/navigation.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavigationComponent],
  template: `
<div class="min-h-screen bg-gray-900 text-white flex flex-col">
  <app-navigation />

  <main class="flex-grow container mx-auto p-6 lg:p-8">
    <router-outlet />
  </main>

  <footer class="bg-gray-800 mt-auto">
    <div class="container mx-auto px-6 py-4 text-center text-gray-400">
      <p>&copy; 2025 Photo Editing App. Built with Gemini, Angular, Firebase AI Logic & Tailwind.</p>
    </div>
  </footer>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
