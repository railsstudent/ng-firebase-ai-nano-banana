import { FinishReason, GenerativeModel, Part } from 'firebase/ai';
import { ImageTokenUsage } from '../types/image-response.type';
import { constructCitations, getTokenUsage } from './reponse-metadata.util';
import { getBase64EncodedString } from './inline-image-data.util';

export async function getBase64Images(model: GenerativeModel, parts: Array<string | Part>): Promise<ImageTokenUsage> {
  const result = await model.generateContent(parts);

  const response = result.response;
  const tokenUsage = getTokenUsage(response.usageMetadata);
  const inlineDataParts = response.inlineDataParts();
  const thoughtSummary = response.thoughtSummary() || '';
  const citations = constructCitations(response.candidates?.[0]?.groundingMetadata);

  if (inlineDataParts?.length) {
    const images = inlineDataParts.map(({inlineData}, index) => {
      const { data, mimeType } = inlineData;
      return {
        id: index,
        mimeType,
        data,
        inlineData: getBase64EncodedString(inlineData)
      };
    });

    if (images.length <= 0) {
      throw new Error('Error in generating the image.');
    }

    return {
      image: images[0],
      tokenUsage,
      thoughtSummary,
      metadata: citations,
    };
  } else {
    response.candidates?.forEach((candidate) => {
      if (candidate.finishReason) {
        if (candidate.finishReason === FinishReason.PROHIBITED_CONTENT) {
          console.error( candidate.finishReason, candidate.finishMessage);
          throw new Error('Image content prohibited. Please edit your prompt');
        } else if (candidate.finishReason === FinishReason.BLOCKLIST) {
          console.error( candidate.finishReason,candidate.finishMessage);
          throw new Error('Content contains forbidden terms. Please edit your prompt');
        } else if (candidate.finishReason === FinishReason.SAFETY) {
          console.error( candidate.finishReason,candidate.finishMessage);
          throw new Error('Content was flagged for safety reasons. Please edit your prompt');
        } else if ((candidate.finishReason as any) === 'IMAGE_PROHIBITED_CONTENT') {
          console.error( candidate.finishReason,candidate.finishMessage);
          throw new Error('Image content was prohibited. Please edit your prompt');
        }
      }
    });
  }

  throw new Error('Error in generating the image.');
}
