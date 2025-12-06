import { MetadataGroup } from '@/ai/types/grounding-metadata.type';
import { ImageResponse, ImagesWithTokenUsage } from '@/ai/types/image-response.type';
import { TokenUsage } from '@/ai/types/token-usage.type';

export const DEFAULT_IMAGES_TOKEN_USAGE: ImagesWithTokenUsage = {
    images: [] as ImageResponse[],
    tokenUsage: {
      totalTokenCount: 0,
      promptTokenCount: 0,
      outputTokenCount: 0,
      thoughtTokenCount: 0,
    } as TokenUsage,
    groundingMetadata: {
      searchQueries: [],
      citations: [],
      renderedContents: []
    } as MetadataGroup,
    thinkingSummaries: [] as string[]
};
