import { Injectable } from '@angular/core';
import { FirebaseApp } from 'firebase/app';
import { Functions } from 'firebase/functions';
import { RemoteConfig } from 'firebase/remote-config';

@Injectable({
  providedIn: 'root'
})
export class ConfigService  {

    remoteConfig: RemoteConfig | undefined = undefined;
    firebaseApp: FirebaseApp | undefined = undefined;
    functions: Functions | undefined = undefined;

    loadConfig(firebaseApp: FirebaseApp, remoteConfig: RemoteConfig, functions: Functions) {
      this.firebaseApp = firebaseApp;
      this.remoteConfig = remoteConfig;
      this.functions = functions;
    }
}
