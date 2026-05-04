import { inject, Injectable } from '@angular/core';
import { SERVER_TEMPLATE_MODEL } from '../constants/firebase.constant';
import { GenerateImageParam } from '../types/generate-image-param.type';
import { ImageTokenUsage } from '../types/image-response.type';
import { getTemplateBase64Images } from '../utils/generate-image.util';
import { resolveImageParts } from '../utils/inline-image-data.util';

@Injectable({
  providedIn: 'root'
})
export class ServerTemplateService  {
    private readonly serverTemplateModel = inject(SERVER_TEMPLATE_MODEL);

    async generateImage(genImageParameter: GenerateImageParam): Promise<ImageTokenUsage> {
        try {
          const { templateParam = undefined, imageFiles } = genImageParameter
          const templateId = templateParam?.templateId;

          if (!templateId) {
            throw Error('Template ID is required to generate an image.');
          }

          const aspectRatio = templateParam?.aspectRatio || '';
          const resolution = templateParam?.resolution || '';
          console.log('Template id', templateId, 'aspect ratio', aspectRatio, 'resolution', resolution)

          const imageParts = await resolveImageParts(imageFiles)
          const inlineImages = imageParts.map(part => part.inlineData);
          return getTemplateBase64Images(this.serverTemplateModel, templateId,
            {
              inlineImages,
              aspectRatio,
              resolution
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
