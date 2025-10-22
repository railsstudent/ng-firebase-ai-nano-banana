import { InlineDataPart } from 'firebase/ai';

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

export async function resolveImageParts(imageFiles: File[]): Promise<InlineDataPart[]> {
  if (!imageFiles.length) {
    return [];
  }

  const imagePartResults = await Promise.allSettled(
    imageFiles.map(file => fileToGenerativePart(file))
  );
  return imagePartResults
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);
}
