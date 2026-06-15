import { ConfigService } from '@/features/ai/services/config.service';
import { NavigationComponent } from '@/features/navigation/navigation.component';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-footer',
  template: `
<footer class="bg-gray-800 mt-auto">
    <div class="container mx-auto px-6 py-4 text-center text-gray-400">
      <p>&copy; 2025 Photo Editing App. Built with Gemini, Angular, Firebase, Firebase AI Logic & Tailwind.</p>
    </div>
</footer>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {}
