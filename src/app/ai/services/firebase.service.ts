import { inject, Injectable } from '@angular/core';
import { GenerativeModel, Part } from 'firebase/ai';
import { NANO_BANANA_MODEL } from '../constants/firebase.constant';
import { ImageResponse } from '../types/image-response.type';
import { getBase64EncodedString, resolveImageParts } from '../utils/inline-image-data.util';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService  {
    private readonly geminiModel = inject(NANO_BANANA_MODEL);

    private async getBase64Images(model: GenerativeModel, parts: Array<string | Part>): Promise<ImageResponse[]> {
      const result = await model.generateContent(parts);
      const inlineDataParts = result.response.inlineDataParts();

      if (inlineDataParts?.length) {
        return inlineDataParts.map(({inlineData}, index) => {
          const { data, mimeType } = inlineData;
          return {
            id: index,
            mimeType,
            data,
            inlineData: getBase64EncodedString(inlineData)
          };
        });
      }

      throw new Error('Error in generating the image.');
    }

    async generateImage(prompt: string, imageFiles: File[]): Promise<ImageResponse> {
        try {
          if (!prompt) {
            throw Error('Prompt is required to generate an image.');
          }

          const imageParts = await resolveImageParts(imageFiles);
          const parts = [prompt, ...imageParts];
          const [firstImage] = await this.getBase64Images(this.geminiModel, parts);

          return firstImage;
        } catch (err) {
          console.error('Prompt or candidate was blocked:', err);
          if (err instanceof Error) {
            throw err;
          }
          throw new Error('Error in generating the image.');
        }
    }

    createChat() {
      return this.geminiModel.startChat();
    }
}
