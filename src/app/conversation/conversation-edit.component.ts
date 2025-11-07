import { FeatureService } from '@/feature/services/feature.service';
import { CardHeaderComponent } from '@/shared/card/card-header/card-header.component';
import { CardComponent } from '@/shared/card/card.component';
import { GenMediaService } from '@/shared/gen-media/services/gen-media.service';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { GenerativeContentBlob } from 'firebase/ai';
import { DEFAULT_BASE64_INLINE_DATA } from './constants/base64-inline-data.const';
import { ConversationInputFormComponent } from './conversation-input-form/conversation-input-form.component';
import { ConversationMessagesComponent } from './conversation-messages/conversation-messages.component';
import { ConversationModeComponent } from './conversation-mode/conversation-mode.component';
import { makeAIResponsePair, makeErrorMessage, makeSuccessMessage } from './helpers/message.helper';
import { ConversationEditService } from './services/conversation-edit.service';
import { ChatMessage } from './types/chat-message.type';

@Component({
  selector: 'app-conversation-edit',
  imports: [
    CardComponent,
    CardHeaderComponent,
    ConversationMessagesComponent,
    ConversationInputFormComponent,
    ConversationModeComponent,
  ],
  templateUrl: './conversation-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConversationEditComponent {
  private readonly conversationEditService = inject(ConversationEditService);
  private readonly featureService = inject(FeatureService);
  private readonly genMediaService = inject(GenMediaService);

  sources = input.required<string[]>();

  feature = computed(() => this.featureService.getFeatureDetails('conversation'));

  isEditing = signal(false);
  btnConversationText = computed(() => {
    const action = this.isEditing() ? 'End' : 'Start';
    return `${action} Conversation`;
  });

  isConversationDisabled = computed(() => this.messages().length === 0);
  isLoading = signal(false);

  messages = signal<ChatMessage[]>([]);
  lastEditedImage = signal<GenerativeContentBlob>(DEFAULT_BASE64_INLINE_DATA.inlineData);

  async handleSendPrompt(prompt: string): Promise<void> {
    this.isLoading.set(true);

    const { aiMessageId, pair } = makeAIResponsePair(prompt, this.messages()[this.messages().length - 1].id);
    this.messages.update(messages => ([...messages, ...pair]));

    try {
      const { inlineData, base64, text }
        = await this.conversationEditService.editImage(prompt, this.lastEditedImage());
      this.messages.update(messages => {
        return messages.map(message => message.id !== aiMessageId  ?
          message : makeSuccessMessage(message, base64, text)
        );
      });

      this.lastEditedImage.set(inlineData);
    } catch (e) {
      const errorMessage =  e instanceof Error ? e.message: 'An unexpected error occurred in converational image editing.';
      this.messages.update(messages => {
        return messages.map(message => message.id !== aiMessageId ? message :
          makeErrorMessage(message, errorMessage));
      });
    } finally {
      this.isLoading.set(false);
    }
  }

   toggleConversation() {
      const currentEditing = this.isEditing();
      // not editing to editing
      if (!currentEditing) {
        this.conversationEditService.startEdit();
      } else {
        // editing to not editing
        this.conversationEditService.endEdit();
        this.messages.set([]);
      }
      this.isEditing.update((prev) => !prev);
  }

  handleDownloadImage(event: { base64: string, filename: string }) {
    this.genMediaService.downloadImage(event.filename, event.base64);
  }
}
