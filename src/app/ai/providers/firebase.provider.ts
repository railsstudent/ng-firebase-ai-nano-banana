import { inject, makeEnvironmentProviders } from '@angular/core';
import { getAI, getGenerativeModel, ModelParams, ResponseModality, VertexAIBackend } from 'firebase/ai';
import { FirebaseApp } from 'firebase/app';
import { getValue, RemoteConfig } from 'firebase/remote-config';
import { NANO_BANANA_MODEL } from '../constants/firebase.constant';
import { ConfigService } from '../services/config.service';

function getGenerativeAIModel(firebaseApp: FirebaseApp, remoteConfig: RemoteConfig) {
    const modelName = getValue(remoteConfig, 'geminiImageModelName').asString();
    const vertexAILocation = getValue(remoteConfig, 'vertexAILocation'). asString();
    const includeThoughts = getValue(remoteConfig, 'includeThoughts').asBoolean();
    const thinkingBudget = getValue(remoteConfig, 'thinkingBudget').asNumber();

    const modelParams: ModelParams = {
      model: modelName,
      generationConfig: {
          responseModalities: [ResponseModality.TEXT, ResponseModality.IMAGE],
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
            provide: NANO_BANANA_MODEL,
            useFactory: () => {
              const configService = inject(ConfigService);

              if (!configService.remoteConfig) {
                throw new Error('Remote config does not exist.');
              }

              if (!configService.firebaseApp) {
                throw new Error('Firebase App does not exist');
              }

              return getGenerativeAIModel(configService.firebaseApp, configService.remoteConfig);
            }
        }
    ]);
}
