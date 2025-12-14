import config from '@/firebase-project/config.json';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, lastValueFrom, map, throwError } from 'rxjs';
import { GenerateVideoRequest } from '../types/generate-video.type';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private readonly http = inject(HttpClient);

  async generateVideo(request: GenerateVideoRequest): Promise<string> {
    const videoBytes$ = this.http.post<{ videoBytes: string }>(
      `${config.appUrl}/generateVideo`, request
    )
      .pipe(
        map(response => response.videoBytes),
        catchError((err) => {
          console.error(err);
          return throwError(() => err)
        })
      );

    return lastValueFrom(videoBytes$);
  }
}
