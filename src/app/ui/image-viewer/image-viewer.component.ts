import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { DownloadIconComponent } from '../../editor/icons/download-icon.component';
import { ImageStyleComponent } from '../image-style/image-style.component';

@Component({
  selector: 'app-image-viewer',
  imports: [DownloadIconComponent, ImageStyleComponent],
  templateUrl: './image-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageViewerComponent {
  url = input('');

  // Image quality signals
  // brightness = signal(100);
  // contrast = signal(100);
  // saturation = signal(100);

  // imageFilterStyle = computed(() => {
  //   const normalizedBrightness = this.brightness() / 100;
  //   const normalizedContrast = this.contrast() / 100;
  //   const normalizedSaturation = this.saturation() / 100;
  //   return `brightness(${normalizedBrightness}) contrast(${normalizedContrast}) saturate(${normalizedSaturation})`
  // });

  downloadImage = output();
  imageFilterStyle = signal<string>('');

  // resetImageControls(): void {
  //   this.brightness.set(100);
  //   this.contrast.set(100);
  //   this.saturation.set(100);
  // }
}
