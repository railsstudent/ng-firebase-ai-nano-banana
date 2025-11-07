import { FirebaseService } from '@/ai/services/firebase.service';
import { getBase64EncodedString } from '@/ai/utils/inline-image-data.util';
import { inject, Injectable, signal } from '@angular/core';
import { ChatSession, GenerativeContentBlob } from '@angular/fire/ai';
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
      const contentParts = await this.getGeneratedParts(inlineData, prompt);

      if (contentParts.length > 0) {
        const { data = '', mimeType = '' } = contentParts[0].inlineData;
        if (data && mimeType) {
          return {
            inlineData: { data, mimeType },
            base64: getBase64EncodedString({ data, mimeType })
          };
        }
      }
      throw new Error('Send message completed but image is not generated.');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error in sending message to generate an image.');
    }
  }

  private async getGeneratedParts(inlineData: GenerativeContentBlob, prompt: string) {
    const currentChat = this.chat();
    if (!currentChat) {
      return [];
    }
    const inlineDataPart = inlineData.data && inlineData.mimeType ? { inlineData } : undefined;
    const message = inlineDataPart ? [prompt, inlineDataPart] : [prompt];
    const response = await currentChat.sendMessage(message);

    return response.response.inlineDataParts() || [];
  }

  endEdit(): void {
    this.chat.set(undefined);
  }
}
