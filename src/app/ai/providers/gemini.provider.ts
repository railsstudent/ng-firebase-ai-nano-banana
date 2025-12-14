import { inject, makeEnvironmentProviders } from '@angular/core';
import { GoogleGenAI } from "@google/genai";
import { GEMINI_AI, IS_VEO31_USED } from '../constants/gemini.constant';
import { ConfigService } from '../services/config.service';
import { getValue } from 'firebase/remote-config';

export function provideGemini() {
  const configService = inject(ConfigService);
  const remoteConfig = configService.remoteConfig;

  if (!remoteConfig) {
    throw new Error('Remote config does not exist.');
  }

  const isVeo31Used = getValue(remoteConfig, 'isVeo31Used').asBoolean();
  return makeEnvironmentProviders([
    {
      provide: GEMINI_AI,
      useFactory: () => new GoogleGenAI({
        vertexai: true,
        apiKey: firebaseConfig.geminiAPIKey,
      })
    },
    {
      provide: IS_VEO31_USED,
      useValue: isVeo31Used,
    }
  ])
}
