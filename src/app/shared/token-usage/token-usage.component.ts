import { TokenUsage } from '@/ai/types/token-usage.type';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-token-usage',
  imports: [],
  template: `
@let tokenStat = tokenUsage();
@if (tokenStat) {
  <h3 class="text-indigo-500 text-xl">Token Usage</h3>
  <div class="w-full">
    <div class="flex flex-wrap items-center justify-around">
      <span>Input tokens</span>
      <span>Output tokens</span>
      <span>Total tokens</span>
    </div>
    <div class="flex flex-wrap items-center justify-around">
      <span>{{ tokenStat.promptTokenCount }}</span>
      <span>{{ tokenStat.outputTokenCount }}</span>
      <span>{{ tokenStat.totalTokenCount }}</span>
    </div>
</div>
}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TokenUsageComponent {
  tokenUsage = input<TokenUsage| undefined>(undefined);
}
