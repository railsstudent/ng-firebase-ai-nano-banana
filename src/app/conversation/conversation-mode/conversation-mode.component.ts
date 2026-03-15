import { FirebaseService } from '@/ai/services/firebase.service';
import { getBase64InlineData } from '@/ai/utils/inline-image-data.util';
import { FeatureDetails } from '@/feature/types/feature-details.type';
import { DropzoneComponent } from '@/shared/dropzone/dropzone.component';
import { LiveImageComponent } from '@/shared/live-image/live-image.component';
import { PromptFormComponent } from '@/shared/prompt-form/prompt-form.component';
import { PromptForm } from '@/shared/prompt-form/types/prompt-form.type';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, resource, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { DEFAULT_BASE64_INLINE_DATA } from '../constants/base64-inline-data.const';
import { IMAGE_CHANNEL_LIST } from '../constants/image-channel.const';
import { Base64InlineData } from '../types/base64-inline-data.type';
import { ChatMessage, OriginalImageMessage } from '../types/chat-message.type';
import { ImageChannel } from '../types/conversation-model.type';

@Component({
  selector: 'app-conversation-mode',
  imports: [
    DropzoneComponent,
    LiveImageComponent,
    PromptFormComponent,
    FormField,
  ],
  templateUrl: './conversation-mode.component.html',
  styleUrl: './conversation-mode.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationModeComponent {
  feature = input.required<FeatureDetails>();
  imageChannels = IMAGE_CHANNEL_LIST;

  imageChannelModel = signal<ImageChannel>({
     mode: 'edit',
  })

  imageChannelForm = form(this.imageChannelModel, (schemaPath) => {
    required(schemaPath.mode);
  });

  editedPrompt = signal<PromptForm>({ value: '' });
  imageFiles = signal<File[]>([]);
  isLoading = signal(false);

  private readonly firebaseService = inject(FirebaseService);

  originalImageMessage = output<OriginalImageMessage>();

  #originalImageResource =resource<Base64InlineData, File[]>(
    {
      params: () => this.imageFiles(),
      loader: async ({ params }) => {
        const result = await getBase64InlineData(params);
        return result.length > 0 ?
          {
            ...result[0],
            text: 'Here is the original image you uploaded. How would you like to edit it?'
          }
          : DEFAULT_BASE64_INLINE_DATA;
      },
      defaultValue: DEFAULT_BASE64_INLINE_DATA,
    }
  );

  imageMessagePayload = computed<OriginalImageMessage | undefined>(() => {
    const hasValue = this.#originalImageResource.hasValue();
    if (hasValue) {
      const { base64, text, inlineData } = this.#originalImageResource.value();
      if (!base64 || !inlineData) {
        return undefined;
      }

      const message: ChatMessage = {
        id: 1,
        sender: 'AI',
        text: text || 'Here is the original image you uploaded. How would you like to edit it?',
        base64,
        isError: false,
      };

      return {
        blob: inlineData,
        firstMessage: message
      }
    }

    return undefined;
  });

  constructor() {
    effect(() => {
      const payload = this.imageMessagePayload();
      if (payload) {
        this.originalImageMessage.emit(payload);
      }
    });
  }

  async handleGenerate({ prompt }: { prompt: string; inputValue: string }) {
    try {
      this.isLoading.set(true);
      const { image } = await this.firebaseService.generateImage(prompt, []);

      const { data, mimeType, inlineData: base64 } = image;
      this.originalImageMessage.emit(
        {
          blob: { data, mimeType },
          firstMessage: {
            id: 1,
            sender: 'AI',
            text: 'Here is the new image. How would you like to edit it?',
            base64,
            isError: false,
          }
        }
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
