import { Injectable } from '@angular/core';
import { CubeIconComponent } from '../icons/cube-icon.component';
import { HistoryIconComponent } from '../icons/history-icon.component';
import { MagicWandIconComponent } from '../icons/magic-wand-icon.component';
import { MessageCircleIconComponent } from '../icons/message-circle-icon.component';
import { ScissorsIconComponent } from '../icons/scissors-icon.component';
import { SparklesIconComponent } from '../icons/sparkles-icon.component';
import { FeatureDetails } from '../types/feature-details.type';
import { Feature } from '../types/feature.type';

@Injectable({
  providedIn: 'root'
})
export class FeatureService {
  getFeatures(): Feature[] {
    return [
      { id: 'create', name: 'Image Creation', icon: MagicWandIconComponent },
      { id: 'edit', name: 'Image Editing', icon: SparklesIconComponent, mode: 'single' },
      { id: 'restoration', name: 'Photo Restoration', icon: HistoryIconComponent, mode: 'single' },
      { id: 'fuse', name: 'Fuse Photos', icon: ScissorsIconComponent, mode: 'multiple' },
      { id: 'figurine', name: '3D Figurine', icon: CubeIconComponent, mode: 'single' },
      { id: 'conversational', name: 'Conversational Image Editing', icon: MessageCircleIconComponent, mode: 'single' },
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
          description: 'Creatively merge two photos into a single, artistic masterpiece.'
        };
      case '3d-model':
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
      default:
        return {
          buttonText: 'Create',
          loadingText: 'Generating...',
          description: 'Select a feature to get started on your masterpiece.'
        };
    }
  }
}
