import { Routes } from '@angular/router';
import { featureNameResolver } from './navigation/resolvers/feature-name.resolver';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.component'),
    title: 'Home'
  },
  {
    path: 'editor/restoration',
    loadComponent: () => import('./system-instruction-editor/system-instruction-editor.component'),
    title: featureNameResolver,
    resolve: {
      featureName: featureNameResolver,
    },
  },
  {
    path: 'editor/:featureId',
    loadComponent: () => import('./editor/editor.component'),
    title: featureNameResolver,
    resolve: {
      featureName: featureNameResolver,
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
