import { inject, Injectable } from '@angular/core';
import { ChatSession, GenerativeModel, Part } from 'firebase/ai';
import { GEMINI_IMAGE_MODEL } from '../constants/firebase.constant';
import { ImageTokenUsage } from '../types/image-response.type';
import { getBase64EncodedString, resolveImageParts } from '../utils/inline-image-data.util';
import { constructCitations, getTokenUsage } from '../utils/reponse-metadata.util';

async function getBase64Images(model: GenerativeModel, parts: Array<string | Part>): Promise<ImageTokenUsage> {
  const result = await model.generateContent(parts);

  const response = result.response;
  const tokenUsage = getTokenUsage(response.usageMetadata);
  const inlineDataParts = response.inlineDataParts();
  const thoughtSummary = response.thoughtSummary() || '';
  const citations = constructCitations(response.candidates?.[0]?.groundingMetadata);

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

    if (images.length <= 0) {
      throw new Error('Error in generating the image.');
    }

    return {
      image: images[0],
      tokenUsage,
      thoughtSummary,
      metadata: citations,
    };
  }

  throw new Error('Error in generating the image.');
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService  {
    private readonly geminiModel = inject(GEMINI_IMAGE_MODEL);

    async generateImage(prompt: string, imageFiles: File[]): Promise<ImageTokenUsage> {
        try {
          if (!prompt) {
            throw Error('Prompt is required to generate an image.');
          }

          const imageParts = await resolveImageParts(imageFiles);
          const parts = [prompt, ...imageParts];
          return await getBase64Images(this.geminiModel, parts);
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
