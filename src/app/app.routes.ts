import { Routes } from '@angular/router';
import { featureNameResolver } from './navigation/resolvers/feature-name.resolver';
import { restorationResolver } from './navigation/resolvers/restoration.resolver';
import { figurineResolver } from './navigation/resolvers/figurine.resolver';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.component'),
    title: 'Home'
  },
  {
    path: 'editor/restoration',
    loadComponent: () => import('./system-instruction-editor/system-instruction-editor.component'),
    title: 'Photo Restoration',
    data: {
      featureId: 'restoration'
    },
    resolve: {
      featureName: restorationResolver,
    },
  },
  {
    path: 'editor/figurine',
    loadComponent: () => import('./system-instruction-editor/system-instruction-editor.component'),
    title: 'Figurine',
    data: {
      featureId: 'figurine'
    },
    resolve: {
      featureName: figurineResolver,
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
