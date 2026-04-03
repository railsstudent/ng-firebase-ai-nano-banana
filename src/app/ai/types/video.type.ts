export type GenerateVideoRequest = {
  prompt: string;
  imageBytes: string;
  mimeType: string;
}

export type GenerateVideoFromFramesRequest = GenerateVideoRequest & {
  lastFrameImageBytes: string;
  lastFrameMimeType: string;
}

export type ExtendVideoRequest = {
  prompt: string;
  video: { uri: string };
}

export type VideoGenerationResponse = {
  gcsUri: string;
  url: string;
}

export type CallableNames = "videos-generateVideo" | "videos-interpolateVideo";
