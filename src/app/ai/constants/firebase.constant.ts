import { InjectionToken } from '@angular/core';
import { GenerativeModel } from '@angular/fire/ai';

export const NANO_BANANA_MODEL = new InjectionToken<GenerativeModel>('NANO_BANANA_MODEL');
