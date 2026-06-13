# Specification: Refactor downloadImage to a Directive

## Objective
Decouple the DOM-dependent download logic from the business logic of `GenMediaService` and encapsulate it within an Angular directive. This improves separation of concerns, ensures SSR compatibility, makes the service fully testable, and simplifies the event bubbling flow.

## Architectural Design

### 1. `DownloadImageDirective`
- **Selector:** `[appDownloadImage]`
- **Inputs (using Signal Inputs):**
  - `imageUrl`: `input.required<string>({ alias: 'appDownloadImage' })` (The data URL of the image to download)
  - `filename`: `input<string>('generated_image')` (The name of the file)
- **HostListener:**
  - `@HostListener('click')` triggers the download flow using Angular `DOCUMENT` token, referencing `this.imageUrl()` and `this.filename()`.
- **Path:** `src/app/shared/ui/gen-media/directives/download-image.directive.ts`

### 2. Service Refactoring (`GenMediaService`)
- Remove the `downloadImage` method.
- Remove `DOCUMENT` token injection.

### 3. Component Updates
- **`ImageViewerComponent`**:
  - Accept `filename` as a signal input.
  - Import `DownloadImageDirective` in its metadata.
  - Apply `[appDownloadImage]="url()"` and `[filename]="filename()"` directly to the download button in `image-viewer.component.html`.
  - Remove the custom `imageAction` emission for `'downloadImage'`.
- **`ImageViewersComponent`**:
  - Accept `filename` as a signal input and pass it to `<app-image-viewer>`.
- **`GenMediaComponent`**:
  - Bind `[filename]="trimmedUserPrompt() || 'generated_image'"` to `<app-image-viewers>`.
  - Remove `'downloadImage'` case from `handleAction()` and remove `downloadImageById()`.

---

## Detailed Step-by-Step Plan

### Step 1: Create the Directive
Create `src/app/shared/ui/gen-media/directives/download-image.directive.ts`.
In the directive, we will validate if the filename is English (ASCII characters only). If it contains non-English characters, we fall back to `'generated_image'`.
```typescript
import { Directive, HostListener, input, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[appDownloadImage]',
  standalone: true
})
export class DownloadImageDirective {
  private readonly document = inject(DOCUMENT);

  imageUrl = input.required<string>({ alias: 'appDownloadImage' });
  filename = input('generated_image');

  @HostListener('click')
  onClick(): void {
    const url = this.imageUrl();
    if (!url) {
      return;
    }

    let rawFilename = this.filename() || 'generated_image';

    // Verify if the filename is English (ASCII characters only)
    const isEnglish = /^[\x00-\x7F]*$/.test(rawFilename);
    if (!isEnglish) {
      rawFilename = 'generated_image';
    }

    const link = this.document.createElement('a');
    link.href = url;

    const safeFilename = rawFilename
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()
      .substring(0, 50);

    link.download = `${safeFilename}.png`;
    this.document.body.appendChild(link);
    link.click();
    this.document.body.removeChild(link);
  }
}
```

### Step 2: Refactor `GenMediaService`
- Remove lines related to `DOCUMENT` injection.
- Remove the `downloadImage` function entirely.

### Step 3: Propagate `filename` input down
- Add `filename = input('generated_image')` to `ImageViewersComponent`.
- Add `filename = input('generated_image')` to `ImageViewerComponent`.

### Step 4: Update Templates & Imports
- In `ImageViewerComponent` imports, add `DownloadImageDirective`.
- In `image-viewer.component.html`, replace:
  ```html
  (click)="imageAction.emit({ action: 'downloadImage', context: id() })"
  ```
  with:
  ```html
  [appDownloadImage]="url()"
  [filename]="filename()"
  ```
- Pass `[filename]="filename()"` in `ImageViewersComponent` to `<app-image-viewer>`.
- Pass `[filename]="trimmedUserPrompt()"` in `GenMediaComponent` to `<app-image-viewers>`.

### Step 5: Clean up Component logic in `GenMediaComponent`
- Remove `downloadImageById()` method.
- Remove `downloadImage` action handling from `handleAction()`.
