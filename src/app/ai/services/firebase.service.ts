import { inject, Injectable } from '@angular/core';
import { getGenerativeModel, Part } from 'firebase/ai';
import { NANO_BANANA_MODEL, FIREBASE_AI } from '../constants/firebase.constant';
import { DEFAULT_CONFIG } from '../providers/firebase.provider';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService  {
    private readonly geminiModel = inject(NANO_BANANA_MODEL);
    private readonly firebaseAI = inject(FIREBASE_AI);

    // Prepare an image for the model to edit
    private async fileToGenerativePart(file: File) {
      const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result! as string).split(',')[1]);
        reader.readAsDataURL(file);
      });

      const base64EncodedData = await base64EncodedDataPromise;
      return {
        inlineData: { data: base64EncodedData, mimeType: file.type },
      };
    }

    async generateImage(prompt: string, imageFiles: File[] = []) {
        if (!prompt) {
            throw Error('Prompt is required to generate an image.');
        }

        // Handle the generated image
        try {
          const parts: Array<string | Part> = [prompt];
          if (imageFiles.length) {
            const imagePartResults = await Promise.allSettled(imageFiles.map(file => this.fileToGenerativePart(file)));
            const imageParts = imagePartResults.filter((result) => result.status === 'fulfilled')
              .map((result) => result.value);
            parts.push(...imageParts);
          }

          const result = await this.geminiModel.generateContent(parts);
          const inlineDataParts = result.response.inlineDataParts();
          if (inlineDataParts?.[0]) {
            const { data, mimeType } = inlineDataParts[0].inlineData;
            return `data:${mimeType};base64,${data}`;
          }
          throw new Error('Error in generating the image.');
        } catch (err) {
          console.error('Prompt or candidate was blocked:', err);
          if (err instanceof Error) {
            throw err;
          }
          throw new Error('Error in generating the image.');
        }
    }

    async generateImageWithSystemInstruction(config: { systemInstruction: string, imageFiles: File[]}) {
      if (!config.systemInstruction) {
          throw Error('System instruction is required to generate an image.');
      }

      // Handle the generated image
      try {
        const parts: Array<string | Part> = [];
        if (config.imageFiles.length) {
          const imagePartResults = await Promise.allSettled(config.imageFiles.map(file => this.fileToGenerativePart(file)));
          const imageParts = imagePartResults.filter((result) => result.status === 'fulfilled')
            .map((result) => result.value);
          parts.push(...imageParts);
        }

        if (!parts || parts.length === 0) {
          throw Error('At least one image file is required to generate an image with system instruction.');
        }

        const geminiModel = getGenerativeModel(this.firebaseAI, {
          ...DEFAULT_CONFIG,
          systemInstruction: config.systemInstruction,
        });

        const result = await geminiModel.generateContent(parts);
        const inlineDataParts = result.response.inlineDataParts();
        if (inlineDataParts?.[0]) {
          const { data, mimeType } = inlineDataParts[0].inlineData;
          return `data:${mimeType};base64,${data}`;
        }
        throw new Error('Error in generating the image.');
      } catch (err) {
        console.error('Prompt or candidate was blocked:', err);
        if (err instanceof Error) {
          throw err;
        }
        throw new Error('Error in generating the image.');
      }
  }
}
