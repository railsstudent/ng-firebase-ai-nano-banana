import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, OnDestroy, output, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

const WIDTH = 320;

@Component({
  selector: 'app-live-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
  template: `
    <div class="relative mx-auto w-full max-w-[500px]">
      @if (errorMessage(); as msg) {
        <div class="rounded-lg border border-red-500 bg-red-100 p-4 text-center text-red-700">
          <p>{{ msg }}</p>
        </div>
      } @else {
        <div class="flex justify-center">
        <video
          #videoElement
          autoplay
          playsinline
          [height]="height()"
          [width]="width()"
          class="block rounded-lg shadow-sm"
        ></video>

        @if (currentImageURL()) {
          <img
            [src]="currentImageURL()"
            alt="Captured Image"
            [height]="height()"
            [width]="width()"
            class="block rounded-lg shadow-sm"
          />
        }
        </div>

        <div class="mt-4 flex justify-center gap-2">
          <button
            (click)="takePhoto()"
            class="cursor-pointer rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Capture Photo
          </button>
          @if (currentImageURL()) {
            <button
              (click)="clearPhoto()"
              class="cursor-pointer rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Clear Photo
            </button>
            <button
              (click)="convertDataURLToFile()"
              class="cursor-pointer rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Use This
            </button>
          }
        </div>
      }
    </div>
    <canvas
      #canvasElement
      style="display: none;"
      [height]="height()"
      [width]="width()"
    ></canvas>
  `,
})
export class LiveImageComponent implements OnDestroy {
  video = viewChild.required<ElementRef<HTMLVideoElement>>('videoElement');
  canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvasElement');

  useThisImage = output<File>();

  currentImageURL = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
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
    this.useThisImage.emit(file);
  }

  ngOnDestroy() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
  }
}
