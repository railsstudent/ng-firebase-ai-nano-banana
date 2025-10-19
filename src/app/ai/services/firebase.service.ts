import { inject, Injectable } from '@angular/core';
import { GenerativeModel, InlineDataPart, Part } from 'firebase/ai';
import { NANO_BANANA_MODEL } from '../constants/firebase.constant';
import { ImageResponse } from '../types/image-response.type';

async function fileToGenerativePart(file: File) {
  return await new Promise<InlineDataPart>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve({
      inlineData: {
        data: (reader.result! as string).split(',')[1],
        mimeType: file.type
      }
    });
    reader.readAsDataURL(file);
  });
}

async function resolveImageParts(imageFiles: File[]) {
  if (!imageFiles.length) {
    return [];
  }

  const imagePartResults = await Promise.allSettled(
    imageFiles.map(file => fileToGenerativePart(file))
  );
  return imagePartResults
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);
}

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
            inlineData: `data:${mimeType};base64,${data}`
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
}
