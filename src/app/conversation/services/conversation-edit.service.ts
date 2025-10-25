import { GeminiService } from '@/ai/services/gemini.service';
import { getBase64EncodedString } from '@/ai/utils/inline-image-data.util';
import { inject, Injectable, signal } from '@angular/core';
import { Chat, Part, PartListUnion } from '@google/genai';
import { GenerativeContentBlob } from 'firebase/ai';
import { Base64InlineData } from '../types/base64-inline-data.type';

@Injectable({
  providedIn: 'root'
})
export class ConversationEditService {
  chat = signal<Chat | undefined>(undefined);

  geminiService = inject(GeminiService);

  startEdit(): void {
    const chatInstance = this.geminiService.createChat();
    this.chat.set(chatInstance);
  }

  async editImage(prompt: string, inlineData: GenerativeContentBlob): Promise<Base64InlineData> {
    try {
      if (!this.chat()) {
        this.startEdit();
      }

      const currentChat = this.chat();
      if (currentChat) {
        const inlineDataPart: Part | undefined = inlineData.data && inlineData.mimeType ? { inlineData } : undefined;
        const message: PartListUnion = inlineDataPart ? [prompt, inlineDataPart] : [prompt];
        const response = await currentChat.sendMessage({
          message
        });

        const contentParts = response.candidates?.[0]?.content?.parts || [];

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

  endEdit(): void {
    this.chat.set(undefined);
  }
}
