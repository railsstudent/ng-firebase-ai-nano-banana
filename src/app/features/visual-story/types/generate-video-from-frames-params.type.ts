import { ImageResponse } from '@/features/ai/types/image-response.type';

export type GenerateVideoFromFramesParams = {
  userPrompt: string;
  firstImage: ImageResponse | undefined;
  lastImage: ImageResponse | undefined;
};
