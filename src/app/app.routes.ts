import { Routes } from '@angular/router';
import { systemInstructionResolver } from './editor/resolvers/system-instruction.resolver';
import { featureNameResolver } from './feature/resolvers/feature-name.resolver';

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
      featureName: featureNameResolver,
      systemInstruction: systemInstructionResolver,
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
