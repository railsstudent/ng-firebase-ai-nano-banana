import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-prompt-history',
  templateUrl: './prompt-history.component.html',
  styleUrl: '../tailwind-utilities.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptHistoryComponent {
  history = input.required<string[]>();

  promptSelected = output<string>();
  historyCleared = output<void>();

  onPromptClick(prompt: string): void {
    this.promptSelected.emit(prompt);
  }

  onClearHistory(): void {
    this.historyCleared.emit();
  }
}
