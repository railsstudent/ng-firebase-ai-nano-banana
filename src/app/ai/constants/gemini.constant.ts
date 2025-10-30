import { InjectionToken } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

export const GEMINI_AI = new InjectionToken<GoogleGenAI>('GEMINI_AI');

export const FIRST_LAST_FRAMES_VIDEO_ENABLED = new InjectionToken<boolean>('FIRST_LAST_FRAMES_VIDEO_ENABLED');
