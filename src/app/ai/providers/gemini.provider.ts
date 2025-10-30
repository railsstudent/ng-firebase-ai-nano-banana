import { makeEnvironmentProviders } from '@angular/core';
import { GoogleGenAI } from "@google/genai";
import firebaseConfig from '../../firebase-ai.json';
import { GEMINI_AI, IS_VEO31_USED } from '../constants/gemini.constant';

export function provideGemini() {
  return makeEnvironmentProviders([
    {
      provide: GEMINI_AI,
      useFactory: () => new GoogleGenAI({
        apiKey: firebaseConfig.geminiAPIKey,
      })
    },
    {
      provide: IS_VEO31_USED,
      useValue: firebaseConfig.is_veo31_used,
    }
  ])
}
