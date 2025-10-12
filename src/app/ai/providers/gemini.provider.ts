import { makeEnvironmentProviders } from '@angular/core';
import { GoogleGenAI } from "@google/genai";
import firebaseConfig from '../../firebase-ai.json';
import { GEMINI_AI } from '../constants/gemini.constant';

export function provideGemini() {
  return makeEnvironmentProviders([
    {
      provide: GEMINI_AI,
      useFactory: () => new GoogleGenAI({
        apiKey: firebaseConfig.geminiAPIKey
      })
    }
  ])
}
