export type ImageResponseWithoutId = {
  data: string;
  mimeType: string;
  inlineData: string;
}


export type ImageResponse = ImageResponseWithoutId & {
  id: number;
}
