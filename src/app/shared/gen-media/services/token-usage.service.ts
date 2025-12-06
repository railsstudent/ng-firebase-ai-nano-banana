import { ImageTokenUsage } from '@/ai/types/image-response.type';
import { TokenUsage } from '@/ai/types/token-usage.type';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenUsageService {
  calculateTokenUage(imageTokenUsages: ImageTokenUsage[]) {

    const defaultTokenUsage: TokenUsage = {
      totalTokenCount: 0,
      promptTokenCount: 0,
      outputTokenCount: 0,
      thoughtTokenCount: 0,
    };

    return imageTokenUsages.reduce((acc, item) => {
      const tokenUsage = item.tokenUsage;

      return {
        totalTokenCount: acc.totalTokenCount + tokenUsage.totalTokenCount,
        promptTokenCount: acc.promptTokenCount + tokenUsage.promptTokenCount,
        outputTokenCount: acc.outputTokenCount + tokenUsage.outputTokenCount,
        thoughtTokenCount: acc.thoughtTokenCount + tokenUsage.thoughtTokenCount,
      };
    }, defaultTokenUsage)
  }
}
