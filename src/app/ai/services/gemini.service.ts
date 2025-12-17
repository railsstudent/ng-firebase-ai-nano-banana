import { inject, Injectable } from '@angular/core';
import { httpsCallable } from 'firebase/functions';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { GenerateVideoRequest } from '../types/video.type';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private readonly storage = getStorage();
  private readonly configService = inject(ConfigService);

  async retrieveVideoUri(request: GenerateVideoRequest, methodName: string): Promise<string> {
    try {
      const functions = this.configService.functions;
      if (!functions) {
        throw new Error('Functions does not exist.');
      }

      console.log('retrieveVideoUri -> functions region', functions.region);
      const downloadGcsUri = httpsCallable<GenerateVideoRequest, string>(
        functions, methodName
      );
      const { data: gcsUri } = await downloadGcsUri(request);
      return gcsUri;
    } catch (err) {
        console.error(err);
        throw err;
    }
  }

  async downloadVideoAsUrl(request: GenerateVideoRequest, methodName='videos-generateVideo'): Promise<string> {
    const gcsUri = await this.retrieveVideoUri(request, methodName);

    if (!gcsUri) {
      throw new Error('Video operation completed but no URI was returned.');
    }

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
