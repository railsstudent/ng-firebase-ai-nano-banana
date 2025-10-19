import { Injectable } from '@angular/core';
import {
  ChatIconComponent,
  CubeIconComponent,
  DomeIconComponent,
  GlassBottleIconComponent,
  HistoryIconComponent,
  MagicWandIconComponent,
  MapIconComponent,
  ScissorsIconComponent,
  SparklesIconComponent
} from '../../navigation/icons/icons.component';
import featureConfigs from '../features.json';
import { FeatureDetails } from '../types/feature-details.type';
import { Feature } from '../types/feature.type';

const features = featureConfigs.features as Record<string, FeatureDetails>;
const modeling_features = featureConfigs.modeling as Record<string, FeatureDetails>;

function buildNavigationMap(features: Record<string, FeatureDetails>, iconMap: Record<string, any>): Feature[] {
  const keys = Object.keys(features);

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

function buildPhotoEditNavigationMap(): Feature[] {
  const iconMap: Record<string, any> = {
    create: MagicWandIconComponent,
    edit: SparklesIconComponent,
    restoration: HistoryIconComponent,
    fuse: ScissorsIconComponent,
    'visual-story': HistoryIconComponent,
    conversation: ChatIconComponent,
  };

  return buildNavigationMap(features, iconMap);
}

function buildModelingNavigationMap(): Feature[] {
  const iconMap: Record<string, any> = {
    figurine: CubeIconComponent,
    '3d-map': MapIconComponent,
    bottle:  GlassBottleIconComponent,
    dome: DomeIconComponent,
  };

  return buildNavigationMap(modeling_features, iconMap);
}

const PHOTO_EDIT_ITEMS = buildPhotoEditNavigationMap();
const MODELING_ITEMS = buildModelingNavigationMap();

@Injectable({
  providedIn: 'root'
})
export class FeatureService {
  getPhotoEditItems(): Feature[] {
    return PHOTO_EDIT_ITEMS;
  }

  getModelingItems(): Feature[] {
    return MODELING_ITEMS;
  }

  getFeatureName(featureId: string) {
    const editItem = PHOTO_EDIT_ITEMS.find(f => f.id === featureId);
    if (editItem) {
      return editItem.name;
    }

    const modelingItem = MODELING_ITEMS.find(f => f.id === featureId);
    if (modelingItem) {
      return modelingItem.name;
    }

    // Fallback for featureIds not present in the navigation service.
    // This mimics the previous title logic from the editor component.
    return featureId.charAt(0).toUpperCase() + featureId.slice(1).replace(/-/g, ' ');
  }

  getFeatureDetails(featureId: string): FeatureDetails {
    if (features[featureId]) {
      return features[featureId];
    }

    if (modeling_features[featureId]) {
      return modeling_features[featureId];
    }

    return featureConfigs.features.create;
  }
}
