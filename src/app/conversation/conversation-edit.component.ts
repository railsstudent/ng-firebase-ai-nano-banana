import { getBase64InlineData } from '@/ai/utils/inline-image-data.util';
import { FeatureService } from '@/feature/services/feature.service';
import { CardHeaderComponent } from '@/shared/card/card-header/card-header.component';
import { CardComponent } from '@/shared/card/card.component';
import { DropzoneComponent } from '@/shared/dropzone/dropzone.component';
import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, resource, signal, viewChild } from '@angular/core';
import { ConversationInputFormComponent } from './conversation-input-form/conversation-input-form.component';
import { ConversationMessagesComponent } from './conversation-messages/conversation-messages.component';
import { ConversationEditService } from './services/conversation-edit.service';
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

  toggleConversation() {
    this.isEditing.update((prev) => !prev);
    if (!this.isEditing()) {
      this.messages.set([]);
      this.dropzone().clearAllFiles();
    }
  }

  #originalImageResource = resource<string, File[]>(
    {
      params: () => this.imageFiles(),
      loader: async ({ params }) => {
        const result = await getBase64InlineData(params);
        return result.length > 0 ? result[0] : '';
      },
      defaultValue: ''
    }
  );

  #originalImage = computed(() => this.#originalImageResource.hasValue() ? this.#originalImageResource.value() : '');

  messages = linkedSignal<{ originalImage: string, isEditing: boolean }, ChatMessage[]>({
    source: () => ({ originalImage: this.#originalImage(), isEditing: this.isEditing() }),
    computation: ({ originalImage, isEditing }, previous) => {
      // The conversation has already started, preserve previous messages
      if (isEditing || !originalImage) {
        const previousChatMessages = previous?.value ?? [];
        return previousChatMessages;
      }

      return [
        {
          id: 1,
          sender: 'AI',
          text: 'Here is the original image you uploaded. How would you like to edit it?',
          imageUrl: originalImage,
          isError: false,
        }
      ];
    },
  })

  async handleSendPrompt(prompt: string): Promise<void> {
    console.log(prompt);

    this.messages.update(messages => {
      const newId = messages.length + 1;

      return [
        ...messages,
        { id: newId, sender: 'User', text: prompt }
      ];
    });

    this.isLoading.set(true);

    const aiMessageId = this.messages().length + 1;
    this.messages.update(messages => {
      return [
        ...messages,
        { id: aiMessageId, sender: 'AI', isLoading: true }
      ];
    });

    try {
      // this.conversationEditService.editImage(prompt, this.imageFiles()[0] ? {
      await new Promise((resolve) => {
        setTimeout(() => resolve(
          this.messages.update(messages => {
            return messages.map(message => message.id !== aiMessageId  ?
              message : {
                ...message,
                isLoading: false,
                isError: false,
                text: 'New image generated based on your edit request.',
                imageUrl: 'https://placehold.co/600x400'
              }
            );
          })
        ), 5000);
      })
    } catch (e) {
      const errorMessage =  e instanceof Error ? e.message: 'An unexpected error occurred in image editing.';
      this.messages.update(messages => {
        return messages.map(message => message.id !== aiMessageId ? message:
          ({
            ...message,
            isLoading: false,
            isError: true,
            text: errorMessage,
            imageUrl: undefined,
          }));
      });
    } finally {
      this.isLoading.set(false);
    }
    // try {
    //   const newImageUrl = await this.geminiService.generateImage(text, [this.currentImageFile()!]);

    //   const newFile = await this.dataUrlToFile(newImageUrl, `edited-${Date.now()}.png`);
    //   this.currentImageFile.set(newFile);

    //   // Replace loading message with the actual response
    //   this.messages.update(messages =>
    //     messages.map(m =>
    //       m.id === loadingMessageId
    //         ? { ...m, isLoading: false, imageUrl: newImageUrl, text: `Here is the edited image based on your request: "${text}"` }
    //         : m
    //     )
    //   );
    // } catch (e) {
    //   const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
    //   this.error.set(errorMessage);
    //   this.messages.update(messages =>
    //     messages.map(m =>
    //       m.id === loadingMessageId
    //         ? { ...m, isLoading: false, text: `Sorry, I couldn't process that. ${errorMessage}` }
    //         : m
    //     )
    //   );
    // } finally {
    //   this.isLoading.set(false);
    // }
  }
}
