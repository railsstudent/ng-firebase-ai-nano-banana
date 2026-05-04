import { TemplateParam } from '@/ai/types/generate-image-param.type';

export type GenMediaInput = {
  userPrompt?: string;
  prompts?: string[];
  imageFiles?: File[];
  templateParam?: TemplateParam;
}
