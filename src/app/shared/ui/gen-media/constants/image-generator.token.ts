import { FirebaseService } from '@/features/ai/services/firebase.service';
import { ImageGenerator } from '@/shared/ui/gen-media/interfaces/image-generator.interface';
import { InjectionToken, inject } from '@angular/core';

export const IMAGE_GENERATOR_TOKEN = new InjectionToken<ImageGenerator>('IMAGE_GENERATOR_TOKEN', {
  providedIn: 'root',
  factory: () => inject(FirebaseService)
});
