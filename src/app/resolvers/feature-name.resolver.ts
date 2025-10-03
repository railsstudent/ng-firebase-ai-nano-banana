import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { FeatureService } from '../feature/services/feature.service';

export const featureNameResolver: ResolveFn<string> = (route: ActivatedRouteSnapshot) => {
  const featureService = inject(FeatureService);
  const featureId = route.paramMap.get('featureId');

  if (!featureId) {
    return 'Editor';
  }

  return featureService.getFeatureName(featureId);
};
