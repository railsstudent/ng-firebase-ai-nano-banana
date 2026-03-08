import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, OnDestroy, output, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

const WIDTH = 320;

@Component({
  selector: 'app-live-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="camera-container">
      <video #videoElement autoplay playsinline
        [height]="height()"
        [width]="width()">
      </video>

      @if (currentImageURL()) {
        <img [src]="currentImageURL()"
          alt="Captured Image"
          [height]="height()"
          [width]="width()"
        />
      }

      <div class="controls">
        <button (click)="takePhoto()">Capture Photo</button>
        @if (currentImageURL()) {
          <button (click)="clearPhoto()">Clear Photo</button>
          <button (click)="convertDataURLToFile()">Use This</button>
        }
      </div>
    </div>
    <canvas #canvasElement style="display: none;"
        [height]="height()"
        [width]="width()"
    ></canvas>
  `,
  styles: `
    :host {
      display: block;
    }
    .camera-container {
      position: relative;
      width: 100%;
      max-width: 500px;
      margin: 0 auto;
    }
    video, img {
      border-radius: 8px;
      display: block;
    }
    .controls {
      margin-top: 1rem;
      display: flex;
      justify-content: center;
      gap: 0.5rem;
    }
    button {
      padding: 8px 16px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background: #0056b3;
    }
  `,
})
export class LiveImageComponent implements OnDestroy {
  video = viewChild.required<ElementRef<HTMLVideoElement>>('videoElement');
  canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvasElement');

  useThisImage = output<File>();

  currentImageURL = signal<string | null>(null);
  width = signal(WIDTH);
  height = signal(0);
  streaming = false;

  private stream: MediaStream | null = null;
  private readonly destroyRef = inject(DestroyRef);

  videoNativeElement = computed(() => this.video().nativeElement);
  canvasNativeElement = computed(() => this.canvas().nativeElement);

  constructor() {
    afterNextRender(async () => await this.setupCamera());
  }

  private setupStreamingListener(): void {
    const videoEl = this.videoNativeElement();

    fromEvent(videoEl, 'canplay')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.streaming) {
          this.height.set(videoEl.videoHeight / (videoEl.videoWidth / this.width()));
          this.streaming = true;
        }
      });
  }

  async setupCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      const videoEl = this.videoNativeElement();

      this.setupStreamingListener();
      if (videoEl && this.stream) {
        videoEl.srcObject = this.stream;
        await videoEl.play();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  }

  takePhoto() {
    const videoEl = this.videoNativeElement();
    const canvasEl = this.canvasNativeElement();

    if (videoEl && canvasEl) {
      const context = canvasEl.getContext('2d');
      if (context) {
        canvasEl.width = videoEl.videoWidth;
        canvasEl.height = videoEl.videoHeight;
        context.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
        this.currentImageURL.set(canvasEl.toDataURL('image/png'));
      }
    }
  }

  clearPhoto() {
    const canvasEl = this.canvasNativeElement();
    const context = canvasEl.getContext('2d');
    if (context) {
      context.fillStyle = '#aaaaaa';
      context.fillRect(0, 0, canvasEl.width, canvasEl.height);
      this.currentImageURL.set(canvasEl.toDataURL('image/png'));
    }
  }

  convertDataURLToFile() {
    const dataUrl = this.currentImageURL();
    if (!dataUrl) {
      return;
    }

    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
      return;
    }

    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    const file = new File([u8arr], 'captured-image.png', { type: mime });
    console.log(file);
    this.useThisImage.emit(file);
  }

  ngOnDestroy() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }
}
