import { makeEnvironmentProviders } from '@angular/core';
import { GoogleGenAI } from "@google/genai";
import firebaseConfig from '../../firebase-ai.json';
import { GEMINI_AI, FIRST_LAST_FRAMES_VIDEO_ENABLED } from '../constants/gemini.constant';

export function provideGemini() {
  return makeEnvironmentProviders([
    {
      provide: GEMINI_AI,
      useFactory: () => new GoogleGenAI({
        apiKey: firebaseConfig.geminiAPIKey,
      })
    },
    {
      provide: FIRST_LAST_FRAMES_VIDEO_ENABLED,
      useValue: firebaseConfig.first_last_frames_video_enabled,
    }
  ])
}
