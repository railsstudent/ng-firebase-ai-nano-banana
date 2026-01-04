import { inject, makeEnvironmentProviders } from '@angular/core';
import { getAI, getGenerativeModel, ModelParams, VertexAIBackend } from 'firebase/ai';
import { getValue } from 'firebase/remote-config';
import { GEMINI_IMAGE_MODEL } from '../constants/firebase.constant';
import { ConfigService } from '../services/config.service';

function getGenerativeAIModel(configService: ConfigService) {
    if (!configService.firebaseObjects) {
      throw new Error('Firebase objects do not exist.');
    }

    const { firebaseApp, remoteConfig } = configService.firebaseObjects;
    const modelName = getValue(remoteConfig, 'geminiImageModelName').asString();
    const vertexAILocation = getValue(remoteConfig, 'vertexAILocation'). asString();
    const includeThoughts = getValue(remoteConfig, 'includeThoughts').asBoolean();
    const thinkingBudget = getValue(remoteConfig, 'thinkingBudget').asNumber();

    const modelParams: ModelParams = {
      model: modelName,
      generationConfig: {
          candidateCount: 1,
          thinkingConfig: {
            includeThoughts,
            thinkingBudget,
          },
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

export function provideFirebase() {
    return makeEnvironmentProviders([
        {
            provide: GEMINI_IMAGE_MODEL,
            useFactory: () => {
              const configService = inject(ConfigService);

              if (!configService.firebaseObjects) {
                throw new Error('Firebase objects do not exist.');
              }

              return getGenerativeAIModel(configService);
            }
        }
    ]);
}
