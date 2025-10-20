import { GeminiService } from '@/ai/services/gemini.service';
import { inject, Injectable, signal } from '@angular/core';
import { Chat, Part, PartListUnion } from '@google/genai';

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

  async editImage(prompt: string, inlineData?: { data: string, mimeType: string }): Promise<string> {
    try {
      if (!this.chat()) {
        this.startEdit();
      }

      const currentChat = this.chat();
      if (currentChat) {
        const inlineDataPart: Part | undefined = inlineData ? { inlineData } : undefined;
        const message: PartListUnion = inlineDataPart ? [prompt, inlineDataPart] : [prompt];
        const response = await currentChat.sendMessage({
          message
        });

        const image = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
        if (image) {
          const { data = '', mimeType = '' } = image;
          if (data && mimeType) {
            return `data:${mimeType};base64,${data}`
          }
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
