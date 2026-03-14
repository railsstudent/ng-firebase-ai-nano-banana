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

  generateThumbnail(dataURL: string, width: number = 100): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        const scaleFactor = width / img.width;
        canvas.width = width;
        canvas.height = img.height * scaleFactor;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = (err) => reject(err);
      img.src = dataURL;
    });
  }
}
