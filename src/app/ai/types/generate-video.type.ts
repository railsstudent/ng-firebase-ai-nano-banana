import { GenerateVideosConfig } from '@google/genai';

export type GenerateVideoRequest = {
  prompt: string;
  imageBytes: string;
  mimeType: string;
  config?: GenerateVideosConfig;
}
