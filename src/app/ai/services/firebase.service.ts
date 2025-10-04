import { inject, Injectable } from '@angular/core';
import { InlineDataPart, Part } from 'firebase/ai';
import { NANO_BANANA_MODEL } from '../constants/firebase.constant';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService  {
    private readonly geminiModel = inject(NANO_BANANA_MODEL);

    private async fileToGenerativePart(file: File) {
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

    private async getBase64Image(parts: Array<string | Part>) {
      const result = await this.geminiModel.generateContent(parts);
      const inlineDataParts = result.response.inlineDataParts();
      if (inlineDataParts?.[0]) {
        const { data, mimeType } = inlineDataParts[0].inlineData;
        return `data:${mimeType};base64,${data}`;
      }
      throw new Error('Error in generating the image.');
    }

    private async resolveImageParts(imageFiles: File[]) {
      if (!imageFiles.length) {
        return [];
      }

      const imagePartResults = await Promise.allSettled(
        imageFiles.map(file => this.fileToGenerativePart(file))
      );
      return imagePartResults
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value);
    }

    async generateImage(prompt: string, imageFiles: File[]) {
        try {
          if (!prompt) {
            throw Error('Prompt is required to generate an image.');
          }

          const imageParts = await this.resolveImageParts(imageFiles);
          return await this.getBase64Image([prompt, ...imageParts]);
        } catch (err) {
          console.error('Prompt or candidate was blocked:', err);
          if (err instanceof Error) {
            throw err;
          }
          throw new Error('Error in generating the image.');
        }
    }
}
