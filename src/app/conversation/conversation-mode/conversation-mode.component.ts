import { FirebaseService } from '@/ai/services/firebase.service';
import { FeatureDetails } from '@/feature/types/feature-details.type';
import { DropzoneComponent } from '@/shared/dropzone/dropzone.component';
import { PromptFormComponent } from '@/shared/prompt-form/prompt-form.component';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal, output, signal } from '@angular/core';
import { GenerativeContentBlob } from 'firebase/ai';
import { FormsModule } from '@angular/forms';
import { DEFAULT_BASE64_INLINE_DATA } from '../constants/base64-inline-data.const';
import { ConversationMessagesService } from '../services/conversation-messages.service';
import { Base64InlineData } from '../types/base64-inline-data.type';
import { ChatMessage } from '../types/chat-message.type';

@Component({
  selector: 'app-conversation-mode',
  imports: [
    DropzoneComponent,
    FormsModule,
    PromptFormComponent,
  ],
  templateUrl: './conversation-mode.component.html',
  styleUrl: './conversation-mode.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationModeComponent {
  feature = input.required<FeatureDetails>();
  sources = input.required<string[]>();

  conversationMode = signal('edit');
  editedPrompt = signal('');
  imageFiles = signal<File[]>([]);
  isLoading = signal(false);

  private readonly firebaseService = inject(FirebaseService);
  private readonly conversationMessagesService = inject(ConversationMessagesService);

  originalImageMessage = output<ChatMessage>();
  lastEditedBlob = output<GenerativeContentBlob>();

  #originalImageResource = this.conversationMessagesService.getInitialMessageResource(this.imageFiles);

  #originalImage = computed(() => this.#originalImageResource.hasValue() ?
    this.#originalImageResource.value() : DEFAULT_BASE64_INLINE_DATA
  );

  firstMessage = linkedSignal<Base64InlineData, ChatMessage | undefined>({
    source: () => this.#originalImage(),
    computation: (source, previous) => this.conversationMessagesService.computeInitialMessage(source, previous)
  });

  constructor() {
    effect(() => {
      if (this.#originalImage().inlineData) {
        this.lastEditedBlob.emit(this.#originalImage().inlineData);
      }

      const firstMessage = this.firstMessage();
      if (firstMessage) {
        this.originalImageMessage.emit(firstMessage);
      }
    });
  }

  async handleGenerate(prompt: string) {
    try {
      this.isLoading.set(true);
      const { image } = await this.firebaseService.generateImage(prompt, []);

      const { data, mimeType, inlineData } = image;

      this.originalImageMessage.emit(
        {
          id: 1,
          sender: 'AI',
          text: 'Here is the new image. How would you like to edit it?',
          base64: inlineData,
          isError: false,
        } as ChatMessage
      );

      this.lastEditedBlob.emit({ data, mimeType });
    } finally {
      this.isLoading.set(false);
    }
  }
}
