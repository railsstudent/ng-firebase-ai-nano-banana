import { ErrorDisplayComponent } from '@/shared/error-display/error-display.component';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, OnDestroy, output, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, take } from 'rxjs';
import { LiveImageService } from './services/live-image.service';

const WIDTH = 320;

@Component({
  selector: 'app-live-image',
  imports: [ErrorDisplayComponent],
  templateUrl: './live-image.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
})
export class LiveImageComponent implements OnDestroy {
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

  constructor() {
    afterNextRender(async () => await this.setupCamera());
  }

  private setupStreamingListener(): void {
    const videoEl = this.videoNativeElement();

    fromEvent(videoEl, 'canplay')
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.height.set(videoEl.videoHeight / (videoEl.videoWidth / this.width())));
  }

  async setupCamera(constraints: MediaStreamConstraints = { video: true }) {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      const videoEl = this.videoNativeElement();

      this.setupStreamingListener();
      if (videoEl && this.stream) {
        videoEl.srcObject = this.stream;
        await videoEl.play();
      }
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Error accessing camera';
      this.errorMessage.set(msg);
      console.error('Error accessing camera:', err);
    }
  }

  takePhoto() {
    const videoEl = this.videoNativeElement();
    const canvasEl = this.canvasNativeElement();

    if (videoEl && canvasEl) {
      const dataUrl = this.liveImageService.takePhoto(videoEl, canvasEl);
      if (dataUrl) {
        this.currentImageURL.set(dataUrl);
      }
    }
  }

  clearPhoto() {
    const canvasEl = this.canvasNativeElement();
    const dataUrl = this.liveImageService.clearPhoto(canvasEl);
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

  ngOnDestroy() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
  }
}
