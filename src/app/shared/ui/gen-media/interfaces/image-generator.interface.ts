import { GenerateImageParam } from '@/features/ai/types/generate-image-param.type';
import { ImageTokenUsage } from '@/features/ai/types/image-response.type';

export interface ImageGenerator {
  generateImage(param: GenerateImageParam): Promise<ImageTokenUsage | undefined>;
}
