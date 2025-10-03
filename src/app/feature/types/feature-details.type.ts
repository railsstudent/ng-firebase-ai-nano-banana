export type FeatureDetails = {
  buttonText: string;
  loadingText: string;
  description: string;
  customPrompt?: string;
  name: string;
  path: string;
  mode?: 'single' | 'multiple'
};
