import config from '@/firebase-project/config.json';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { fetchAndActivate, getRemoteConfig } from 'firebase/remote-config';
import { lastValueFrom } from 'rxjs';
import remoteConfigDefaults from '../../firebase-project/remoteconfig.defaults.json';
import { ConfigService } from './ai/services/config.service';
import { FirebaseConfigResponse } from './ai/types/firebase-config.type';

async function fetchRemoteConfig(firebaseApp: FirebaseApp) {
  const remoteConfig = getRemoteConfig(firebaseApp);
  remoteConfig.settings.minimumFetchIntervalMillis = 3600000;
  remoteConfig.defaultConfig = remoteConfigDefaults;
  await fetchAndActivate(remoteConfig);
  return remoteConfig;
}

async function loadFirebaseConfig() {
  const httpService = inject(HttpClient);
  const firebaseConfig$ = httpService.get<FirebaseConfigResponse>(`${config.appUrl}/getFirebaseConfig`)
  const firebaseConfig = await lastValueFrom(firebaseConfig$);
  return firebaseConfig;
}

export async function bootstrapFirebase() {
    try {
      const configService = inject(ConfigService);
      const { app, recaptchaSiteKey } = await loadFirebaseConfig();
      const firebaseApp = initializeApp(app);
      const remoteConfig = await fetchRemoteConfig(firebaseApp);

      initializeAppCheck(firebaseApp, {
        provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true,
      });

      configService.loadConfig(firebaseApp, remoteConfig);
    } catch (err) {
      console.error('Remote Config fetch failed', err);
      throw err;
    }
}
