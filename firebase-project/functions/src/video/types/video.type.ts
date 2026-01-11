import { GenerateVideosConfig, GoogleGenAI } from "@google/genai";

export type GenerateVideoParams = {
  prompt: string;
  imageBytes: string;
  mimeType: string;
  config?: GenerateVideosConfig;
}

export type VideoTask = GenerateVideoParams & {
  taskId: string;
}

export type AIVideoBucket = {
  ai: GoogleGenAI;
  model: string;
  storageBucket: string;
  isVeo31Used: boolean;
  pollingPeriod: number;
}

export type GenerateVideoFromFramesParams = GenerateVideoParams & {
  lastFrameImageBytes: string;
  lastFrameMimeType: string;
}
