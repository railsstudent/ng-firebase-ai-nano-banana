import { Injectable } from '@angular/core';
import { CubeIconComponent } from '../../navigation/icons/cube-icon.component';
import { HistoryIconComponent } from '../../navigation/icons/history-icon.component';
import { MagicWandIconComponent } from '../../navigation/icons/magic-wand-icon.component';
import { MapIconComponent } from '../../navigation/icons/map-icon.component';
import { ScissorsIconComponent } from '../../navigation/icons/scissors-icon.component';
import { SparklesIconComponent } from '../../navigation/icons/sparkles-icon.component';
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
    switch (featureId) {
      case 'create':
        return {
          buttonText: 'Create',
          loadingText: 'Creating image...',
          description: 'Generate new and unique images from text prompts using powerful AI models.'
        };
      case 'edit':
        return {
          buttonText: 'Edit',
          loadingText: 'Applying edits...',
          description: 'Use generative AI to edit your images with simple text prompts.'
        };
      case 'restoration':
        return {
          buttonText: 'Restore',
          loadingText: 'Restoring photo...',
          description: 'Bring old and damaged photos back to life by removing scratches and restoring color.'
        };
      case 'fuse':
        return {
          buttonText: 'Fuse',
          loadingText: 'Fusing images...',
          description: 'Creatively merge multiples photos into a single, artistic masterpiece.'
        };
      case 'figurine':
        return {
          buttonText: 'Make a toy',
          loadingText: 'Generating 3D model...',
          description: 'Transform your 2D images into 3D models ready for any project.'
        };
      case 'conversational':
        return {
          buttonText: 'Create',
          loadingText: 'Thinking...',
          description: 'Edit your photos by simply having a conversation and describing what you want.'
        };
      case '3d-map':
        return {
          buttonText: 'Make a 3D map',
          loadingText: 'Generating 3D map...',
          description: 'Transform your 2D maps into 3D models ready for any project.'
        };
      default:
        return {
          buttonText: 'Create',
          loadingText: 'Generating...',
          description: 'Select a feature to get started on your masterpiece.'
        };
    }
  }
}
