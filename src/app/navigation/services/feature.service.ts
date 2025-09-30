import { Injectable } from '@angular/core';
import { MagicWandIconComponent } from '../icons/magic-wand-icon.component';
import { SparklesIconComponent } from '../icons/sparkles-icon.component';
import { HistoryIconComponent } from '../icons/history-icon.component';
import { ScissorsIconComponent } from '../icons/scissors-icon.component';
import { CubeIconComponent } from '../icons/cube-icon.component';
import { MessageCircleIconComponent } from '../icons/message-circle-icon.component';
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

  getFeatureName(featureId: string) {
    const feature = this.getFeatures().find(f => f.id === featureId);
    if (feature) {
      return feature.name;
    }

    // Fallback for featureIds not present in the navigation service.
    // This mimics the previous title logic from the editor component.
    return featureId.charAt(0).toUpperCase() + featureId.slice(1).replace(/-/g, ' ');
  }
}
