import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { FeatureService } from '../services/feature.service';

export const figurineResolver: ResolveFn<string> = () => {
  const featureService = inject(FeatureService);
  return featureService.getFeatureName('figurine');
};
