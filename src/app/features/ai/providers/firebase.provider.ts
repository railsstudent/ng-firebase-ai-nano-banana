import { inject, makeEnvironmentProviders } from '@angular/core';
import { getAI, getTemplateGenerativeModel, VertexAIBackend } from 'firebase/ai';
import { getValue } from 'firebase/remote-config';
import { SERVER_TEMPLATE_MODEL, VERTEX_AI_BACKEND } from '../constants/firebase.constant';
import { ConfigService } from '../services/config.service';

export function provideFirebase() {
    return makeEnvironmentProviders([
        {
          provide: VERTEX_AI_BACKEND,
          useFactory: () => {
            const configService = inject(ConfigService);
            const vertexAILocation = getValue(configService.remoteConfig, 'vertexAILocation'). asString();
            const ai = getAI(configService.app, {
              backend: new VertexAIBackend(vertexAILocation)
            });

            return ai;
          }
        },
        {
          provide: SERVER_TEMPLATE_MODEL,
          useFactory: () => {
            const ai = inject(VERTEX_AI_BACKEND); // Ensure Vertex AI backend is initialized before the model
            return getTemplateGenerativeModel(ai);
          }
        }
    ]);
}
