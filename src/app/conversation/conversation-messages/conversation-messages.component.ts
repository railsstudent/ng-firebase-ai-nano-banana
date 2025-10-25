import { SpinnerIconComponent } from '@/shared/icons/spinner-icon.component';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatErrorIconComponent } from '../icons/chat-error-icon.component';
import { ChatMessage } from '../types/chat-message.type';
import { Sender } from '../types/sender.type';

@Component({
  selector: 'app-conversation-messages',
  imports: [
    FormsModule,
    SpinnerIconComponent,
    ChatErrorIconComponent,
  ],
  styleUrl: './conversation-messages.component.css',
  templateUrl: './conversation-messages.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationMessagesComponent {
  messages = input.required<ChatMessage[]>();
  isLoading = input.required<boolean>();

  getItemClasses(sender: Sender): string {
    if (sender === 'User') {
      return 'items-end';
    } else if (sender === 'AI') {
      return 'items-start';
    }

    return '';
  }

  getTextColorClases(sender: Sender): string {
    if (sender === 'User') {
      return 'bg-indigo-600 text-white rounded-br-lg';
    } else if (sender === 'AI') {
       return 'bg-gray-700 text-gray-200 rounded-bl-lg';
    }

    return '';
  }

  getJustifyEndClasses(sender: Sender): string {
    return sender === 'User' ? 'justify-end' : '';
  }

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
