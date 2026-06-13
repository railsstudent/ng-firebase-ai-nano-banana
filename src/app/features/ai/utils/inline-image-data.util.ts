import { Base64InlineData } from '@/features/conversation/types/base64-inline-data.type';
import { GenerativeContentBlob, InlineDataPart } from 'firebase/ai';
import { GenerateImageParam } from '../types/generate-image-param.type';

async function fileToGenerativePart(file: File): Promise<InlineDataPart> {
  return await new Promise<InlineDataPart>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve({
      inlineData: {
        data: (reader.result! as string).split(',')[1],
        mimeType: file.type
      }
    });
    reader.readAsDataURL(file);
  });
}

export async function resolveImageParts(imageFiles?: File[]): Promise<InlineDataPart[]> {
  if (!imageFiles || !imageFiles.length) {
    return [];
  }

  const imagePartResults = await Promise.allSettled(
    imageFiles.map(file => fileToGenerativePart(file))
  );

  return imagePartResults
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);
}

export async function getBase64InlineData(imageFiles?: File[]) : Promise<Base64InlineData[]> {
  const parts = await resolveImageParts(imageFiles);

  return parts.map((part) => {
    const inlineData = part.inlineData;
    return {
      inlineData,
      base64: getBase64EncodedString(inlineData)
    }
  });
}

export function getBase64EncodedString({mimeType, data}: GenerativeContentBlob) {
  return `data:${mimeType};base64,${data}`;
}

export async function makeTemplateVaraibles({ imageFiles, aspectRatio, resolution }: GenerateImageParam) {
  const imageParts = await resolveImageParts(imageFiles);
  const inlineImages = imageParts.map(part => part.inlineData);
  return {
    inlineImages,
    aspectRatio,
    resolution
  }
}
