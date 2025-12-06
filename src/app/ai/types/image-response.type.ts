import { TokenUsage } from './token-usage.type';

export type ImageResponseWithoutId = {
  data: string;
  mimeType: string;
  inlineData: string;
}


export type ImageResponse = ImageResponseWithoutId & {
  id: number;
}

export type ImagesWithTokenUsage = {
  images: ImageResponse[];
  tokenUsage: TokenUsage;
  thinkingSummary: string;
}

export type ImageTokenUsage = {
  image: ImageResponse,
  tokenUsage: TokenUsage
  thinkingSummary: string;
}

