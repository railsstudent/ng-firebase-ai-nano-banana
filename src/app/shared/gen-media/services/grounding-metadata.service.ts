import { MetadataGroup } from '@/ai/types/grounding-metadata.type';
import { ImageTokenUsage } from '@/ai/types/image-response.type';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GroundingMetadataService {
  mergeGroundingMetadata(imageTokenUsages: ImageTokenUsage[]) {
    const defaultMetadata: MetadataGroup = {
      searchQueries: [],
      citations: [],
      renderedContents: []
    };

    return imageTokenUsages.reduce((acc, item) => {
      const metadata = item.metadata;

      return {
        citations: acc.citations.concat(metadata.citations),
        searchQueries: acc.searchQueries.concat(metadata.searchQueries),
        renderedContents: metadata.renderedContent ? acc.renderedContents.concat(metadata.renderedContent) : acc.renderedContents,
      };
    }, defaultMetadata)
  }
}
