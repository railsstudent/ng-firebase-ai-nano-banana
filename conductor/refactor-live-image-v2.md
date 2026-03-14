# Refactor LiveImageComponent (Phase 2)

## Analysis & Objective

The `LiveImageComponent` has already been refactored to use `LiveImageService`, extract its HTML template, and use signals for properties. However, there are a few remaining edge cases and modernizations needed:

1. **Fix Memory Leak:** Ensure previous camera stream tracks are stopped before requesting a new stream in `setupCamera`. If `setupCamera` is called multiple times, the old tracks are not stopped, leading to a memory leak and locked camera light.
2. **Modernize Lifecycle:** Remove `ngOnDestroy` and the `OnDestroy` interface. Use Angular v16+ `DestroyRef.onDestroy` directly in the constructor to clean up the stream.
3. **Simplify ViewChild Logic:** Remove redundant null-checks (`if (videoEl && canvasEl)`) in methods like `takePhoto`. Because `videoNativeElement` and `canvasNativeElement` are derived from `viewChild.required`, they are guaranteed to exist when these methods are called.

## Key Files & Context

- `src/app/shared/live-image/live-image.component.ts`

## Implementation Steps

### 1. Modernize Component Lifecycle

- Remove `implements OnDestroy` from the `LiveImageComponent` class signature.
- Remove the `ngOnDestroy()` methsod.
- In the `constructor`, register a cleanup callback using `this.destroyRef.onDestroy()` to stop the stream tracks when the component is destroyed.

### 2. Fix Stream Track Memory Leak & Simplify Methods

- Create a private `stopStream()` method that iterates over `this.stream?.getTracks()` and calls `track.stop()`.
- Use this `stopStream()` method inside the `destroyRef.onDestroy` callback and at the very beginning of `setupCamera()`.
- Remove the `if (videoEl && canvasEl)` and `if (videoEl && this.stream)` null-checks, as `videoNativeElement` and `canvasNativeElement` are derived from `viewChild.required`.

### 3. Update `live-image.component.ts` (Target State)

Update the component to reflect these changes. The final component should look like this:

```typescript
import { ErrorDisplayComponent } from '../error-display/error-display.component';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, output, signal, viewChild } from '@angular/core';
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

  takePhoto() {
    const videoEl = this.videoNativeElement();
    const canvasEl = this.canvasNativeElement();

    const dataUrl = this.liveImageService.takePhoto(videoEl, canvasEl);
    if (dataUrl) {
      this.currentImageURL.set(dataUrl);
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
}
```

## Verification & Testing

1. Run `npm run build` or `ng build` to confirm there are no compilation errors after removing `OnDestroy`.
2. Test camera permission granting and verify that the stream initializes correctly.
3. Verify photo capturing, clearing, and file emission functionality remains intact.
