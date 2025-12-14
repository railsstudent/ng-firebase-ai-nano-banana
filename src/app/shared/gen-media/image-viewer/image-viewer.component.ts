import { DownloadIconComponent } from '@/shared/icons/download-icon.component';
import { TrashIconComponent } from '@/shared/icons/trash-icon.component';
import { VideoIconComponent } from '@/shared/icons/video-icon.component';
import { LoaderComponent } from '@/shared/loader/loader.component';
import { ImageActions } from '@/shared/types/actions.type';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ImageViewerCapabilities } from '../types/image-viewer-capabilities.type';

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
  capabilities = input<ImageViewerCapabilities>({
    download: true,
    video: true,
    clearImage: true
  });
  imageSize = input({ width: 512, height: 512 });

  imageAction = output<{ action: ImageActions, context?: unknown }>();
}
