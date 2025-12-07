import { Injectable } from '@angular/core';
import { DEFAULT_FEATURE, FEATURE_NESTED_LIST } from '../constants/features.const';
import { FeatureDetails } from '../types/feature-details.type';
import { buildNavigationBars } from '../util/navbar.util';

const navbar = buildNavigationBars();

@Injectable({
  providedIn: 'root'
})
export class FeatureService {
  getNavBars() {
    return navbar;
  }

  getFeatureName(featureId: string) {
    for (const { menu } of navbar) {
      const editItem = menu.find(f => f.id === featureId);
      if (editItem) {
        return editItem.name;
      }
    }

    // Fallback for featureIds not present in the navigation service.
    // This mimics the previous title logic from the editor component.
    return featureId.charAt(0).toUpperCase() + featureId.slice(1).replace(/-/g, ' ');
  }

  getFeatureDetails(featureId: string): FeatureDetails {
    for (const featureList of FEATURE_NESTED_LIST) {
      if (featureList[featureId]) {
        return featureList[featureId];
      }
    }

    return DEFAULT_FEATURE;
  }
}
