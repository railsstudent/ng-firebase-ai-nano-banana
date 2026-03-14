# Refactor LiveImageComponent

## Objective

1. Refactor the `LiveImageComponent` to reuse the existing `ErrorDisplayComponent` for displaying error messages instead of relying on inline HTML styling.
2. Optimize the `canplay` event listener by using RxJS `take(1)` to run the event exactly once, eliminating the need for the `streaming` state flag.
3. Extract complex business logic (data URL conversion and canvas drawing operations) into a new `LiveImageService` to keep the component clean and focused on view coordination.
4. Extract the inline template from the component's TypeScript file into a separate HTML file (`live-image.component.html`) for better separation of concerns and maintainability.

## Key Files & Context

- `src/app/shared/live-image/live-image.component.ts`
- `src/app/shared/live-image/live-image.component.html` (New File)
- `src/app/shared/live-image/services/live-image.service.ts` (New File)
- `src/app/shared/error-display/error-display.component.ts`

## Implementation Steps

### 1. Extract Template to HTML File

1. **Create HTML File**: Create a new file `src/app/shared/live-image/live-image.component.html`.
2. **Move Content**: Cut the inline template string from `LiveImageComponent` and paste it into the new HTML file.
3. **Refactor Error Block**: While moving the template, replace the inline error `div` with `<app-error-display [error]="msg" />`.

**`src/app/shared/live-image/live-image.component.html` Content:**

```html
<div class="relative mx-auto w-full max-w-[500px]">
  @if (errorMessage(); as msg) {
    <app-error-display [error]="msg" />
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
```

### 2. Update Component Decorator

1. **Import ErrorDisplayComponent**: Add `import { ErrorDisplayComponent } from '../error-display/error-display.component';`.
2. **Update Metadata**: Replace `template` with `templateUrl` and add `imports`.

```typescript
@Component({
  selector: 'app-live-image',
  imports: [ErrorDisplayComponent],
  templateUrl: './live-image.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
})
```

### 3. Create `LiveImageService`

1. **Create the File**: Create `src/app/shared/live-image/services/live-image.service.ts`.
2. **Implement Logic**: Extract the logic for taking a photo, clearing a photo, and converting a data URL to a file.

```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LiveImageService {
  
  takePhoto(videoEl: HTMLVideoElement, canvasEl: HTMLCanvasElement): string | null {
    const context = canvasEl.getContext('2d');
    if (context) {
      canvasEl.width = videoEl.videoWidth;
      canvasEl.height = videoEl.videoHeight;
      context.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
      return canvasEl.toDataURL('image/png');
    }
    return null;
  }

  clearPhoto(canvasEl: HTMLCanvasElement): string | null {
    const context = canvasEl.getContext('2d');
    if (context) {
      context.fillStyle = '#aaaaaa';
      context.fillRect(0, 0, canvasEl.width, canvasEl.height);
      return canvasEl.toDataURL('image/png');
    }
    return null;
  }

  convertDataURLToFile(dataUrl: string, filename: string = 'captured-image.png'): File | null {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
      return null;
    }

    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }
}
```

### 4. Optimize Event Listener & Integrate Service

1. **Import `take`**: Include the `take` operator from RxJS.
2. **Remove `streaming` Property**: Delete `streaming = false;`.
3. **Inject Service**: Add `private readonly liveImageService = inject(LiveImageService);`.
4. **Update `setupStreamingListener`**:

```typescript
private setupStreamingListener(): void {
  const videoEl = this.videoNativeElement();

  fromEvent(videoEl, 'canplay')
    .pipe(take(1), takeUntilDestroyed(this.destroyRef))
    .subscribe(() => {
      this.height.set(videoEl.videoHeight / (videoEl.videoWidth / this.width()));
    });
}
```

1. **Update Interaction Methods**:

```typescript
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
```

## Verification & Testing

1. Run `npm run build` or `ng build` to confirm there are no compilation errors.
2. Verify the application runs in the local development environment (`ng serve`).
3. Ensure the camera height is correctly set automatically when the camera feed initializes.
4. Trigger an error in the `LiveImageComponent` (e.g., denying camera permissions) to verify the new error component renders correctly.
5. Verify taking a photo, clearing a photo, and emitting the image file work seamlessly.
