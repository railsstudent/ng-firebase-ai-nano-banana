import { inject, Injectable } from '@angular/core';
import { FIGURINE_MODEL, NANO_BANANA_MODEL, RESTORE_PHOTO_MODEL } from '../constants/firebase.constant';
import { Part } from 'firebase/ai';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService  {
    geminiModel = inject(NANO_BANANA_MODEL);
    restorePhotoModel = inject(RESTORE_PHOTO_MODEL);
    figurineModel = inject(FIGURINE_MODEL);

    // Prepare an image for the model to edit
    private async fileToGenerativePart(file: File) {
      const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result! as string).split(',')[1]);
        reader.readAsDataURL(file);
      });

      const base64EncodedData = await base64EncodedDataPromise;
      console.log(base64EncodedData);
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
            const imageParts = await Promise.all(imageFiles.map(file => this.fileToGenerativePart(file)));
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
}
