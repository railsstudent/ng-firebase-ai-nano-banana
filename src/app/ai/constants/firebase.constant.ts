import { InjectionToken } from '@angular/core';
import { GenerativeModel } from 'firebase/ai';

export const GEMINI_IMAGE_MODEL = new InjectionToken<GenerativeModel>('GEMINI_IMAGE_MODEL');
