import { makeEnvironmentProviders } from '@angular/core';
import { getAI, getGenerativeModel, GoogleAIBackend, ResponseModality } from 'firebase/ai';
import { initializeApp } from "firebase/app";
import firebaseConfig from '../../firebase-ai.json';
import { FIGURINE_MODEL, NANO_BANANA_MODEL, RESTORE_PHOTO_MODEL } from '../constants/firebase.constant';

const { app, geminiModelName = 'gemini-2.5-flash-image-preview' } = firebaseConfig;
const firebaseApp = initializeApp(app);
const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });

const defaultConfig = {
  model: geminiModelName,
  generationConfig: {
      responseModalities: [ResponseModality.TEXT, ResponseModality.IMAGE],
  }
};

export function provideFirebase() {
    return makeEnvironmentProviders([
        {
            provide: NANO_BANANA_MODEL,
            useFactory: () => getGenerativeModel(ai, defaultConfig)
        },
        {
          // https://www.easemate.ai/ai-resources/how-to-restore-old-photos-with-nano-banana.html
          provide: RESTORE_PHOTO_MODEL,
          useFactory: () =>
              getGenerativeModel(ai, {
                  ...defaultConfig,
                  systemInstruction: 'Restore this photograph to its original quality. Remove scratches, enhance details, correct colors, and make it look as close to the original as possible when it was first taken.',
              })
        },
        {
          provide: FIGURINE_MODEL,
          useFactory: () => getGenerativeModel(ai, {
                ...defaultConfig,
                systemInstruction: 'First ask me to upload an image and then create a 1/7 scale commercialized figurine of the characters in the picture, in a realistic style, in a real environment. The figurine is placed on a computer desk. The figurine has a round transparent acrylic base, with no text on the base. The content on the computer screen is a 3D modeling process of this figurine. Next to the computer screen is a toy packaging box, designed in a style reminiscent of high-quality collectible figures, printed with original artwork. The packaging features two-dimensional flat illustrations.',
            })
        },
    ]);
}
