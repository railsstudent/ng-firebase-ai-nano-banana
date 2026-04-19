import { inject, makeEnvironmentProviders } from '@angular/core';
import { getAI, getGenerativeModel, ModelParams, ThinkingConfig, ThinkingLevel, VertexAIBackend } from 'firebase/ai';
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
    const { thinkingConfig = undefined, tools = [] } = createThinkingConfig(remoteConfig,modelName) || {};

    const modelParams: ModelParams = {
      model: modelName,
      generationConfig: {
          candidateCount: 1,
          thinkingConfig,
      },
      tools,
    };

    const ai = getAI(firebaseApp, {
      backend: new VertexAIBackend(vertexAILocation)
    });

    return getGenerativeModel(ai, modelParams);
}

function createThinkingConfig(remoteConfig: RemoteConfig, modelName: string) {
  if (['gemini-3.1-flash-image-preview'].includes(modelName)) {
    const rawThinkingLevel = getValue(remoteConfig, 'thinkingLevel').asString();
    const thinkingLevel = ThinkingLevel[rawThinkingLevel as keyof typeof ThinkingLevel];
    const thinkingConfig: ThinkingConfig = {
      thinkingLevel
    };

    return {
      thinkingConfig,
      tools: [
        {
          googleSearch: {}
        }
      ]
    };
  } else if ('gemini-3-pro-image-preview' == modelName) {
    const fallbackThinkingConfig: ThinkingConfig = {
      includeThoughts: true,
      thinkingBudget: 512,
    };

    return {
      thinkingConfig: fallbackThinkingConfig,
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
