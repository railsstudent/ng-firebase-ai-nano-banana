import { FirebaseOptions } from 'firebase/app';

export type FirebaseConfigResponse = {
  app: FirebaseOptions;
  recaptchaSiteKey: string
}
