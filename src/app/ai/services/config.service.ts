import { Injectable } from '@angular/core';
import { FirebaseApp } from 'firebase/app';
import { RemoteConfig } from 'firebase/remote-config';

@Injectable({
  providedIn: 'root'
})
export class ConfigService  {

    remoteConfig: RemoteConfig | undefined = undefined;
    firebaseApp: FirebaseApp | undefined = undefined;

    loadConfig(firebaseApp: FirebaseApp, remoteConfig: RemoteConfig) {
      this.firebaseApp = firebaseApp;
      this.remoteConfig = remoteConfig;
    }
}
