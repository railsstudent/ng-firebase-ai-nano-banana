import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { DownloadIconComponent } from '../icons/download-icon.component';
import { TrashIconComponent } from '../icons/trash-icon.component';
import { ImageStyleComponent } from '../image-style/image-style.component';

@Component({
  selector: 'app-image-viewer',
  imports: [DownloadIconComponent, TrashIconComponent, ImageStyleComponent],
  templateUrl: './image-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageViewerComponent {
  url = input('');
  imageFilterStyle = signal<string>('');

  downloadImage = output();
  clearImage = output();
}
