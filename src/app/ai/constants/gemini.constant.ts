import { InjectionToken } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

export const GEMINI_AI = new InjectionToken<GoogleGenAI>('GEMINI_AI');

