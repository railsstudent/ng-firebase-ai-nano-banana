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
