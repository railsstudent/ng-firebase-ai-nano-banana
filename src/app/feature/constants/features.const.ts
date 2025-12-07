import featureConfigs from '../features.json';
import { FeatureDetails } from '../types/feature-details.type';

export const FEATURES = featureConfigs.features as Record<string, FeatureDetails>;
export const MODELING_FEATURES = featureConfigs.modeling as Record<string, FeatureDetails>;
export const TEMPLATE_FEATURES = featureConfigs.templates as Record<string, FeatureDetails>;

export const FEATURE_NESTED_LIST = [
  FEATURES,
  MODELING_FEATURES,
  TEMPLATE_FEATURES
];

export const DEFAULT_FEATURE = featureConfigs.features.create;
