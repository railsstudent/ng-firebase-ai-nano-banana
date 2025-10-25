import { getBase64InlineData } from '@/ai/utils/inline-image-data.util';
import { FeatureService } from '@/feature/services/feature.service';
import { CardHeaderComponent } from '@/shared/card/card-header/card-header.component';
import { CardComponent } from '@/shared/card/card.component';
import { DropzoneComponent } from '@/shared/dropzone/dropzone.component';
import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, resource, signal, viewChild } from '@angular/core';
import { GenerativeContentBlob } from 'firebase/ai';
import { DEFAULT_BASE64_INLINE_DATA } from './constants/base64-inline-data.const';
import { ConversationInputFormComponent } from './conversation-input-form/conversation-input-form.component';
import { ConversationMessagesComponent } from './conversation-messages/conversation-messages.component';
import { ConversationEditService } from './services/conversation-edit.service';
import { Base64InlineData } from './types/base64-inline-data.type';
import { ChatMessage } from './types/chat-message.type';

@Component({
  selector: 'app-conversation-edit',
  imports: [
    CardComponent,
    CardHeaderComponent,
    DropzoneComponent,
    ConversationMessagesComponent,
    ConversationInputFormComponent
  ],
  templateUrl: './conversation-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConversationEditComponent {
  private readonly conversationEditService = inject(ConversationEditService);
  private readonly featureService = inject(FeatureService);

  feature = computed(() => this.featureService.getFeatureDetails('conversation'));
  dropzoneMode = computed(() => this.feature()?.mode ?? 'single');
  imageFiles = signal<File[]>([]);

  isEditing = signal(false);
  btnConversationText = computed(() => {
    const action = this.isEditing() ? 'End' : 'Start';
    return `${action} Conversation`;
  });

  isConversationDisabled = computed(() => this.imageFiles().length === 0);
  isLoading = signal(false);

  dropzone = viewChild.required<DropzoneComponent>('dropzone');

  #originalImageResource = resource<Base64InlineData, File[]>(
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

  #originalImage = computed(() => this.#originalImageResource.hasValue() ?
    this.#originalImageResource.value() : DEFAULT_BASE64_INLINE_DATA
  );

  messages = linkedSignal<{ originalImage: Base64InlineData, isEditing: boolean }, ChatMessage[]>({
    source: () => ({ originalImage: this.#originalImage(), isEditing: this.isEditing() }),
    computation: (source, previous) => this.conversationEditService.computeInitialMessages(source, previous),
  });

  lastEditedImage = linkedSignal<GenerativeContentBlob>(() => this.#originalImage().inlineData);

  async handleSendPrompt(prompt: string): Promise<void> {
    this.messages.update(messages => ([
        ...messages,
        { id: messages.length + 1, sender: 'User', text: prompt }
      ])
    );

    this.isLoading.set(true);

    const aiMessageId = this.messages().length + 1;
    this.messages.update(messages => ([
        ...messages,
        { id: aiMessageId, sender: 'AI', isLoading: true }
      ])
    );

    try {
      const { inlineData, base64, text }
        = await this.conversationEditService.editImage(prompt, this.lastEditedImage());
      this.messages.update(messages => {
        return messages.map(message => message.id !== aiMessageId  ?
          message : {
            ...message,
            isLoading: false,
            isError: false,
            text: text || 'New image generated based on your edit request.',
            base64
          }
        );
      });

      this.lastEditedImage.set(inlineData);
    } catch (e) {
      const errorMessage =  e instanceof Error ? e.message: 'An unexpected error occurred in converational image editing.';
      this.messages.update(messages => {
        return messages.map(message => message.id !== aiMessageId ? message :
          ({
            ...message,
            isLoading: false,
            isError: true,
            text: errorMessage,
            base64: undefined,
          }));
      });
    } finally {
      this.isLoading.set(false);
    }
  }

   toggleConversation() {
    this.isEditing.update((prev) => !prev);
    if (this.isEditing()) {
      this.conversationEditService.startEdit();
    } else {
      this.conversationEditService.endEdit();
      this.messages.set([]);
      this.dropzone().clearAllFiles();
    }
  }
}
