import { ErrorDisplayComponent } from '@/shared/error-display/error-display.component';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, output, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, take } from 'rxjs';
import { LiveImageControlsComponent } from './live-image-controls/live-image-controls.component';
import { LiveImagesStripeComponent } from './live-images-stripe/live-images-stripe.component';
import { LiveImageService } from './services/live-image.service';

const WIDTH = 320;

@Component({
  selector: 'app-live-image',
  imports: [ErrorDisplayComponent, LiveImageControlsComponent, LiveImagesStripeComponent],
  templateUrl: './live-image.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
})
export class LiveImageComponent {
  video = viewChild.required<ElementRef<HTMLVideoElement>>('videoElement');
  canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvasElement');

  useThisImage = output<File>();

  currentImageURL = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  width = signal(WIDTH);
  height = signal(0);

  private stream: MediaStream | null = null;
  private readonly destroyRef = inject(DestroyRef);
  private readonly liveImageService = inject(LiveImageService);

  videoNativeElement = computed(() => this.video().nativeElement);
  canvasNativeElement = computed(() => this.canvas().nativeElement);
  hasURL = computed(() => !!this.currentImageURL());

  constructor() {
    this.destroyRef.onDestroy(() => this.stopStream());
    afterNextRender(async () => await this.setupCamera());
  }

  private stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  private setupStreamingListener(): void {
    const videoEl = this.videoNativeElement();

    fromEvent(videoEl, 'canplay')
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.height.set(videoEl.videoHeight / (videoEl.videoWidth / this.width())));
  }

  async setupCamera(constraints: MediaStreamConstraints = { video: true }) {
    this.stopStream();

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      const videoEl = this.videoNativeElement();

      this.setupStreamingListener();
      videoEl.srcObject = this.stream;
      await videoEl.play();
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Error accessing camera';
      this.errorMessage.set(msg);
      console.error('Error accessing camera:', err);
    }
  }

  handleCameraAction(action: 'capture' | 'clear' | 'use') {
    switch (action) {
      case 'capture':
        this.takePhoto();
        break;
      case 'clear':
        this.clearPhoto();
        break;
      case 'use':
        this.convertDataURLToFile();
        break;
      default:
        break;
    }
  }

  takePhoto() {
    const dataUrl = this.liveImageService.takePhoto(this.videoNativeElement(), this.canvasNativeElement());
    if (dataUrl) {
      this.currentImageURL.set(dataUrl);
    }
  }

  clearPhoto() {
    const dataUrl = this.liveImageService.clearPhoto(this.canvasNativeElement());
    if (dataUrl) {
      this.currentImageURL.set(dataUrl);
    }
  }

  convertDataURLToFile() {
    const dataUrl = this.currentImageURL();
    if (!dataUrl) {
      return;
    }

    const file = this.liveImageService.convertDataURLToFile(dataUrl);
    if (file) {
      this.useThisImage.emit(file);
    }
  }
}
