import { SERVER_TEMPLATE_MODEL } from '@/features/ai/constants/firebase.constant';
import { GenerateImageParam } from '@/features/ai/types/generate-image-param.type';
import { ImageTokenUsage } from '@/features/ai/types/image-response.type';
import { getTemplateBase64Images } from '@/features/ai/utils/generate-image.util';
import { makeTemplateVaraibles } from '@/features/ai/utils/inline-image-data.util';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServerTemplateService  {
    private readonly serverTemplateModel = inject(SERVER_TEMPLATE_MODEL);

    async generateImage(genImageParameter: GenerateImageParam): Promise<ImageTokenUsage | undefined> {
        try {
          const { templateId } = genImageParameter;
          if (!templateId) {
            return undefined;
          }

          const templateVariables = await makeTemplateVaraibles(genImageParameter);
          return getTemplateBase64Images({
            model: this.serverTemplateModel,
            templateId,
            templateVariables,
          });
        } catch (err) {
          console.error('Prompt or candidate was blocked:', err);
          if (err instanceof Error) {
            throw err;
          }
          throw new Error('Error in generating the image.');
        }
    }
}
