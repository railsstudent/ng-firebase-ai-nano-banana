import { inject } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { fetchAndActivate, getRemoteConfig } from 'firebase/remote-config';
import { ConfigService } from './ai/services/config.service';
import firebaseConfig from './firebase.json';

function createRemoteConfig(firebaseApp: FirebaseApp) {
  // Initialize Remote Config and get a reference to the service
  const remoteConfig = getRemoteConfig(firebaseApp);

  // The default and recommended production fetch interval for Remote Config is 12 hours
  remoteConfig.settings.minimumFetchIntervalMillis = 3600000;

  // Set default values for Remote Config parameters.
  remoteConfig.defaultConfig = {
    'geminiModelName': 'gemini-3-pro-image-preview',
    'vertexAILocation': 'global',
    'pollingPeriod': 10000,
    'geminiVideoModelName': 'veo-3.1-fast-generate-001',
    'isVeo31Used': true,
    'includeThoughts': true,
    'thinkingBudget': 512,
    'glassBottleSouvenirTemplateId': 'glass-bottle-souvenir-v0-0-1',
  };

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

      const remoteConfig = createRemoteConfig(firebaseApp);
      await fetchAndActivate(remoteConfig);

      configService.loadConfig(firebaseApp, remoteConfig);
    } catch (err) {
      console.error('Remote Config fetch failed', err);
      throw err;
    }
}
