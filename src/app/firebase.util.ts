import remoteConfigDefaults from '@/firebase-project/remoteconfig.defaults.json';
import { HttpClient } from '@angular/common/http';
import { inject, isDevMode } from '@angular/core';
import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { fetchAndActivate, getRemoteConfig, getValue, RemoteConfig } from 'firebase/remote-config';
import { catchError, lastValueFrom, throwError } from 'rxjs';
import config from '../../public/config.json';
import { FirebaseConfigResponse } from './ai/types/firebase-config.type';
import { FirebaseObjects } from './ai/types/firebase-objects';

async function fetchRemoteConfig(firebaseApp: FirebaseApp): Promise<RemoteConfig> {
  const remoteConfig = getRemoteConfig(firebaseApp);
  remoteConfig.settings.minimumFetchIntervalMillis = isDevMode() ? 0 : 3600000;
  remoteConfig.defaultConfig = remoteConfigDefaults;
  await fetchAndActivate(remoteConfig);
  return remoteConfig;
}

export async function initFbServices(app: FirebaseOptions): Promise<FirebaseObjects> {
  const firebaseApp = initializeApp(app);
  const remoteConfig = await fetchRemoteConfig(firebaseApp);
  const functionRegion = getValue(remoteConfig, 'functionRegion').asString();
  const functions = getFunctions(firebaseApp, functionRegion);
  const db = getFirestore(firebaseApp);
  console.log('bootstrapFirebase -> functionRegion', functionRegion);
  console.log('bootstrapFirebase -> functions region', functions.region);
  return { firebaseApp, remoteConfig, functions, db };
}

export function connectEmulators({ remoteConfig, functions, db }: FirebaseObjects) {
  if (location.hostname === 'localhost') {
    const host = getValue(remoteConfig, 'functionEmulatorHost').asString();
    const port = getValue(remoteConfig, 'functionEmulatorPort').asNumber();
    console.log('functionEmulator', `${host}:${port}`);
    connectFunctionsEmulator(functions, host, port);
    const dbHost = getValue(remoteConfig, 'dbEmulatorHost').asString();
    const dbPort = getValue(remoteConfig, 'dbEmulatorPort').asNumber();
    console.log('fireStoreEmulator', `${dbHost}:${dbPort}`);
    connectFirestoreEmulator(db, host, dbPort);
  }
}

export async function loadFirebaseConfig() {
  const httpService = inject(HttpClient);
  const firebaseConfig$ =
    httpService.get<FirebaseConfigResponse>(`${config.appUrl}/getFirebaseConfig`)
      .pipe(
        catchError((e) => throwError(() => e))
      );
  return lastValueFrom(firebaseConfig$);
}
