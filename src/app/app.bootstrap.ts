import { inject } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { fetchAndActivate, getRemoteConfig } from 'firebase/remote-config';
import { ConfigService } from './ai/services/config.service';
import firebaseConfig from './firebase.json';
import remoteConfigDefaults from '../../firebase-project/remoteconfig.defaults.json';

async function fetchRemoteConfig(firebaseApp: FirebaseApp) {
  const remoteConfig = getRemoteConfig(firebaseApp);
  remoteConfig.settings.minimumFetchIntervalMillis = 3600000;

  console.log('remoteConfigDefaults', remoteConfigDefaults);
  remoteConfig.defaultConfig = remoteConfigDefaults;
  await fetchAndActivate(remoteConfig);
  return remoteConfig;
}

export async function bootstrapFirebase() {
    try {
      const configService = inject(ConfigService);
      const firebaseApp = initializeApp(firebaseConfig.app);

      // Initialize Firebase App Check
      initializeAppCheck(firebaseApp, {
        provider: new ReCaptchaEnterpriseProvider(firebaseConfig.recaptchaEnterpriseSiteKey),
        isTokenAutoRefreshEnabled: true,
      });

      const remoteConfig = await fetchRemoteConfig(firebaseApp);

      configService.loadConfig(firebaseApp, remoteConfig);
    } catch (err) {
      console.error('Remote Config fetch failed', err);
      throw err;
    }
}
