import { InjectionToken } from '@angular/core';
import { AI, TemplateGenerativeModel } from 'firebase/ai';

export const VERTEX_AI_BACKEND = new InjectionToken<AI>('VERTEX_AI_BACKEND');

export const SERVER_TEMPLATE_MODEL = new InjectionToken<TemplateGenerativeModel>('SERVER_TEMPLATE_MODEL');
