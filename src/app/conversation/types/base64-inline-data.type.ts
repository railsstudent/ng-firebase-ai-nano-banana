import { GenerativeContentBlob } from 'firebase/ai';

export type Base64InlineData = {
  inlineData: GenerativeContentBlob;
  base64: string;
  text?: string;
};
