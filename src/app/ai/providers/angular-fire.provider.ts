import firebaseConfig from '@/firebase.json';
import { makeEnvironmentProviders } from '@angular/core';
import { getAI, getGenerativeModel, GoogleAIBackend, ModelParams, ResponseModality } from '@angular/fire/ai';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { NANO_BANANA_MODEL } from '../constants/firebase.constant';

const { app, geminiModelName = 'gemini-2.5-flash-image' } = firebaseConfig;
const firebaseApp = initializeApp(app);
const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });

const DEFAULT_CONFIG: ModelParams = {
  model: geminiModelName,
  generationConfig: {
      responseModalities: [ResponseModality.IMAGE],
      candidateCount: 1,
  }
};

export function provideAngularFire() {
    return makeEnvironmentProviders([
        provideFirebaseApp(() => firebaseApp),
        {
            provide: NANO_BANANA_MODEL,
            useFactory: () => getGenerativeModel(ai, DEFAULT_CONFIG),
        }
    ]);
}
