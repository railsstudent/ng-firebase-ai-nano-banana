export type GenerateVideoRequest = {
  prompt: string;
  imageBytes: string;
  mimeType: string;
}

export type GenerateVideoFromFramesRequest = GenerateVideoRequest & {
  lastFrameImageBytes: string;
  lastFrameMimeType: string;
}


export type CallableNames = "videos-generateVideo" | "videos-interpolateVideo" | "videos-extendVideo";
