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
    return [
      { id: 'create', name: 'Image Creation', icon: MagicWandIconComponent, path: '/editor/create' },
      { id: 'edit', name: 'Image Editing', icon: SparklesIconComponent, mode: 'single', path: '/editor/edit' },
      { id: 'restoration', name: 'Photo Restoration', icon: HistoryIconComponent, mode: 'single', path: '/system-instruction/restoration' },
      { id: 'fuse', name: 'Fuse Photos', icon: ScissorsIconComponent, mode: 'multiple', path: '/editor/fuse' },
      { id: 'figurine', name: 'Figurine', icon: CubeIconComponent, mode: 'single', path: '/system-instruction/figurine' },
      { id: '3d-map', name: '3D Map', icon: MapIconComponent, mode: 'single', path: '/system-instruction/3d-map' },
      // { id: 'conversational', name: 'Conversational Image Editing', icon: MessageCircleIconComponent, mode: 'single' },
    ];
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
      name: 'Editor',
      path: '/editor/create',
    }
  }
}
