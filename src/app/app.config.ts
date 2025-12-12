import { ApplicationConfig, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideFirebase } from './ai/providers/firebase.provider';
import { provideGemini } from './ai/providers/gemini.provider';
import { bootstrapFirebase } from './app.bootstrap';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideAppInitializer(async () => bootstrapFirebase()),
    provideFirebase(),
    provideGemini(),
  ]
};
