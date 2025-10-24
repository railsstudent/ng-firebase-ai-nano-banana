import { FeatureService } from '@/feature/services/feature.service';
import { CardHeaderComponent } from '@/shared/card/card-header/card-header.component';
import { CardComponent } from '@/shared/card/card.component';
import { DropzoneComponent } from '@/shared/dropzone/dropzone.component';
import { ErrorDisplayComponent } from '@/shared/error-display/error-display.component';
import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
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

  key = signal('conversation');
  feature = computed(() => this.featureService.getFeatureDetails(this.key()));
  dropzoneMode = computed(() => this.feature()?.mode ?? 'single');
  imageFiles = signal<File[]>([]);

  isEditing = signal(false);
  btnConversationText = computed(() => {
    const action = this.isEditing() ? 'End' : 'Start';
    return `${action} Conversation`;
  });

  isConversationDisabled = computed(() => this.imageFiles().length === 0);

  messages = signal<ChatMessage[]>([]);
  isLoading = signal(false);
  prompt = signal('');

  dropzone = viewChild.required<DropzoneComponent>('dropzone');

  toggleConversation() {
    this.isEditing.update((prev) => !prev);
    if (!this.isEditing()) {
      this.messages.set([]);
      this.dropzone().clearAllFiles();
    }
  }

  constructor() {
    // effect(() => {
    //   this.processInitialImageFile(this.initialImageFile());
    // }, { allowSignalWrites: true });

    // effect(() => {
    //   // Scroll to bottom when messages change
    //   if (this.messages() && this.messageContainer()) {
    //     this.scrollToBottom();
    //   }
    // });
  }

  // private processInitialImageFile(file: File): void {
  //   this.currentImageFile.set(file);
  //   const reader = new FileReader();
  //   reader.onload = (e: ProgressEvent<FileReader>) => {
  //     const url = e.target?.result as string;
  //     this.messages.set([
  //       {
  //         id: this.messageIdCounter++,
  //         sender: 'AI',
  //         text: 'Image loaded! How can I edit it for you?',
  //         imageUrl: url,
  //       },
  //     ]);
  //   };
  //   reader.readAsDataURL(file);
  // }

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
                isError: true,
                text: `Here is the edited image based on your request: "${prompt}"`,
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
            text: errorMessage,
            imageUrl: undefined,
            isError: true,
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

  // private async dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  //   const res = await fetch(dataUrl);
  //   const blob = await res.blob();
  //   return new File([blob], fileName, { type: blob.type });
  // }

  // private scrollToBottom(): void {
  //   // Using setTimeout to make sure the element is in the DOM and rendered before scrolling.
  //   setTimeout(() => {
  //       try {
  //           const el = this.messageContainer()?.nativeElement;
  //           if (el) {
  //               el.scrollTop = el.scrollHeight;
  //           }
  //       } catch (err) {
  //           console.error('Could not scroll to bottom:', err);
  //       }
  //   }, 0);
  // }
}
