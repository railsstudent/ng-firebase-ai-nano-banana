import { GenerateVideosConfig, GoogleGenAI } from "@google/genai";

export type GenerateVideoRequest = {
  prompt: string;
  imageBytes: string;
  mimeType: string;
  config?: GenerateVideosConfig;
}

export type AIVideoBucket = {
  ai: GoogleGenAI;
  model: string;
  storageBucket: string;
  isVeo31Used: boolean;
  pollingPeriod: number;
}

export type GenerateVideoFromFramesRequest = GenerateVideoRequest & {
  lastFrameImageBytes: string;
  lastFrameMimeType: string;
}
