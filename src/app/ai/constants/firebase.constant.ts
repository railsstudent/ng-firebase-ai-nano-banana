import { InjectionToken } from '@angular/core';
import { AI, GenerativeModel, ModelParams } from 'firebase/ai';

export const NANO_BANANA_MODEL = new InjectionToken<GenerativeModel>('NANO_BANANA_MODEL');
export const FIREBASE_AI = new InjectionToken<AI>('FIREBASE_AI')
