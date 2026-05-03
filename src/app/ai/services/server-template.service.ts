import { inject, Injectable } from '@angular/core';
import { SERVER_TEMPLATE_MODEL } from '../constants/firebase.constant';
import { ImageTokenUsage } from '../types/image-response.type';
import { getTemplateBase64Images } from '../utils/generate-image.util';
import { resolveImageParts } from '../utils/inline-image-data.util';

@Injectable({
  providedIn: 'root'
})
export class ServerTemplateService  {
    private readonly serverTemplateModel = inject(SERVER_TEMPLATE_MODEL);

    async generateImage(templateId: string, imageFiles: File[]): Promise<ImageTokenUsage> {
        try {
          if (!templateId) {
            throw Error('Template ID is required to generate an image.');
          }

          const imageParts = await resolveImageParts(imageFiles)
          const inlineImages = imageParts.map(part => part.inlineData);
          return getTemplateBase64Images(this.serverTemplateModel, templateId, { inlineImages });
        } catch (err) {
          console.error('Prompt or candidate was blocked:', err);
          if (err instanceof Error) {
            throw err;
          }
          throw new Error('Error in generating the image.');
        }
    }
}
