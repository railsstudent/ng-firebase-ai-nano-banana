import firebaseConfig from '@/firebase.json';
import { makeEnvironmentProviders } from '@angular/core';
import { getAI, getGenerativeModel, GoogleAIBackend, ModelParams, ResponseModality } from '@angular/fire/ai';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { initializeAppCheck, provideAppCheck, ReCaptchaEnterpriseProvider } from "@angular/fire/app-check";
import { NANO_BANANA_MODEL } from '../constants/firebase.constant';

const { app, geminiModelName = 'gemini-2.5-flash-image' } = firebaseConfig;
const firebaseApp = initializeApp(app);

(self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = firebaseConfig.appCheckDebugToken || firebaseConfig.isFirebaseAppCheckDebugMode;

// Initialize Firebase App Check
const appCheck = initializeAppCheck(firebaseApp, {
  provider: new ReCaptchaEnterpriseProvider(firebaseConfig.recaptchaEnterpriseSiteKey),
  isTokenAutoRefreshEnabled: true,
});

export function provideAngularFire() {
    return makeEnvironmentProviders([
        provideFirebaseApp(() => firebaseApp),
        provideAppCheck(() => appCheck),
        {
            provide: NANO_BANANA_MODEL,
            useFactory: () => {
              const ai = getAI(firebaseApp, {
                backend: new GoogleAIBackend()
              });

              const DEFAULT_CONFIG: ModelParams = {
                model: geminiModelName,
                generationConfig: {
                    responseModalities: [ResponseModality.IMAGE],
                    candidateCount: 1,
                }
              };
              return getGenerativeModel(ai, DEFAULT_CONFIG);
            }
        }
    ]);
}
