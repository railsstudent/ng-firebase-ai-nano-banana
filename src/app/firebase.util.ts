import remoteConfigDefaults from '@/firebase-project/remoteconfig.defaults.json';
import { isDevMode } from '@angular/core';
import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { fetchAndActivate, getRemoteConfig, getValue, RemoteConfig } from 'firebase/remote-config';
import { FirebaseObjects } from './ai/types/firebase-objects';

async function fetchRemoteConfig(firebaseApp: FirebaseApp): Promise<RemoteConfig> {
  const remoteConfig = getRemoteConfig(firebaseApp);
  remoteConfig.settings.minimumFetchIntervalMillis = isDevMode() ? 0 : 3600000;
  remoteConfig.defaultConfig = remoteConfigDefaults;
  await fetchAndActivate(remoteConfig);
  return remoteConfig;
}

export async function initFirebaseApp(app: FirebaseOptions): Promise<FirebaseObjects> {
  const firebaseApp = initializeApp(app);
  const remoteConfig = await fetchRemoteConfig(firebaseApp);
  const functionRegion = getValue(remoteConfig, 'functionRegion').asString();
  const functions = getFunctions(firebaseApp, functionRegion);
  console.log('bootstrapFirebase -> functionRegion', functionRegion);
  console.log('bootstrapFirebase -> functions region', functions.region);
  return { firebaseApp, remoteConfig, functions };
}

export function connectEmulators({ remoteConfig, functions }: FirebaseObjects) {
  const useEmulators = getValue(remoteConfig, 'useEmulators').asBoolean();
  if (useEmulators) {
    console.log('Connecting to emulators...');
    const host = getValue(remoteConfig, 'functionEmulatorHost').asString();
    const port = getValue(remoteConfig, 'functionEmulatorPort').asNumber();
    console.log('functionEmulator', `${host}:${port}`);
    connectFunctionsEmulator(functions, host, port);
  }
}
