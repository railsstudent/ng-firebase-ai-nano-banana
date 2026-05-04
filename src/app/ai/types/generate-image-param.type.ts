export type TemplateParam = {
    templateId?: string;
    aspectRatio?: string;
    resolution?: string;
}

export type GenerateImageParam = {
   prompt?: string;
   imageFiles: File[];
   templateParam?: TemplateParam;
}
