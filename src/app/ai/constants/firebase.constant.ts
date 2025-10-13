import { InjectionToken } from '@angular/core';
import { GenerativeModel } from 'firebase/ai';

export const NANO_BANANA_MODEL = new InjectionToken<GenerativeModel>('NANO_BANANA_MODEL');

export const STORY_NANO_BANANA_MODEL = new InjectionToken<GenerativeModel>('STORY_NANO_BANANA_MODEL');
