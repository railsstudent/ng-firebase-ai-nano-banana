import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-style',
  imports: [FormsModule],
  templateUrl: './image-style.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageStyleComponent {
  // Image quality signals
  brightness = signal(100);
  contrast = signal(100);
  saturation = signal(100);

  imageFilterStyle = computed(() => {
    const normalizedBrightness = this.brightness() / 100;
    const normalizedContrast = this.contrast() / 100;
    const normalizedSaturation = this.saturation() / 100;
    return `brightness(${normalizedBrightness}) contrast(${normalizedContrast}) saturate(${normalizedSaturation})`
  });

  styleChanged = output<string>();

  constructor() {
    effect(() => {
      this.styleChanged.emit(this.imageFilterStyle());
    })
  }

  resetImageControls(): void {
    this.brightness.set(100);
    this.contrast.set(100);
    this.saturation.set(100);
  }
}
