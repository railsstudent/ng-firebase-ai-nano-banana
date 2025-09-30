import { makeEnvironmentProviders } from '@angular/core';
import { getAI, getGenerativeModel, GoogleAIBackend, ResponseModality } from 'firebase/ai';
import { initializeApp } from "firebase/app";
import firebaseConfig from '../../firebase-ai.json';
import { FIREBASE_AI, NANO_BANANA_MODEL } from '../constants/firebase.constant';

const { app, geminiModelName = 'gemini-2.5-flash-image-preview' } = firebaseConfig;
const firebaseApp = initializeApp(app);
const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });

export const DEFAULT_CONFIG = {
  model: geminiModelName,
  generationConfig: {
      responseModalities: [ResponseModality.TEXT, ResponseModality.IMAGE],
  }
};

export function provideFirebase() {
    return makeEnvironmentProviders([
        {
            provide: FIREBASE_AI,
            useFactory: () => ai,
        },
        {
            provide: NANO_BANANA_MODEL,
            useFactory: () => getGenerativeModel(ai, DEFAULT_CONFIG),
        },
    ]);
}
