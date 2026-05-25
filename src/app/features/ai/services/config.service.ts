import { Injectable } from '@angular/core';
import { FirebaseObjects } from '../types/firebase-objects';

@Injectable({
  providedIn: 'root'
})
export class ConfigService  {
    firebaseObjects: FirebaseObjects | undefined = undefined;

    loadConfig(firebaseObjects: FirebaseObjects) {
      this.firebaseObjects = firebaseObjects;
    }
}
