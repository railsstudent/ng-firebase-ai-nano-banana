import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { catchError, lastValueFrom, throwError } from 'rxjs';
import config from '../../public/config.json';
import { ConfigService } from './ai/services/config.service';
import { FirebaseConfigResponse } from './ai/types/firebase-config.type';
import { connectEmulators, initFirebaseApp } from './firebase.util';

async function loadFirebaseConfig() {
  const httpService = inject(HttpClient);
  const firebaseConfig$ =
    httpService.get<FirebaseConfigResponse>(`${config.appUrl}/getFirebaseConfig`)
      .pipe(
        catchError((e) => throwError(() => e))
      );
  return lastValueFrom(firebaseConfig$);
}

export async function bootstrapFirebase() {
    try {
      const configService = inject(ConfigService);
      const firebaseConfig = await loadFirebaseConfig();
      const { app, recaptchaSiteKey } = firebaseConfig;
      const firebaseObjects = await initFirebaseApp(app);
      const { firebaseApp } = firebaseObjects;

      initializeAppCheck(firebaseApp, {
        provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true,
      });

      connectEmulators(firebaseObjects);
      configService.loadConfig(firebaseObjects);
    } catch (err) {
      console.error(err);
    }
}


