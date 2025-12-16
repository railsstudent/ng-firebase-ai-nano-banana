import { GenerateVideoRequest } from '@/ai/types/generate-video.type';

export type GenerateVideoFromFramesRequest = GenerateVideoRequest & {
  lastFrameImageBytes: string;
  lastFrameMimeType: string;
}
