import { GenerateVideoRequest } from '@/ai/types/generate-video.type';

export type GenerateVideoRequestImageParams = Pick<GenerateVideoRequest, 'prompt' | 'imageBytes' | 'mimeType'> & {
  isVeo31Used?: boolean;
};

export type GenerateVideoFromFramesRequest = GenerateVideoRequestImageParams & {
  lastFrameImageBytes: string;
  lastFrameMimeType: string;
}
