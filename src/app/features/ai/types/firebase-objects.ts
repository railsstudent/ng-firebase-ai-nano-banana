import { FirebaseApp } from 'firebase/app';
import { Functions } from 'firebase/functions';
import { RemoteConfig } from 'firebase/remote-config';

export type FirebaseObjects = {
  firebaseApp: FirebaseApp;
  remoteConfig: RemoteConfig;
  functions: Functions;
}
