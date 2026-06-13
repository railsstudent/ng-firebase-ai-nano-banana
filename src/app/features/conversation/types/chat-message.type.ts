import { GenerativeContentBlob } from 'firebase/ai';
import { Base64InlineData } from './base64-inline-data.type';
import { Sender } from './sender.type';

export type ChatMessage = {
  id: number;
  sender: Sender;
  text?: string;
  base64?: string;
  isLoading?: boolean;
  isError?: boolean;
};

export type PreviousMessagesState = {
  source: NoInfer<Base64InlineData>
  value: NoInfer<ChatMessage | undefined>;
} | undefined;

export type BaseImageSession = {
  blob:  GenerativeContentBlob;
  firstMessage: ChatMessage;
}

export type ErrorMessageParams = {
  oldMessage: ChatMessage;
  errorMessage: string;
}

export type SuccessMessageParams =  {
  oldMessage: ChatMessage;
  base64: string;
  text?: string;
}
