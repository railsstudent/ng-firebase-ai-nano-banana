import { ConfigService } from '@/features/ai/services/config.service';
import { NavigationComponent } from '@/features/navigation/navigation.component';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/ui/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavigationComponent, FooterComponent],
  template: `
<div class="min-h-screen bg-gray-900 text-white flex flex-col">

  @if (hasNoFirebase()) {
    <p>Firebase initialization failed.</p>
  } @else {
    <app-navigation />
    <main class="flex-grow container mx-auto p-6 lg:p-8">
      <router-outlet />
    </main>
  }
  <app-footer />
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly configService = inject(ConfigService);

  hasNoFirebase = computed(() => {
    try {
      return !this.configService.app;
    } catch (e) {
      console.error('Firebase initialization error:', e);
      return true;
    }
  });
}
