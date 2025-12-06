import firebaseConfig from '@/firebase.json';
import { makeEnvironmentProviders } from '@angular/core';
import { getAI, getGenerativeModel, ModelParams, ResponseModality, VertexAIBackend } from 'firebase/ai';
import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { NANO_BANANA_MODEL } from '../constants/firebase.constant';

const { app, geminiModelName = 'gemini-2.5-flash-image' } = firebaseConfig;
const firebaseApp = initializeApp(app);

// Initialize Firebase App Check
initializeAppCheck(firebaseApp, {
  provider: new ReCaptchaEnterpriseProvider(firebaseConfig.recaptchaEnterpriseSiteKey),
  isTokenAutoRefreshEnabled: true,
});

export function provideFirebase() {
    return makeEnvironmentProviders([
        {
            provide: NANO_BANANA_MODEL,
            useFactory: () => {
              const ai = getAI(firebaseApp, {
                backend: new VertexAIBackend(firebaseConfig.vertexAILocation)
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
