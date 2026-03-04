import { signal } from '@angular/core';
import { DEFAULT_VISUAL_STORY_FORM_VALUES } from '../constants/visual-story-form-values.const';
import { VisualStoryForm } from '../types/visual-story-form.type';

export const VisualStoryModel = signal<VisualStoryForm>(DEFAULT_VISUAL_STORY_FORM_VALUES);
