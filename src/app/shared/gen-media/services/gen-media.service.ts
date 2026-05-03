import { Metadata, MetadataGroup } from '@/ai/types/grounding-metadata.type';
import { ImagesWithTokenUsage, ImageTokenUsage } from '@/ai/types/image-response.type';
import { TokenUsage } from '@/ai/types/token-usage.type';
import { DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { IMAGE_GENERATOR_TOKEN } from '../constants/image-generator.token';
import { DEFAULT_IMAGES_TOKEN_USAGE } from '../constants/images-token-usage.const';

@Injectable({
  providedIn: 'root'
})
export class GenMediaService {
  private readonly document = inject(DOCUMENT);
  private readonly imageGenerator = inject(IMAGE_GENERATOR_TOKEN);

  imageGenerationError = signal('');

  downloadImage(filename: string, imageUrl: string): void {
      if (!imageUrl) {
        return;
      }

      const link = this.document.createElement('a');
      link.href = imageUrl;

      // Create a filename from the prompt
      const safeFilename = filename
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase().substring(0, 50);

      link.download = `${safeFilename}.png`;
      this.document.body.appendChild(link);
      link.click();
      this.document.body.removeChild(link);
  }

  #currentStep = signal(0);
  currentStep = this.#currentStep.asReadonly();

  private async generateImage(prompt: string, imageFiles: File[], step = 0): Promise<ImageTokenUsage | undefined> {
    this.#currentStep.set(step);

    if (!prompt || !prompt.trim()) {
      return undefined;
    }

    const trimmedPrompt = prompt.trim();
    console.log('Prompt', trimmedPrompt);

    try {
      return await this.imageGenerator.generateImage(trimmedPrompt, imageFiles);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        throw e;
      } else {
        throw new Error('Unexpected error in image generation.')
      }
    }
  }

  #currentImagesAccumulator = signal<ImagesWithTokenUsage>(DEFAULT_IMAGES_TOKEN_USAGE);
  currentFinishedImages = this.#currentImagesAccumulator.asReadonly();

  async streamImages(prompts: string[], imageFiles: File[]): Promise<void> {

    this.#currentImagesAccumulator.set(DEFAULT_IMAGES_TOKEN_USAGE);
    let isFirstError = false;
    this.imageGenerationError.set('');

    if (!prompts?.length) {
      return;
    }

    for (let i = 0; i < prompts.length; i=i+1) {
      try {
        const imageTokenUsage = await this.generateImage(prompts[i], imageFiles, i + 1);

        if (imageTokenUsage) {
          this.#currentImagesAccumulator.update(({ images, tokenUsage, groundingMetadata, thoughtSummary }) => {
            return {
              images: images.concat({
                ...imageTokenUsage?.image,
                id: i
              }),
              tokenUsage: this.calculateTokenUsage(tokenUsage, imageTokenUsage.tokenUsage),
              groundingMetadata: this.concatGrounding(groundingMetadata, imageTokenUsage.metadata),
              thoughtSummary: imageTokenUsage.thoughtSummary ? thoughtSummary.concat(imageTokenUsage.thoughtSummary) : thoughtSummary
            }
          });
        }
      } catch (e) {
        if (!isFirstError) {
          if (e instanceof Error) {
            this.imageGenerationError.set(e.message);
          } else {
            this.imageGenerationError.set('Unexpected error in image generation.');
          }
          isFirstError = true;
        }
      }
    }
  }

  clearImage(id: number) {
    this.#currentImagesAccumulator.update((item) => {
      const updatedImages = item.images.filter((item) => item.id !== id)

      return {
        ...item,
        images: updatedImages,
      }
    });
  }

  private concatGrounding(groundingMetadata: MetadataGroup, metadata: Metadata): MetadataGroup {
    const newRenderedContents = metadata.renderedContent ? groundingMetadata.renderedContents.concat(metadata.renderedContent) : groundingMetadata.renderedContents;

    return {
      searchQueries: groundingMetadata.searchQueries.concat(metadata.searchQueries),
      citations: groundingMetadata.citations.concat(metadata.citations),
      renderedContents: newRenderedContents,
    };
  }

  private calculateTokenUsage(tokenUsage: TokenUsage, otherTokenUsage: TokenUsage): TokenUsage {
    return {
      outputTokenCount: tokenUsage.outputTokenCount + otherTokenUsage.outputTokenCount,
      promptTokenCount: tokenUsage.promptTokenCount + otherTokenUsage.promptTokenCount,
      thoughtTokenCount: tokenUsage.thoughtTokenCount + otherTokenUsage.thoughtTokenCount,
      totalTokenCount: tokenUsage.totalTokenCount + otherTokenUsage.totalTokenCount,
    };
  }
}
