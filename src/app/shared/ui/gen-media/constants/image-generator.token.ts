import { FirebaseService } from '@/ai/services/firebase.service';
import { GenerateImageParam } from '@/ai/types/generate-image-param.type';
import { ImageTokenUsage } from '@/ai/types/image-response.type';
import { InjectionToken, inject } from '@angular/core';

export interface ImageGenerator {
  generateImage(param: GenerateImageParam): Promise<ImageTokenUsage | undefined>;
}

export const IMAGE_GENERATOR_TOKEN = new InjectionToken<ImageGenerator>('IMAGE_GENERATOR_TOKEN', {
  providedIn: 'root',
  factory: () => inject(FirebaseService)
});
