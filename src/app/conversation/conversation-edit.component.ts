import { FeatureService } from '@/feature/services/feature.service';
import { CardHeaderComponent } from '@/shared/card/card-header/card-header.component';
import { CardComponent } from '@/shared/card/card.component';
import { DropzoneComponent } from '@/shared/dropzone/dropzone.component';
import { GenMediaService } from '@/shared/gen-media/services/gen-media.service';
import { PromptFormComponent } from '@/shared/prompt-form/prompt-form.component';
import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DEFAULT_BASE64_INLINE_DATA } from './constants/base64-inline-data.const';
import { ConversationInputFormComponent } from './conversation-input-form/conversation-input-form.component';
import { ConversationMessagesComponent } from './conversation-messages/conversation-messages.component';
import { makeAIResponsePair, makeErrorMessage, makeSuccessMessage } from './helpers/message.helper';
import { ConversationEditService } from './services/conversation-edit.service';
import { ConversationMessagesService } from './services/conversation-messages.service';
import { Base64InlineData } from './types/base64-inline-data.type';
import { ChatMessage } from './types/chat-message.type';

@Component({
  selector: 'app-conversation-edit',
  imports: [
    CardComponent,
    CardHeaderComponent,
    DropzoneComponent,
    ConversationMessagesComponent,
    ConversationInputFormComponent,
    FormsModule,
    PromptFormComponent,
  ],
  templateUrl: './conversation-edit.component.html',
  styleUrl: './conversation-edit.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConversationEditComponent {
  private readonly conversationEditService = inject(ConversationEditService);
  private readonly conversationMessagesService = inject(ConversationMessagesService);
  private readonly featureService = inject(FeatureService);
  private readonly genMediaService = inject(GenMediaService);

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

  conversationMode = signal('edit');
  editedPrompt = signal('');

  dropzone = viewChild.required<DropzoneComponent>('dropzone');

  #originalImageResource = this.conversationMessagesService.getInitialMessageResource(this.imageFiles);

  #originalImage = computed(() => this.#originalImageResource.hasValue() ?
    this.#originalImageResource.value() : DEFAULT_BASE64_INLINE_DATA
  );

  messages = linkedSignal<{ originalImage: Base64InlineData, isEditing: boolean }, ChatMessage[]>({
    source: () => ({ originalImage: this.#originalImage(), isEditing: this.isEditing() }),
    computation: (source, previous) => this.conversationMessagesService.computeInitialMessages(source, previous),
  });

  lastEditedImage = linkedSignal(() => this.#originalImage().inlineData);

  handleGenerate(prompt: string) {
    console.log('prompt', prompt);
  }

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

        if (this.conversationMode() === 'edit') {
          this.imageFiles.set([]);
        }
      }
      this.isEditing.update((prev) => !prev);
  }

  handleDownloadImage(event: { base64: string, filename: string }) {
    this.genMediaService.downloadImage(event.filename, event.base64);
  }
}
