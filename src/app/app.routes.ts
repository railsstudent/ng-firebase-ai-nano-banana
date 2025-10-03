import { Routes } from '@angular/router';
import { customPromptResolver } from './resolvers/custom-prompt.resolver';
import { featureNameResolver, featureResolver } from './resolvers/feature-name.resolver';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.component'),
    title: 'Home'
  },
  {
    path: 'system-instruction/:featureId',
    loadComponent: () => import('./system-instruction-editor/system-instruction-editor.component'),
    title: featureNameResolver,
    resolve: {
      feature: featureResolver,
      customPrompt: customPromptResolver,
    },
  },
  {
    path: 'editor/:featureId',
    loadComponent: () => import('./editor/editor.component'),
    title: featureNameResolver,
    resolve: {
      feature: featureResolver,
    },
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'home',
  }
];
