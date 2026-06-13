export type BaseGenerateParam = {
  aspectRatio?: string;
  resolution?: string;
  imageFiles: File[];
}

export type GenerateFromTemplate = BaseGenerateParam & {
  templateId: string;
}

export type GenerateFromPrompts = BaseGenerateParam & {
  prompts: string[];
}

export type GenerateImageParam = BaseGenerateParam &  {
  prompt?: string;
  templateId?: string;
}
