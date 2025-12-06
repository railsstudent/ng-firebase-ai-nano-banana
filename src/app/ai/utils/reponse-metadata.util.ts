import { UsageMetadata } from 'firebase/ai';
import { TokenUsage } from '../types/token-usage.type';

export function getTokenUsage(usageMetadata?: UsageMetadata): TokenUsage {
  const totalTokenCount = usageMetadata?.totalTokenCount || 0;
  const promptTokenCount = usageMetadata?.promptTokenCount || 0;
  const outputTokenCount = usageMetadata?.candidatesTokenCount || 0;
  const thoughtTokenCount = usageMetadata?.thoughtsTokenCount || 0;

  console.log('Input tokens', promptTokenCount,
      'Output tokens', outputTokenCount,
     'Total tokens', totalTokenCount,
     'Thought tokens', thoughtTokenCount
    );

  return {
    totalTokenCount,
    promptTokenCount,
    outputTokenCount,
    thoughtTokenCount,
  }
}
