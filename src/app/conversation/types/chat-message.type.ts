import { Sender } from './sender.type';

export type ChatMessage = {
  id: number;
  sender: Sender;
  text?: string;
  base64?: string;
  isLoading?: boolean;
  isError?: boolean;
};
