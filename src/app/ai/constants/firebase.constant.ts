import { InjectionToken } from '@angular/core';
import { GenerativeModel } from 'firebase/ai';

export const NANO_BANANA_MODEL = new InjectionToken<GenerativeModel>('NANO_BANANA_MODEL');
export const RESTORE_PHOTO_MODEL = new InjectionToken<GenerativeModel>('RESTORE_PHOTO_MODEL');
export const ACTION_FIGURE_MODEL = new InjectionToken<GenerativeModel>('ACTION_FIGURE_MODEL');
