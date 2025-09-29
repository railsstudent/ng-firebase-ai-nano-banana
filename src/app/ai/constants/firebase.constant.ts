import { InjectionToken } from '@angular/core';
import { GenerativeModel } from 'firebase/ai';

export const NANO_BANANA_MODEL = new InjectionToken<GenerativeModel>('NANO_BANANA_MODEL');
export const RESTORE_PHOTO_MODEL = new InjectionToken<GenerativeModel>('RESTORE_PHOTO_MODEL');
export const FIGURINE_MODEL = new InjectionToken<GenerativeModel>('FIGURINE_MODEL');
