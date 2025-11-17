import { TokenUsage } from '@/ai/types/token-usage.type';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-token-usage',
  imports: [],
  templateUrl: './token-usage.component.html',
  styleUrl: './token-usage.component.css',
})
export class TokenUsageComponent {
  tokenUsage = input<TokenUsage| undefined>(undefined);
}
