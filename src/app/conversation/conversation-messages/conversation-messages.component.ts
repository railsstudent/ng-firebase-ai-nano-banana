import { SpinnerIconComponent } from '@/shared/icons/spinner-icon.component';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../types/chat-message.type';

@Component({
  selector: 'app-conversation-edit',
  imports: [
    FormsModule,
    SpinnerIconComponent,
  ],
  templateUrl: './conversation-messages.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationMessagesComponent {
  messages = input.required<ChatMessage[]>();
  isLoading = input.required<boolean>();
}
