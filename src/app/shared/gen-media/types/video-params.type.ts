import { GenerateVideoRequest } from '@/ai/types/generate-video.type';

export type GenerateVideoRequestImageParams = Pick<GenerateVideoRequest, 'prompt' | 'imageBytes' | 'mimeType'>;

export type GenerateVideoFromFramesRequest = GenerateVideoRequestImageParams & {
  lastFrameImageBytes: string;
  lastFrameMimeType: string;
}
