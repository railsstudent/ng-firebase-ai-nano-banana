import { FirebaseService } from '@/ai/services/firebase.service';
import { getBase64EncodedString } from '@/ai/utils/inline-image-data.util';
import { inject, Injectable, signal } from '@angular/core';
import { ChatSession, GenerativeContentBlob } from 'firebase/ai';
import { Base64InlineData } from '../types/base64-inline-data.type';

@Injectable({
  providedIn: 'root'
})
export class ConversationEditService {
  chat = signal<ChatSession | undefined>(undefined);

  firebaseService = inject(FirebaseService);

  startEdit(): void {
    const chatInstance = this.firebaseService.createChat();
    this.chat.set(chatInstance);
  }

  async editImage(prompt: string, inlineData: GenerativeContentBlob): Promise<Base64InlineData> {
    try {
      if (!this.chat()) {
        this.startEdit();
      }

      const currentChat = this.chat();
      if (currentChat) {
        const contentParts = await this.getGeneratedParts(inlineData, prompt, currentChat);

        let base64InlineData: Base64InlineData | undefined = undefined;
        let partText = '';
        for (const part of contentParts) {
          if (part.text) {
            partText = part.text;
          } else if (part.inlineData) {
            const { data = '', mimeType = '' } = part.inlineData;
            if (data && mimeType) {
              base64InlineData =  {
                inlineData: { data, mimeType },
                base64: getBase64EncodedString({ data, mimeType })
              };
            }
          }
        }

        if (base64InlineData) {
          return {
            ...base64InlineData,
            text: partText,
          };
        }
        throw new Error('Send message completed but image is not generated.');
      } else {
        throw new Error('Failed to create a chat to edit image in a conversation');
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error in sending message to generate an image.');
    }
  }

  private async getGeneratedParts(inlineData: GenerativeContentBlob, prompt: string, currentChat: ChatSession) {
    const inlineDataPart = inlineData.data && inlineData.mimeType ? { inlineData } : undefined;
    const message = inlineDataPart ? [prompt, inlineDataPart] : [prompt];
    const response = await currentChat.sendMessage(message);

    return response.response.inlineDataParts() || [];
  }

  endEdit(): void {
    this.chat.set(undefined);
  }
}
