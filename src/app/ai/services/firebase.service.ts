import { inject, Injectable } from '@angular/core';
import { ChatSession, GenerativeModel, Part } from 'firebase/ai';
import { NANO_BANANA_MODEL } from '../constants/firebase.constant';
import { ImagesWithTokenUsage, ImageTokenUsage } from '../types/image-response.type';
import { getBase64EncodedString, resolveImageParts } from '../utils/inline-image-data.util';
import { getTokenUsage } from '../utils/reponse-metadata.util';

async function getBase64Images(model: GenerativeModel, parts: Array<string | Part>): Promise<ImagesWithTokenUsage> {
  const result = await model.generateContent(parts);

  const tokenUsage = getTokenUsage(result.response.usageMetadata);
  const inlineDataParts = result.response.inlineDataParts();
  const thinkingSummary = result.response.thoughtSummary();

  console.log('thinkingSummary', thinkingSummary);

  if (inlineDataParts?.length) {
    const images = inlineDataParts.map(({inlineData}, index) => {
      const { data, mimeType } = inlineData;
      return {
        id: index,
        mimeType,
        data,
        inlineData: getBase64EncodedString(inlineData)
      };
    });

    return {
      images,
      tokenUsage,
    };
  }

  throw new Error('Error in generating the image.');
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService  {
    private readonly geminiModel = inject(NANO_BANANA_MODEL);

    async generateImage(prompt: string, imageFiles: File[]): Promise<ImageTokenUsage> {
        try {
          if (!prompt) {
            throw Error('Prompt is required to generate an image.');
          }

          const imageParts = await resolveImageParts(imageFiles);
          const parts = [prompt, ...imageParts];
          const { images, tokenUsage } = await getBase64Images(this.geminiModel, parts);

          return {
            image: images[0],
            tokenUsage
          };
        } catch (err) {
          console.error('Prompt or candidate was blocked:', err);
          if (err instanceof Error) {
            throw err;
          }
          throw new Error('Error in generating the image.');
        }
    }

    createChat(): ChatSession {
      return this.geminiModel.startChat();
    }
}
