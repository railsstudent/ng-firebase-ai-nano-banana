import { SpinnerIconComponent } from '@/shared/icons/spinner-icon.component';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../types/chat-message.type';
import { Sender } from '../types/sender.type';
import { ChatErrorIconComponent } from '../icons/chat-error-icon.component';

@Component({
  selector: 'app-conversation-messages',
  imports: [
    FormsModule,
    SpinnerIconComponent,
    ChatErrorIconComponent,
],
  template: `
@for (message of messages(); track message.id) {
  <div class="flex" [class]="getJustifyEndClasses(message.sender)">
    <div
      class="flex flex-col max-w-lg"
      [class]="getItemClasses(message.sender)">
      <div
        class="px-4 py-3 rounded-2xl animate-scale-in-up"
        [class]="getTextColorClases(message.sender)"
      >
        @if (message.isLoading) {
          <div class="flex items-center space-x-2">
            <app-spinner-icon />
            <span>Editing the last image...</span>
          </div>
        } @else {
          @if (message.text) {
            @let paragraphClasses = message.isError ? 'flex items-center' : '';
            <p class="text-base text-left" [class]="paragraphClasses">
              @if (message.isError) {
                <app-chat-error-icon class="mr-2" />
              }
              {{ message.text }}
            </p>
          }
          @if (message.imageUrl) {
            <img [src]="message.imageUrl" alt="Chat image" class="mt-3 rounded-lg max-w-xs h-auto shadow-lg border-2 border-gray-600" />
          }
        }
      </div>
    </div>
  </div>
}
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationMessagesComponent {
  messages = input.required<ChatMessage[]>();
  isLoading = input.required<boolean>();

  getItemClasses(sender: Sender) {
    if (sender === 'User') {
      return ['items-end'];
    } else if (sender === 'AI') {
      return ['items-start'];
    }

    return [];
  }

  getTextColorClases(sender: Sender) {
    if (sender === 'User') {
      return ['bg-indigo-600', 'text-white', 'rounded-br-lg'];
    } else if (sender === 'AI') {
       return ['bg-gray-700', 'text-gray-200', 'rounded-bl-lg'];
    }

    return [];
  }

  getJustifyEndClasses(sender: Sender) {
    return sender === 'User' ? ['justify-end'] : [];
  }
}
