import { getBase64InlineData } from '@/ai/utils/inline-image-data.util';
import { Injectable, resource, Signal } from '@angular/core';
import { DEFAULT_BASE64_INLINE_DATA } from '../constants/base64-inline-data.const';
import { Base64InlineData } from '../types/base64-inline-data.type';
import { ChatMessage, PreviousMessagesState } from '../types/chat-message.type';

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
  computeInitialMessage(source: Base64InlineData, previous: PreviousMessagesState) {
      if (previous?.value) {
        return  previous.value;
      }

      const {
        base64,
        text = 'Here is the original image you uploaded. How would you like to edit it?'
      } = source;

      if (!base64) {
        return previous?.value ?? undefined;
      }

      return {
        id: 1,
        sender: 'AI',
        text,
        base64,
        isError: false,
      } as ChatMessage;
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
