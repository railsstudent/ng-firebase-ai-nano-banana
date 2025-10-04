import { Injectable } from '@angular/core';
import { CubeIconComponent } from '../../navigation/icons/cube-icon.component';
import { HistoryIconComponent } from '../../navigation/icons/history-icon.component';
import { MagicWandIconComponent } from '../../navigation/icons/magic-wand-icon.component';
import { MapIconComponent } from '../../navigation/icons/map-icon.component';
import { ScissorsIconComponent } from '../../navigation/icons/scissors-icon.component';
import { SparklesIconComponent } from '../../navigation/icons/sparkles-icon.component';
import featureConfigs from '../features.json';
import { FeatureDetails } from '../types/feature-details.type';
import { Feature } from '../types/feature.type';

@Injectable({
  providedIn: 'root'
})
export class FeatureService {
  getFeatures(): Feature[] {
    const features = featureConfigs.features as Record<string, FeatureDetails>;
    const keys = Object.keys(features);

    const iconMap: Record<string, any> = {
      create: MagicWandIconComponent,
      edit: SparklesIconComponent,
      restoration: HistoryIconComponent,
      fuse: ScissorsIconComponent,
      figurine: CubeIconComponent,
      '3d-map': MapIconComponent,
    };

    return keys.reduce((acc, key) => {
      if (features[key]) {
        const feature = features[key];
        const { name, path } = feature;
        const icon = iconMap[key] || MagicWandIconComponent; // Default icon if not found in the map
        return acc.concat({ id: key, icon, name, path });
      }

      return acc;
    }, [] as Feature[]);
  }

  getFeature(featureId: string) {
    return this.getFeatures().find(f => f.id === featureId);
  }

  getFeatureName(featureId: string) {
    const feature = this.getFeature(featureId);
    if (feature) {
      return feature.name;
    }

    // Fallback for featureIds not present in the navigation service.
    // This mimics the previous title logic from the editor component.
    return featureId.charAt(0).toUpperCase() + featureId.slice(1).replace(/-/g, ' ');
  }

  getFeatureDetails(featureId: string): FeatureDetails {
    const features = featureConfigs.features as Record<string, FeatureDetails>;
    if (features[featureId]) {
      return features[featureId];
    }

    return {
      buttonText: 'Create',
      loadingText: 'Generating...',
      description: 'Select a feature to get started on your masterpiece.',
      name: 'Image Creation',
      path: '/editor/create',
    }
  }
}
