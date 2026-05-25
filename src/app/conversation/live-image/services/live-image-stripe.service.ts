import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LiveImageStripeService {
  #newSnapshot = signal<string | null>(null);
  newSnapshot = this.#newSnapshot.asReadonly();

  addSnapshot(dataURL: string) {
    this.#newSnapshot.set(dataURL);
  }

  generateThumbnail(dataURL: string, canvas: HTMLCanvasElement, width = 100): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      console.log('image width', img.width);

      img.onload = () => {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }

        const scaleFactor = width / img.width;
        canvas.width = width;
        canvas.height = img.height * scaleFactor;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return resolve(canvas.toDataURL('image/png', 0.7));
      };
      img.onerror = (err) => reject(err);
      img.src = dataURL;
    });
  }
}
