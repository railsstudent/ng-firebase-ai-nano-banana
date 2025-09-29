import { Type } from '@angular/core';

export type Feature = {
  id: string;
  name: string;
  icon: Type<any>;
  mode?: 'single' | 'multiple';
};
