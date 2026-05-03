import { InjectionToken } from '@angular/core';
import { AI, GenerativeModel, TemplateGenerativeModel } from 'firebase/ai';

export const VERTEX_AI_BACKEND = new InjectionToken<AI>('VERTEX_AI_BACKEND');

export const GEMINI_IMAGE_MODEL = new InjectionToken<GenerativeModel>('GEMINI_IMAGE_MODEL');

export const SERVER_TEMPLATE_MODEL = new InjectionToken<TemplateGenerativeModel>('SERVER_TEMPLATE_MODEL');
