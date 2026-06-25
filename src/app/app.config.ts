import { provideFirebase } from '@/features/ai/providers/firebase.provider';
import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withExperimentalAutoCleanupInjectors, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { ConfigService } from './features/ai/services/config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions(), withExperimentalAutoCleanupInjectors()),
    provideAppInitializer(async () => {
      const configService = inject(ConfigService);
      await configService.initialize();
    }),
    provideFirebase(),
  ]
};
