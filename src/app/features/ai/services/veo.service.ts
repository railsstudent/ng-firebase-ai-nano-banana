import { inject, Injectable } from '@angular/core';
import { httpsCallable } from 'firebase/functions';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { CallableNames, DownloadVideoResponse, GenerateVideoRequest, VideoGenerationResponse } from '../types/video.type';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class VeoService {
  private readonly storage = getStorage();
  private readonly configService = inject(ConfigService);

  private async retrieveVideoUri<T = GenerateVideoRequest>(request: T, methodName: string): Promise<DownloadVideoResponse> {
    try {
      const { functions } = this.configService.firebaseObjects || {};
      if (!functions) {
        throw new Error('Functions does not exist.');
      }

      console.log('retrieveVideoUri -> functions region', functions.region);
      const downloadGcsUri = httpsCallable<T, DownloadVideoResponse>(
        functions, methodName, { timeout: 600000 }
      );
      const { data } = await downloadGcsUri(request);
      return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
  }

  async downloadVideoUriAndUrl<T = GenerateVideoRequest>(request: T, methodName: CallableNames = 'videos-generateVideo'): Promise<VideoGenerationResponse> {
    const { uri, mimeType } = await this.retrieveVideoUri(request, methodName);

    if (!uri) {
      throw new Error('Video operation completed but no URI was returned.');
    }

    return getDownloadURL(ref(this.storage, uri))
      .then((url) => {
        console.log("download url", url);
        return { uri, url, mimeType };
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
