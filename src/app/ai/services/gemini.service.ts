import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { GenerateVideosParameters } from '@google/genai';
import { catchError, firstValueFrom, map, retry, throwError } from 'rxjs';
import firebaseConfig from '../../firebase-ai.json';
import { GEMINI_AI } from '../constants/gemini.constant';
import { GenerateVideoRequest } from '../types/generate-video.type';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private readonly ai = inject(GEMINI_AI);
  private readonly http = inject(HttpClient);

  async generateVideo(request: GenerateVideoRequest): Promise<string> {
    const genVideosParams: GenerateVideosParameters = {
      model: firebaseConfig.geminiVideoModelName,
      prompt: request.prompt,
      config: {
        ...request.config,
        numberOfVideos: 1
      },
      image: {
        imageBytes: request.imageBytes,
        mimeType: request.mimeType
      }
    };

    const videoLink = await this.generateDownloadLink(genVideosParams);
    return this.downloadVideo(videoLink);
  }

  private async generateDownloadLink(genVideosParams: GenerateVideosParameters): Promise<string> {
    let operation = await this.ai.models.generateVideos(genVideosParams);
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, firebaseConfig.poillingPeriod));
      operation = await this.ai.operations.getVideosOperation({ operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      const strError = 'Video generation finished but no download link was provided.';
      console.error(strError);
      throw new Error(strError);
    }

    return downloadLink;
  }

  private async downloadVideo(downloadLink: string): Promise<string> {
    const blobUrl$ = this.http.get(`${downloadLink}&key=${firebaseConfig.geminiAPIKey}`, {
      responseType: 'blob'
    }).pipe(
      map((blob) => URL.createObjectURL(blob)),
      retry({ count: 2, delay: 300 }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err)
      })
    );

    return await firstValueFrom(blobUrl$);
  }
}
