import { FirebaseService } from '@/ai/services/firebase.service';
import { FeatureDetails } from '@/feature/types/feature-details.type';
import { DropzoneComponent } from '@/shared/dropzone/dropzone.component';
import { PromptFormComponent } from '@/shared/prompt-form/prompt-form.component';
import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../types/chat-message.type';
import { GenerativeContentBlob } from 'firebase/ai';

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

  conversationMode = signal('edit');
  editedPrompt = signal('');
  imageFiles = signal<File[]>([]);
  isLoading = signal(false);

  private readonly firebaseService = inject(FirebaseService);

  originalImageMessage = output<ChatMessage>();
  lastEditedBlob = output<GenerativeContentBlob>();

  async handleGenerate(prompt: string) {
    try {
      this.isLoading.set(true);
      const imageResponse = await this.firebaseService.generateImage(prompt, []);

      const { data, mimeType, inlineData } = imageResponse;

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
