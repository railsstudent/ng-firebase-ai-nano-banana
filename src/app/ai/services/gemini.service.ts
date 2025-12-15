import config from '@/firebase-project/config.json';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { catchError, lastValueFrom, map, throwError } from 'rxjs';
import { GenerateVideoRequest } from '../types/generate-video.type';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private readonly http = inject(HttpClient);
  private readonly storage = getStorage();

  private async retrieveVideoUri(request: GenerateVideoRequest): Promise<string> {
    const uri$ = this.http.post<{ uri: string }>(
      `${config.appUrl}/generateVideo`, request
    )
      .pipe(
        map(response => response.uri),
        catchError((err) => {
          console.error(err);
          return throwError(() => err)
        })
      );

    return lastValueFrom(uri$);
  }

  async downloadVideoAsBase64(request: GenerateVideoRequest): Promise<string> {
    const gcsUri = await this.retrieveVideoUri(request);

    return getDownloadURL(ref(this.storage, gcsUri))
      .then((url) => {
        console.log("download url", url);
        return url;
      })
      .catch((error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case 'storage/object-not-found':
            throw new Error("File doesn't exist");
          case 'storage/unauthorized':
            throw new Error("User doesn't have permission to access the object");
          case 'storage/canceled':
            throw new Error("User canceled the upload");
          case 'storage/unknown':
            throw new Error("Unknown storage error occurred, inspect the server response");
        }
        throw new Error("Unknown error occurred");
      });
  }

}
