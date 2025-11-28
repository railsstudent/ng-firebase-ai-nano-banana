import firebaseConfig from '@/firebase.json';
import { makeEnvironmentProviders } from '@angular/core';
import { getAI, getGenerativeModel, GoogleAIBackend, ModelParams, ResponseModality } from 'firebase/ai';
import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { NANO_BANANA_MODEL } from '../constants/firebase.constant';

const { app, geminiModelName = 'gemini-2.5-flash-image' } = firebaseConfig;
const firebaseApp = initializeApp(app);

(self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = firebaseConfig.appCheckDebugToken || firebaseConfig.isFirebaseAppCheckDebugMode;

// Initialize Firebase App Check
initializeAppCheck(firebaseApp, {
  provider: new ReCaptchaEnterpriseProvider(firebaseConfig.recaptchaEnterpriseSiteKey),
  isTokenAutoRefreshEnabled: true,
});

export function provideAngularFire() {
    return makeEnvironmentProviders([
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
