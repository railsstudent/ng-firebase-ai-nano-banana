import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { FeatureService } from '../services/feature.service';

export const featureNameResolver: ResolveFn<string> = (route: ActivatedRouteSnapshot) => {
  const navigationService = inject(FeatureService);
  const featureId = route.paramMap.get('featureId');

  if (!featureId) {
    return 'Editor';
  }

  const feature = navigationService.getFeatures().find(f => f.id === featureId);
  if (feature) {
    return feature.name;
  }

  // Fallback for featureIds not present in the navigation service.
  // This mimics the previous title logic from the editor component.
  return featureId.charAt(0).toUpperCase() + featureId.slice(1).replace(/-/g, ' ');
};
