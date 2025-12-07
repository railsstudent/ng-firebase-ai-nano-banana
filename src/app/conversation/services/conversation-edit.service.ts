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
      const contentPart = await this.getGeneratedPart(inlineData, prompt);
      if (contentPart && contentPart.data && contentPart.mimeType) {
        return {
          inlineData: contentPart,
          base64: getBase64EncodedString(contentPart)
        };
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

  private async getGeneratedPart(inlineData: GenerativeContentBlob, prompt: string) {
    const currentChat = this.chat();
    if (!currentChat) {
      return undefined;
    }

    const inlineDataPart = inlineData.data && inlineData.mimeType ? { inlineData } : undefined;
    const message = inlineDataPart ? [prompt, inlineDataPart] : [prompt];
    const response = await currentChat.sendMessage(message);

    const contentParts = response.response.inlineDataParts();
    return contentParts?.[0]?.inlineData;
  }

  endEdit(): void {
    this.chat.set(undefined);
  }
}
