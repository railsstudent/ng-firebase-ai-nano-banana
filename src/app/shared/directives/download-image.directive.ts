import { Directive, HostListener, input, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[appDownloadImage]',
  standalone: true
})
export class DownloadImageDirective {
  private readonly document = inject(DOCUMENT);

  inlineData = input.required<string>({ alias: 'appDownloadImage' });
  filename = input('generated_image');

  @HostListener('click')
  onClick(): void {
    const inlineData = this.inlineData();
    if (!inlineData) {
      return;
    }

    let rawFilename = this.filename() || 'generated_image';

    // Verify if the filename is English (ASCII characters only)
    const isEnglish = /^[\x00-\x7F]*$/.test(rawFilename);
    if (!isEnglish) {
      rawFilename = 'generated_image';
    }

    const link = this.document.createElement('a');
    link.href = inlineData;

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
