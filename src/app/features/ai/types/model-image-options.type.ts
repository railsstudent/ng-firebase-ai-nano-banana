import { GenerativeModel, Part, TemplateGenerativeModel } from 'firebase/ai';

export type Base64ImageOptions = {
  model: GenerativeModel;
  parts: Array<string | Part>;
}

export type TemplateImageOptions = {
  model: TemplateGenerativeModel;
  templateId: string;
  templateVariables: Record<string, unknown>
}

