import { WebGroundingChunk } from 'firebase/ai';

export type Metadata = {
  citations: WebGroundingChunk[];
  renderedContent: string;
  searchQueries: string[];
};

export type MetadataGroup = Pick<Metadata, 'searchQueries' | 'citations'>  & {
  renderedContents: string[];
}
