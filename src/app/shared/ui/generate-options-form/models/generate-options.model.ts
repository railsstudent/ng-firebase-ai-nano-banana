import { signal } from '@angular/core';
import { GenerateOptions } from '../types/generate-options.type';

export const GenerateOptionsModel = signal<GenerateOptions>({
  resolution: '1K',
  aspectRatio: '4:3',
});
