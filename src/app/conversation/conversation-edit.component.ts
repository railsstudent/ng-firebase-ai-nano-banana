import { FeatureService } from '@/feature/services/feature.service';
import { CardHeaderComponent } from '@/shared/card/card-header/card-header.component';
import { CardComponent } from '@/shared/card/card.component';
import { ErrorDisplayComponent } from '@/shared/error-display/error-display.component';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ConversationEditService } from './services/conversation-edit.service';

@Component({
  selector: 'app-visual-story',
  imports: [
    CardComponent,
    CardHeaderComponent,
    ErrorDisplayComponent,
  ],
  templateUrl: './conversation-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConversationEditComponent {
  private readonly conversationEditService = inject(ConversationEditService);
  private readonly featureService = inject(FeatureService);

  feature = this.featureService.getFeatureDetails('conversation');

  error = signal('');
}
