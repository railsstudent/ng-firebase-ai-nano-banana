import { inject, Injectable } from '@angular/core';
import { ChatSession } from 'firebase/ai';
import { GEMINI_IMAGE_MODEL } from '../constants/firebase.constant';
import { ImageTokenUsage } from '../types/image-response.type';
import { getBase64Images } from '../utils/generate-image.util';
import { resolveImageParts } from '../utils/inline-image-data.util';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService  {
    private readonly geminiModel = inject(GEMINI_IMAGE_MODEL);
    private readonly configService = inject(ConfigService);

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

    async asyncGenerateImage(prompt: string, imageFiles: File[]) {
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
