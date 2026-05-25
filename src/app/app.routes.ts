import { ServerTemplateService } from '@/features/ai/services/server-template.service';
import { IMAGE_GENERATOR_TOKEN } from '@/shared/ui/gen-media/constants/image-generator.token';
import { GenMediaService } from '@/shared/ui/gen-media/services/gen-media.service';
import { Routes } from '@angular/router';
import { featureNameResolver, featureResolver } from './resolvers/feature-name.resolver';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component'),
    title: 'Home'
  },
  {
    path: 'conversation',
    loadComponent: () => import('./features/conversation/conversation-edit.component'),
    title: 'Conversation Editing',
  },
  {
    path: 'visual-story',
    loadComponent: () => import('./visual-story/visual-story.component'),
    title: 'Visual Story',
  },
  {
    path: 'predefined-prompt/:featureId',
    loadComponent: () => import('./features/predefined-prompt-editor/predefined-prompt-editor.component'),
    title: featureNameResolver,
    resolve: {
      feature: featureResolver,
    },
  },
  {
    path: 'template-prompt/:featureId',
    loadComponent: () => import('./features/predefined-prompt-editor/predefined-prompt-editor.component'),
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
    loadComponent: () => import('./features/editor/editor.component'),
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
