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

export type MessagesSignalState = NoInfer<{ originalImage: Base64InlineData, isEditing: boolean }>;
export type PreviousMessagesState = {
  source: NoInfer<{ originalImage: Base64InlineData, isEditing: boolean }>
  value: NoInfer<ChatMessage[]>;
} | undefined;
