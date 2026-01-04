import { Injectable } from '@angular/core';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Functions } from 'firebase/functions';
import { RemoteConfig } from 'firebase/remote-config';

@Injectable({
  providedIn: 'root'
})
export class ConfigService  {

    remoteConfig: RemoteConfig | undefined = undefined;
    firebaseApp: FirebaseApp | undefined = undefined;
    functions: Functions | undefined = undefined;
    db: Firestore | undefined = undefined;

    loadConfig(firebaseApp: FirebaseApp, remoteConfig: RemoteConfig, functions: Functions, db: Firestore) {
      this.firebaseApp = firebaseApp;
      this.remoteConfig = remoteConfig;
      this.functions = functions;
      this.db = db;
    }
}
