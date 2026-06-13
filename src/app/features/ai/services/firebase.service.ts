import { inject, Injectable } from '@angular/core';
import { ChatSession, getGenerativeModel, ImageConfigAspectRatio, ImageConfigImageSize, ModelParams } from 'firebase/ai';
import { VERTEX_AI_BACKEND } from '../constants/firebase.constant';
import { GenerateImageParam } from '../types/generate-image-param.type';
import { ImageTokenUsage } from '../types/image-response.type';
import { getBase64Images } from '../utils/generate-image.util';
import { resolveImageParts } from '../utils/inline-image-data.util';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService  {
    #configService = inject(ConfigService);
    #ai = inject(VERTEX_AI_BACKEND);

    private createModelParams(aspectRatio?: ImageConfigAspectRatio | string, imageSize?: ImageConfigImageSize | string): ModelParams {
      const isValidAspectRatio = Object.values(ImageConfigAspectRatio).includes(aspectRatio as any);
      const isValidImageSize = Object.values(ImageConfigImageSize).includes(imageSize as any);

      const modelParams: ModelParams = {
        model: this.#configService.modelName,
        generationConfig: {
            candidateCount: 1,
            thinkingConfig: this.#configService.thinkingConfig,
            imageConfig: {
              aspectRatio: isValidAspectRatio ? (aspectRatio as ImageConfigAspectRatio) : ImageConfigAspectRatio.LANDSCAPE_4x3,
              imageSize: isValidImageSize ? imageSize as ImageConfigImageSize : ImageConfigImageSize.SIZE_1K,
            }
        },
        tools: this.#configService.tools,
      };
      return modelParams;
    }

    async generateImage(genImageParameter: GenerateImageParam): Promise<ImageTokenUsage | undefined> {
        try {
          const { prompt, imageFiles, aspectRatio, resolution } = genImageParameter;
          if (!prompt) {
            return undefined;
          }

          const modelParams = this.createModelParams(aspectRatio, resolution);
          const geminiModel = getGenerativeModel(this.#ai, modelParams);

          const imageParts = await resolveImageParts(imageFiles);
          const parts = [prompt, ...imageParts];
          return await getBase64Images({ model: geminiModel, parts });
        } catch (err) {
          console.error('Prompt or candidate was blocked:', err);
          if (err instanceof Error) {
            throw err;
          }
          throw new Error('Error in generating the image.');
        }
    }

    createChat(): ChatSession {
      const modelParams = this.createModelParams(
        ImageConfigAspectRatio.SQUARE_1x1,
        ImageConfigImageSize.SIZE_1K
      );
      const geminiModel = getGenerativeModel(this.#ai, modelParams);
      return geminiModel.startChat();
    }
}
