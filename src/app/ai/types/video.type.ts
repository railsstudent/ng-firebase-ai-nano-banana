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
  video?: { uri: string, mimeType: string };
}

export type VideoGenerationResponse = {
  uri: string;
  url: string;
  mimeType: string;
}

export type DownloadVideoResponse = {
  uri: string;
  mimeType: string;
}

export type CallableNames = "videos-generateVideo" | "videos-interpolateVideo" | "videos-extendVideo";
