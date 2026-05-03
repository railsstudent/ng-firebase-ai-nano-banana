import { InjectionToken, inject } from '@angular/core';
import { FirebaseService } from '@/ai/services/firebase.service';
import { ImageTokenUsage } from '@/ai/types/image-response.type';

export interface ImageGenerator {
  generateImage(promptOrTemplateId: string, imageFiles: File[]): Promise<ImageTokenUsage | undefined>;
}

export const IMAGE_GENERATOR_TOKEN = new InjectionToken<ImageGenerator>('IMAGE_GENERATOR_TOKEN', {
  providedIn: 'root',
  factory: () => inject(FirebaseService)
});
