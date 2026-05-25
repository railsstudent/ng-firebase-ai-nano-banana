import { SendIconComponent } from '@/shared/icons/send-icon.component';
import { SpinnerIconComponent } from '@/shared/icons/spinner-icon.component';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-conversation-input-form',
  imports: [
    FormsModule,
    SpinnerIconComponent,
    SendIconComponent,
  ],
  template: `
    <div class="p-4 bg-gray-800 border-t border-gray-700">
      <form (ngSubmit)="handleSendPrompt()" class="flex items-center gap-3">
        <textarea
          [(ngModel)]="prompt"
          name="prompt"
          rows="3"
          placeholder="e.g., make the sky purple"
          (keydown.enter)="handleSendPrompt()"
          class="flex-grow bg-gray-700 text-gray-200 border border-gray-600 rounded-xl py-3 px-5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 resize-none placeholder-gray-400"
          [disabled]="pauseSendPrompt()"></textarea>
        <button
          type="submit"
          [disabled]="pauseSendPrompt() || !trimmedPrompt"
          class="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500">
          @if (isGeneratingImage()) {
            <app-spinner-icon />
          } @else {
            <app-send-icon />
          }
        </button>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationInputFormComponent {
  pauseSendPrompt = input(false);
  isGeneratingImage = input(false);
  prompt = signal('');

  newEditRequest = output<string>();

  trimmedPrompt = computed(() => this.prompt().trim());
  isEmptyPrompt = computed(() => !this.trimmedPrompt().length);

  async handleSendPrompt(): Promise<void> {
    if (this.isEmptyPrompt() || this.pauseSendPrompt()) {
      return;
    }

    this.newEditRequest.emit(this.trimmedPrompt());

    this.prompt.set('');
  }
}
