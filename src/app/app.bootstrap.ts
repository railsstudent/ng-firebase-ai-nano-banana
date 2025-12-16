import config from '@/firebase-project/config.json';
import remoteConfigDefaults from '@/firebase-project/remoteconfig.defaults.json';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { connectFunctionsEmulator, Functions, getFunctions } from "firebase/functions";
import { fetchAndActivate, getRemoteConfig, getValue, RemoteConfig } from 'firebase/remote-config';
import { lastValueFrom } from 'rxjs';
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

      const functionRegion = getValue(remoteConfig, 'functionRegion').asString();
      const functions = getFunctions(firebaseApp, functionRegion);
      connectEmulators(functions, remoteConfig);

      configService.loadConfig(firebaseApp, remoteConfig, functions);
    } catch (err) {
      console.error('Remote Config fetch failed', err);
      throw err;
    }
}

function connectEmulators(functions: Functions, remoteConfig: RemoteConfig) {
  if (location.hostname === 'localhost') {
    const host = getValue(remoteConfig, 'functionEmulatorHost').asString();
    const port = getValue(remoteConfig, 'functionEmulatorPort').asNumber();
    connectFunctionsEmulator(functions, host, port);
  }
}

