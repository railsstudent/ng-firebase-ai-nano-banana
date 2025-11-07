import { Base64InlineData } from '@/conversation/types/base64-inline-data.type';
import { GenerativeContentBlob, InlineDataPart } from '@angular/fire/ai';

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
