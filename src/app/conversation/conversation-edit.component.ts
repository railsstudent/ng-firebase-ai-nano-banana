import { FeatureService } from '@/feature/services/feature.service';
import { CardHeaderComponent } from '@/shared/card/card-header/card-header.component';
import { CardComponent } from '@/shared/card/card.component';
import { DropzoneComponent } from '@/shared/dropzone/dropzone.component';
import { ErrorDisplayComponent } from '@/shared/error-display/error-display.component';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ConversationEditService } from './services/conversation-edit.service';

@Component({
  selector: 'app-visual-story',
  imports: [
    CardComponent,
    CardHeaderComponent,
    DropzoneComponent,
    ErrorDisplayComponent,
  ],
  templateUrl: './conversation-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConversationEditComponent {
  private readonly conversationEditService = inject(ConversationEditService);
  private readonly featureService = inject(FeatureService);

  key = signal('conversation');
  feature = computed(() => this.featureService.getFeatureDetails(this.key()));
  dropzoneMode = computed(() => this.feature()?.mode ?? 'single');
  imageFiles = signal<File[]>([]);

  isEditing = signal(false);
  btnConversationText = computed(() => {
    const action = this.isEditing() ? 'End' : 'Start';
    return `${action} Conversation`;
  });

  error = signal('');

  toggleConversation() {
    this.isEditing.update((prev) => !prev);
  }
}
