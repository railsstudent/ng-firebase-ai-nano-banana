import { Type } from '@angular/core';
import { FeatureDetails } from './feature-details.type';

export type Feature = Pick<FeatureDetails, 'name' | 'path' | 'mode'> & {
  id: string;
  icon: Type<any>;
};
