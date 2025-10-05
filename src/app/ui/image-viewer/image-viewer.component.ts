import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { DownloadIconComponent } from '../icons/download-icon.component';
import { TrashIconComponent } from '../icons/trash-icon.component';
import { ImageStyleComponent } from '../image-style/image-style.component';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-image-viewer',
  imports: [DownloadIconComponent, TrashIconComponent, ImageStyleComponent, LoaderComponent],
  templateUrl: './image-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageViewerComponent {
  isLoading = input(false);
  url = input('');
  loadingText = input('');

  imageFilterStyle = signal<string>('');

  downloadImage = output();
  clearImage = output();
}
