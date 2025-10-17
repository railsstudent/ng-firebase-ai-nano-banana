import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DownloadIconComponent } from '../icons/download-icon.component';
import { TrashIconComponent } from '../icons/trash-icon.component';
import { VideoIconComponent } from '../icons/video-icon.component';
import { LoaderComponent } from '../loader/loader.component';
import { ImageActions } from '../types/actions.type';

@Component({
  selector: 'app-image-viewer',
  imports: [DownloadIconComponent, TrashIconComponent, LoaderComponent, VideoIconComponent],
  templateUrl: './image-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageViewerComponent {
  isLoading = input(false);
  url = input('');
  loadingText = input('');
  id = input(0);

  imageAction = output<{ action: ImageActions, context?: unknown }>();
}
