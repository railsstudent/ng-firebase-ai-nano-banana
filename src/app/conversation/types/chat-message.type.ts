import { Sender } from './sender.type';

export type ChatMessage = {
  id: number;
  sender: Sender;
  text?: string;
  imageUrl?: string;
  isLoading?: boolean;
  isError?: boolean;
};
