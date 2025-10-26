import { getBase64InlineData } from '@/ai/utils/inline-image-data.util';
import { Injectable, resource, Signal } from '@angular/core';
import { DEFAULT_BASE64_INLINE_DATA } from '../constants/base64-inline-data.const';
import { Base64InlineData } from '../types/base64-inline-data.type';
import { ChatMessage, MessagesState, PreviousMessagesState } from '../types/chat-message.type';

async function originalImageLoader(params: NoInfer<File[]>) {
  const result = await getBase64InlineData(params);
  return result.length > 0 ?
    {
      ...result[0],
      text: 'Here is the original image you uploaded. How would you like to edit it?'
    }
    : DEFAULT_BASE64_INLINE_DATA;
}

@Injectable({
  providedIn: 'root'
})
export class ConversationMessagesService {
  computeInitialMessages({ originalImage, isEditing }: MessagesState, previous: PreviousMessagesState) {
      const {
        base64,
        text = 'Here is the original image you uploaded. How would you like to edit it?'
      } = originalImage;

      // The conversation has already started, preserve previous messages
      if (isEditing || !base64) {
        const previousChatMessages = previous?.value ?? [];
        return previousChatMessages;
      }

      return [
        {
          id: 1,
          sender: 'AI',
          text,
          base64,
          isError: false,
        } as ChatMessage
      ];
  }

  getInitialMessageResource(imageFiles: Signal<File[]>) {
    return resource<Base64InlineData, File[]>(
      {
        params: () => imageFiles(),
        loader: ({ params }) => originalImageLoader(params),
        defaultValue: DEFAULT_BASE64_INLINE_DATA,
      }
    )
  }
}
