import { GroundingMetadata, UsageMetadata, WebGroundingChunk } from 'firebase/ai';
import { TokenUsage } from '../types/token-usage.type';

export function getTokenUsage(usageMetadata?: UsageMetadata): TokenUsage {
  const totalTokenCount = usageMetadata?.totalTokenCount || 0;
  const promptTokenCount = usageMetadata?.promptTokenCount || 0;
  const outputTokenCount = usageMetadata?.candidatesTokenCount || 0;
  const thoughtTokenCount = usageMetadata?.thoughtsTokenCount || 0;

  return {
    totalTokenCount,
    promptTokenCount,
    outputTokenCount,
    thoughtTokenCount,
  }
}

export function constructCitations(groundingMetadata?: GroundingMetadata) {
    const supports = groundingMetadata?.groundingSupports || [];
    const citations: WebGroundingChunk[] = [];
    for (const support of supports) {
      const indices = support.groundingChunkIndices || [];
      for (const index of indices) {
        const chunk = groundingMetadata?.groundingChunks?.[index];
        if (chunk?.web) {
          citations.push(chunk?.web);
        }
      }
    }

    const renderedContent = groundingMetadata?.searchEntryPoint?.renderedContent || '';
    const searchQueries = (groundingMetadata?.webSearchQueries || [])
      .filter((queries) => !!queries);

    return {
      citations,
      renderedContent,
      searchQueries
    };
}

