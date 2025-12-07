import { MagicWandIconComponent } from '@/navigation/icons/icons.component';
import { FEATURES, MODELING_FEATURES, TEMPLATE_FEATURES } from '../constants/features.const';
import { FEATURE_ICON_MAP, MODEL_ICON_MAP, TEMPLATE_ICON_MAP } from '../constants/icon_map.const';
import { FeatureDetails } from '../types/feature-details.type';
import { Feature } from '../types/feature.type';

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

export function buildNavigationBars() {
  const PHOTO_EDIT_ITEMS = buildNavigationMap(FEATURES, FEATURE_ICON_MAP);
  const MODELING_ITEMS = buildNavigationMap(MODELING_FEATURES, MODEL_ICON_MAP);
  const TEMPLATE_ITEMS = buildNavigationMap(TEMPLATE_FEATURES, TEMPLATE_ICON_MAP);

  return [
      {
        id: 1,
        navName: 'Editor',
        menu: PHOTO_EDIT_ITEMS,
      },
      {
        id: 2,
        navName: 'Modeling',
        menu: MODELING_ITEMS,
      },
      {
        id: 3,
        navName: 'Templates',
        menu: TEMPLATE_ITEMS,
      }
  ];
}
