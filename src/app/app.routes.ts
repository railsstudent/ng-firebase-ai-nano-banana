import { Routes } from '@angular/router';
import { ServerTemplateService } from './ai/services/server-template.service';
import { featureNameResolver, featureResolver } from './resolvers/feature-name.resolver';
import { IMAGE_GENERATOR_TOKEN } from './shared/gen-media/constants/image-generator.token';
import { GenMediaService } from './shared/gen-media/services/gen-media.service';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.component'),
    title: 'Home'
  },
  {
    path: 'conversation',
    loadComponent: () => import('./conversation/conversation-edit.component'),
    title: 'Conversation Editing',
  },
  {
    path: 'visual-story',
    loadComponent: () => import('./visual-story/visual-story.component'),
    title: 'Visual Story',
  },
  {
    path: 'predefined-prompt/:featureId',
    loadComponent: () => import('./predefined-prompt-editor/predefined-prompt-editor.component'),
    title: featureNameResolver,
    resolve: {
      feature: featureResolver,
    },
  },
  {
    path: 'template-prompt/:featureId',
    loadComponent: () => import('./predefined-prompt-editor/predefined-prompt-editor.component'),
    providers: [
      GenMediaService,
      { provide: IMAGE_GENERATOR_TOKEN, useExisting: ServerTemplateService }
    ],
    title: featureNameResolver,
    resolve: {
      feature: featureResolver,
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
