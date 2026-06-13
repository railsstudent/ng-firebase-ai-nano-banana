import { GenerateFromPrompts, GenerateFromTemplate, GenerateImageParam } from '@/features/ai/types/generate-image-param.type';
import { Metadata, MetadataGroup } from '@/features/ai/types/grounding-metadata.type';
import { ImagesWithTokenUsage, ImageTokenUsage } from '@/features/ai/types/image-response.type';
import { TokenUsage } from '@/features/ai/types/token-usage.type';
import { DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { IMAGE_GENERATOR_TOKEN } from '../constants/image-generator.token';
import { DEFAULT_IMAGES_TOKEN_USAGE } from '../constants/images-token-usage.const';

@Injectable({
  providedIn: 'root'
})
export class GenMediaService {
  private readonly document = inject(DOCUMENT);
  private readonly imageGenerator = inject(IMAGE_GENERATOR_TOKEN);

  #currentStep = signal(0);
  currentStep = this.#currentStep.asReadonly();

  #currentImagesAccumulator = signal<ImagesWithTokenUsage>(DEFAULT_IMAGES_TOKEN_USAGE);
  currentFinishedImages = this.#currentImagesAccumulator.asReadonly();

  #imageGenerationError = signal('');
  imageGenerationError = this.#imageGenerationError.asReadonly();

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

  private async generateImage(param: GenerateImageParam, step = 0): Promise<ImageTokenUsage | undefined> {
    this.#currentStep.set(step);

    const { prompt, templateId } = param;
    const promptOrTemplateId = prompt || templateId || '';
    console.log('promptOrTemplateId', promptOrTemplateId);

    return promptOrTemplateId ? await this.imageGenerator.generateImage(param) : undefined;
  }

  async generateFromTemplate(generateImageParam: GenerateFromTemplate): Promise<void> {
    this.#currentImagesAccumulator.set(DEFAULT_IMAGES_TOKEN_USAGE);
    this.#imageGenerationError.set('');

    try {
      const imageTokenUsage = await this.generateImage(generateImageParam);
      if (imageTokenUsage) {
        this.appendFinishedImage(imageTokenUsage);
      }
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : 'Unexpected error in image generation.'
      this.#imageGenerationError.set(msg);
    }
  }

  async generateFromPrompts(generateImageParam: GenerateFromPrompts): Promise<void> {

    this.#currentImagesAccumulator.set(DEFAULT_IMAGES_TOKEN_USAGE);
    let isFirstError = false;
    this.#imageGenerationError.set('');

    const prompts = generateImageParam.prompts;
    if (!prompts?.length) {
      return;
    }

    for (const [i, prompt] of prompts.entries()) {
      try {
        const imageTokenUsage = await this.generateImage({
          prompt: prompt.trim(),
          imageFiles: generateImageParam.imageFiles,
          aspectRatio: generateImageParam.aspectRatio,
          resolution: generateImageParam.resolution
        }, i + 1);

        if (imageTokenUsage) {
          this.appendFinishedImage(imageTokenUsage, i);
        }
      } catch (e) {
        if (!isFirstError) {
          if (e instanceof Error) {
            this.#imageGenerationError.set(e.message);
          } else {
            this.#imageGenerationError.set('Unexpected error in image generation.');
          }
          isFirstError = true;
        }
      }
    }
  }

  private appendFinishedImage(imageTokenUsage: ImageTokenUsage, id = 1) {
    this.#currentImagesAccumulator.update(({ images, tokenUsage, groundingMetadata, thoughtSummary }) => {
      return {
        images: images.concat({
          ...imageTokenUsage?.image,
          id,
        }),
        tokenUsage: this.calculateTokenUsage(tokenUsage, imageTokenUsage.tokenUsage),
        groundingMetadata: this.concatGrounding(groundingMetadata, imageTokenUsage.metadata),
        thoughtSummary: imageTokenUsage.thoughtSummary ? thoughtSummary.concat(imageTokenUsage.thoughtSummary) : thoughtSummary
      };
    });
  }

  clearImage(id: number) {
    this.#currentImagesAccumulator.update((holder) => {
      const updatedImages = holder.images.filter((image) => image.id !== id)

      return {
        ...holder,
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
