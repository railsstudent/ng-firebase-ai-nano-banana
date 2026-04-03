import { inject, makeEnvironmentProviders } from '@angular/core';
import { getAI, getGenerativeModel, ModelParams, ThinkingLevel, VertexAIBackend } from 'firebase/ai';
import { getValue, RemoteConfig } from 'firebase/remote-config';
import { GEMINI_IMAGE_MODEL } from '../constants/firebase.constant';
import { ConfigService } from '../services/config.service';

function getGenerativeAIImageModel(configService: ConfigService) {
    if (!configService.firebaseObjects) {
      throw new Error('Firebase objects do not exist.');
    }

    const { firebaseApp, remoteConfig } = configService.firebaseObjects;
    const modelName = getValue(remoteConfig, 'geminiImageModelName').asString();
    const vertexAILocation = getValue(remoteConfig, 'vertexAILocation'). asString();
    const thinkingConfig = createThinkingConfig(remoteConfig,modelName);

    const modelParams: ModelParams = {
      model: modelName,
      generationConfig: {
          candidateCount: 1,
          thinkingConfig,
      },
      tools: [
        {
          googleSearch: {}
        }
      ],
    };

    const ai = getAI(firebaseApp, {
      backend: new VertexAIBackend(vertexAILocation)
    });

    return getGenerativeModel(ai, modelParams);
}

function createThinkingConfig(remoteConfig: RemoteConfig, modelName: string) {
  if (modelName === 'gemini-3.1-flash-image-preview') {
    const rawThinkingLevel = getValue(remoteConfig, 'thinkingLevel').asString();
    const thinkingLevel = ThinkingLevel[rawThinkingLevel as keyof typeof ThinkingLevel];
    return {
      thinkingLevel
    };
  }

  return undefined;
}

export function provideFirebase() {
    return makeEnvironmentProviders([
        {
            provide: GEMINI_IMAGE_MODEL,
            useFactory: () => {
              const configService = inject(ConfigService);

              if (!configService.firebaseObjects) {
                throw new Error('Firebase objects do not exist.');
              }

              return getGenerativeAIImageModel(configService);
            }
        }
    ]);
}
