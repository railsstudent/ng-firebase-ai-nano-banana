import { MetadataGroup } from '@/ai/types/grounding-metadata.type';
import { TokenUsage } from '@/ai/types/token-usage.type';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { marked } from 'marked';
import { GroundingComponent } from '../grounding/grounding.component';
import { TokenUsageComponent } from './token-usage/token-usage.component';

@Component({
  selector: 'app-thought-summary',
  imports: [TokenUsageComponent, FormsModule, GroundingComponent],
  template: `
    <div class="w-full mt-6 flex flex-col">
      <app-token-usage [tokenUsage]="tokenUsage()" />
      <app-google-search-suggestions [groundingMetadata]="groundingMetadata()" />
      @let thoughts = htmlThoughts();
      @if (thoughts && thoughts.length > 0) {
        <div>
          <h3 class="text-lg font-semibold text-slate-300 mb-2">Thought Summary</h3>
          @let numThoughts = thoughts.length;
          @if (numThoughts > 1) {
            <label for="thoughts" class="mb-2.5 text-lg font-medium">
              Choose the thought summary:
            </label>
            <select id="thoughts" name="thoughts" class="mb-2.5 text-lg px-3 py-2.5 rounded-md border-solid border-2 border-indigo-300 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500" [(ngModel)]="thoughtSummaryIndex" >
              @for (item of thoughtSummaryIndexList(); track item) {
                <option [ngValue]="item">{{ item + 1 }}</option>
              }
            </select>
          }
          <div class="text-left bg-slate-700/50 p-4 rounded-lg border border-slate-600">
            <p class="thought text-slate-200 italic" [innerHTML]="thoughts[thoughtSummaryIndex()]"></p>
          </div>
        </div>
      }
    </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThoughtSummaryComponent {
  thoughtSummaries = input<string[]>([]);
  tokenUsage = input<TokenUsage | undefined>(undefined);
  groundingMetadata = input<MetadataGroup | undefined>(undefined);

  thoughtSummaryIndex = signal(0);

  thoughtSummaryIndexList = computed(() => Array.from({ length: this.thoughtSummaries().length }, (_, index) => index));

  htmlThoughts = computed(() =>
    this.thoughtSummaries().map((thoughtSummary) => marked(thoughtSummary.replace('\n\n', '<br />')) as string)
  );
}
